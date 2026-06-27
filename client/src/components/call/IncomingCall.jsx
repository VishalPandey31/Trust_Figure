import useCallStore from "../../store/useCallStore";

function IncomingCall() {
    const incomingCall = useCallStore(state => state.incomingCall);
    const acceptCall = useCallStore(state => state.acceptCall);
    const rejectCall = useCallStore(state => state.rejectCall);

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999] animate-fade-in">
            <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl text-center max-w-xs w-full shadow-2xl animate-slide-up">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#6c63ff] to-[#00d4ff] rounded-full flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
                    📞
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                    Incoming Call
                </h2>

                <p className="text-gray-400 text-sm mb-6">
                    Incoming {incomingCall.callType} call...
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={acceptCall}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl transition shadow-lg shadow-green-500/20 cursor-pointer"
                    >
                        Accept
                    </button>

                    <button
                        onClick={rejectCall}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl transition shadow-lg shadow-red-500/20 cursor-pointer"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
}

export default IncomingCall;