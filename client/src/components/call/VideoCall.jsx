import { useEffect, useRef, useState } from "react";
import useCallStore from "../../store/useCallStore";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Maximize } from "lucide-react";

function VideoCall() {
    const {
        callStatus,
        callType,
        localStream,
        remoteStream,
        endCall,
        isMuted,
        isVideoMuted,
        isScreenSharing,
        toggleMute,
        toggleVideo,
        startScreenShare,
    } = useCallStore();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const containerRef = useRef(null);
    const [seconds, setSeconds] = useState(0);

    // Attach local stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(console.error);
        }
    }, [remoteStream]);

    // Call Timer
    useEffect(() => {
        let interval;
        if (callStatus === "connected") {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    if (callStatus === null || callType !== "video") return null;

    return (
        <div ref={containerRef} className="fixed inset-0 bg-black/95 z-50 flex flex-col">
            
            {/* Header */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-10">
                <div className="text-white">
                    <h2 className="text-xl font-semibold">Video Call</h2>
                    <p className="text-gray-300 text-sm">
                        {callStatus === "calling" && "Calling..."}
                        {callStatus === "ringing" && "Ringing..."}
                        {callStatus === "connected" && formatTime()}
                    </p>
                </div>
                <button onClick={toggleFullScreen} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition">
                    <Maximize size={20} />
                </button>
            </div>

            {/* Videos Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                {/* Remote Video (Big) */}
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        className="w-full h-full object-contain rounded-xl"
                    />
                ) : (
                    <div className="text-white text-xl animate-pulse">
                        {callStatus === "calling" ? "Waiting for answer..." : "Connecting..."}
                    </div>
                )}

                {/* Local Video (Small PiP) */}
                {localStream && (
                    <div className="absolute bottom-24 right-4 w-32 md:w-48 aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted // Always mute local video playback
                            className="w-full h-full object-cover"
                        />
                        {isVideoMuted && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <VideoOff className="text-gray-500" size={24} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 w-full p-4 md:p-6 flex justify-center gap-2 md:gap-4 bg-gradient-to-t from-black/80 to-transparent flex-wrap">
                <button
                    onClick={toggleMute}
                    className={`p-3 md:p-4 rounded-full transition ${isMuted ? 'bg-red-500/80 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'} text-white`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                
                <button
                    onClick={toggleVideo}
                    className={`p-3 md:p-4 rounded-full transition ${isVideoMuted ? 'bg-red-500/80 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'} text-white`}
                >
                    {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
                </button>

                <button
                    onClick={startScreenShare}
                    disabled={isScreenSharing}
                    className={`p-3 md:p-4 rounded-full transition ${isScreenSharing ? 'bg-green-500/80' : 'bg-white/10 hover:bg-white/20'} text-white disabled:opacity-50 hidden sm:block`}
                >
                    <MonitorUp size={24} />
                </button>

                <button
                    onClick={endCall}
                    className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition ml-2 md:ml-4"
                >
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
}

export default VideoCall;
