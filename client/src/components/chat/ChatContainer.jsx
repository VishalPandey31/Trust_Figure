import { Phone, Video as VideoIcon, ArrowLeft } from "lucide-react";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import useCallStore from "../../store/useCallStore";
import { useEffect, useState, useRef } from "react";
import socket from "../../socket/socket";
import { requestNotificationPermission, showNotification } from "../../utils/notifications";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

function ChatContainer() {

  const { 
    messages, 
    selectedUser, 
    setSelectedUser,
    subscribeToMessages, 
    unsubscribeFromMessages,
    isMessagesLoading
  } = useChatStore();
  const { authUser } = useAuthStore();

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    requestNotificationPermission();

    socket.on("userTyping", ({ senderId }) => {
        if (selectedUser && senderId === selectedUser._id) setIsTyping(true);
    });

    socket.on("userStopTyping", ({ senderId }) => {
        if (selectedUser && senderId === selectedUser._id) setIsTyping(false);
    });

    subscribeToMessages();

    return () => {
        socket.off("userTyping");
        socket.off("userStopTyping");
        unsubscribeFromMessages();
    };
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages]);

  const initiateCall = useCallStore((state) => state.initiateCall);

  const handleVoiceCall = async () => {
    if (!selectedUser) return;
    await initiateCall(selectedUser._id, "voice");
  };

  const handleVideoCall = async () => {
    if (!selectedUser) return;
    await initiateCall(selectedUser._id, "video");
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a2e]/50 border-l border-white/10">
        <p className="text-gray-400">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-3 md:px-5 shrink-0">

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/10 transition text-gray-300"
            onClick={() => setSelectedUser(null)}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold truncate max-w-[120px] md:max-w-none">{selectedUser.fullName}</h2>
            <p className="text-xs text-gray-400">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleVoiceCall}
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <Phone size={20} />
          </button>
          
          <button
            onClick={handleVideoCall}
            className="p-3 rounded-full bg-[#6c63ff] text-white hover:bg-[#5a52d5] transition"
          >
            <VideoIcon size={20} />
          </button>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 relative">
        {isMessagesLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading messages...</div>
        ) : (
            <>
                {messages.map((msg) => {
                    const myId = authUser?._id?.toString() || authUser?.id?.toString();
                    const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
                    const isMe = senderId === myId;
                    return (
                    <MessageBubble
                        key={msg._id}
                        message={{
                            text: msg.content,
                            sender: isMe ? "me" : "other",
                            mediaUrl: msg.mediaUrl,
                            messageType: msg.messageType,
                            createdAt: msg.createdAt
                        }}
                    />
                    );
                })}

                {isTyping && (
                <div className="text-sm text-gray-400 italic absolute bottom-4 left-4 animate-pulse">
                    {selectedUser.fullName.split(" ")[0]} is typing...
                </div>
                )}
                
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* Input */}
      <MessageInput receiverId={selectedUser._id} />

    </div>
  );
}

export default ChatContainer;