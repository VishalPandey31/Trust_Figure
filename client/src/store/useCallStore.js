import { create } from "zustand";
import { createPeer } from "../utils/webrtc";
import socket from "../socket/socket";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const useCallStore = create((set, get) => ({
    // ==========================
    // Call State
    // ==========================
    callStatus: null,
    caller: null,
    receiver: null,
    callType: null,
    isMuted: false,
    isVideoMuted: false,
    isScreenSharing: false,
    startedAt: null,

    // ==========================
    // Streams
    // ==========================
    localStream: null,
    remoteStream: null,

    // ==========================
    // Peer
    // ==========================
    peer: null,

    // ==========================
    // Incoming Call
    // ==========================
    incomingCall: null,

    // ==========================
    // Socket Initialization
    // ==========================
    initializeSocket: () => {
        socket.off("incomingCall");
        socket.off("callAccepted");
        socket.off("callRejected");
        socket.off("callEnded");

        socket.on("incomingCall", (data) => {
            console.log("Incoming Call", data);
            set({
                incomingCall: data,
                caller: data.from,
                callType: data.callType,
                callStatus: "ringing",
            });
        });

        socket.on("callAccepted", ({ signal }) => {
            console.log("Call Accepted");
            const { peer } = get();
            if (peer) {
                peer.signal(signal);
            }
            set({ startedAt: new Date() });
        });

        socket.on("callRejected", () => {
            alert("Call Rejected");
            get().resetCall();
        });

        socket.on("callEnded", () => {
            alert("Call Ended");
            get().resetCall();
        });
    },

    // ==========================
    // Setters
    // ==========================
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setPeer: (peer) => set({ peer }),
    setIncomingCall: (data) => set({ incomingCall: data }),
    setCallStatus: (status) => set({ callStatus: status }),
    setCaller: (caller) => set({ caller }),
    setReceiver: (receiver) => set({ receiver }),
    setCallType: (type) => set({ callType: type }),

    // ==========================
    // Media Controls
    // ==========================
    toggleMute: () => {
        const { localStream, isMuted } = get();
        if (!localStream) return;
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = isMuted;
        });
        set({ isMuted: !isMuted });
    },

    toggleVideo: () => {
        const { localStream, isVideoMuted } = get();
        if (!localStream) return;
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = isVideoMuted;
        });
        set({ isVideoMuted: !isVideoMuted });
    },

    startScreenShare: async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            const { peer, localStream } = get();
            if (peer) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = peer.streams[0]?.getVideoTracks()[0];
                if (sender) {
                    peer.replaceTrack(sender, videoTrack, localStream);
                }
            }
            
            screenStream.getVideoTracks()[0].onended = () => {
                const { peer: currentPeer, localStream: currentLocalStream } = get();
                if (currentPeer && currentLocalStream) {
                    const originalVideoTrack = currentLocalStream.getVideoTracks()[0];
                    const currentSender = currentPeer.streams[0]?.getVideoTracks()[0];
                    if (originalVideoTrack && currentSender) {
                        currentPeer.replaceTrack(currentSender, originalVideoTrack, currentLocalStream);
                    }
                }
                set({ isScreenSharing: false });
            };
            
            set({ isScreenSharing: true });
        } catch (error) {
            console.log("Screen share error:", error);
        }
    },

    // ==========================
    // Start Call
    // ==========================
    initiateCall: async (receiverId, type = "voice") => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === "video",
            });

            const peer = createPeer(true, stream);

            set({
                localStream: stream,
                peer,
                receiver: receiverId,
                callStatus: "calling",
                callType: type,
                isVideoMuted: type === "voice",
            });

            peer.on("signal", (signal) => {
                console.log("Sending Offer");
                socket.emit("callUser", {
                    to: receiverId,
                    signal,
                    callType: type,
                });
            });

            peer.on("connect", () => {
                console.log("Peer Connected (Initiator)");
                set({ callStatus: "connected" });
            });

            peer.on("stream", (remoteStream) => {
                console.log("Remote Stream Connected (Initiator)");
                set({
                    remoteStream,
                });
            });
        } catch (error) {
            console.log("WebRTC Media Error (initiate):", error);
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Camera/Mic not found! If testing on 2 PCs, browsers block it without HTTPS.");
            } else {
                let msg = "Webcam or Microphone is blocked, in use, or not available.";
                if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                    msg = "No camera or microphone found on this device!";
                } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                    msg = "Permission denied! Please allow camera/mic access.";
                } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
                    msg = "Camera/Mic is already in use by another app (like Zoom).";
                }
                toast.error(`Error: ${msg} (${error.name})`);
            }
        }
    },

    // ==========================
    // Accept Call
    // ==========================
    acceptCall: async () => {
        try {
            const { incomingCall } = get();
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: incomingCall.callType === "video",
            });

            const peer = createPeer(false, stream);

            set({
                localStream: stream,
                peer,
                receiver: incomingCall.from,
                startedAt: new Date(),
                isVideoMuted: incomingCall.callType === "voice",
            });

            peer.on("signal", (answer) => {
                console.log("Sending Answer");
                socket.emit("acceptCall", {
                    to: incomingCall.from,
                    signal: answer,
                });
            });

            peer.on("connect", () => {
                console.log("Peer Connected (Receiver)");
                set({ 
                    callStatus: "connected",
                    incomingCall: null,
                });
            });

            peer.on("stream", (remoteStream) => {
                console.log("Remote Stream Connected (Receiver)");
                set({
                    remoteStream,
                });
            });

            peer.signal(incomingCall.signal);
        } catch (error) {
            console.log("WebRTC Media Error (accept):", error);
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Camera/Mic not found! If testing on 2 PCs, browsers block it without HTTPS.");
            } else {
                let msg = "Failed to access camera/mic to answer.";
                if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                    msg = "No camera or microphone found on this device!";
                } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                    msg = "Permission denied! Please allow camera/mic access.";
                } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
                    msg = "Camera/Mic is already in use by another app.";
                }
                toast.error(`Error: ${msg} (${error.name})`);
            }
        }
    },

    // ==========================
    // Reject Call
    // ==========================
    rejectCall: () => {
        const { incomingCall } = get();
        socket.emit("rejectCall", {
            to: incomingCall.from,
        });
        set({
            incomingCall: null,
            callStatus: null,
        });
    },

    // ==========================
    // End Call
    // ==========================
    endCall: async () => {
        const { receiver, callType, startedAt } = get();
        
        socket.emit("endCall", {
            to: receiver,
        });

        // Save Call History
        if (startedAt && receiver) {
            try {
                await axiosInstance.post("/call", {
                    receiver,
                    type: callType,
                    status: "completed",
                    startedAt,
                    endedAt: new Date(),
                });
            } catch (error) {
                console.log("Error saving call history:", error);
            }
        }

        get().resetCall();
    },

    // ==========================
    // Reset
    // ==========================
    resetCall: () => {
        const { peer, localStream } = get();
        if (peer) {
            peer.destroy();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        set({
            callStatus: null,
            caller: null,
            receiver: null,
            callType: null,
            isMuted: false,
            isVideoMuted: false,
            isScreenSharing: false,
            localStream: null,
            remoteStream: null,
            peer: null,
            incomingCall: null,
            startedAt: null,
        });
    },
}));

export default useCallStore;