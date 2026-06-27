import { useEffect, useRef, useState } from "react";
import useCallStore from "../../store/useCallStore";
import { Mic, MicOff, PhoneOff } from "lucide-react";

function VoiceCall() {
    const {
        callStatus,
        callType,
        remoteStream,
        endCall,
        isMuted,
        toggleMute,
    } = useCallStore();

    const remoteAudioRef = useRef(null);
    const [seconds, setSeconds] = useState(0);

    // Remote Audio
    useEffect(() => {
        if (remoteAudioRef.current && remoteStream) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch((err) => {
                console.log(err);
            });
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

    if (callStatus === null || callType !== "voice") return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 w-96 text-center shadow-2xl relative overflow-hidden">
                
                {/* Avatar/Pulse Effect */}
                <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-[#6c63ff] to-[#00d4ff] rounded-full flex items-center justify-center text-4xl mb-6 relative">
                    👤
                    {callStatus !== "connected" && (
                        <div className="absolute inset-0 border-2 border-[#00d4ff] rounded-full animate-ping opacity-75"></div>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    Voice Call
                </h2>

                <p className="text-gray-400 text-lg mb-8">
                    {callStatus === "calling" && "Calling..."}
                    {callStatus === "ringing" && "Ringing..."}
                    {callStatus === "connected" && formatTime()}
                </p>

                {/* Remote Audio */}
                <audio ref={remoteAudioRef} autoPlay />

                {/* Controls */}
                <div className="flex justify-center gap-6">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    
                    <button
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VoiceCall;