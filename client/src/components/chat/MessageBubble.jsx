function MessageBubble({ message }) {
  const time = message.createdAt 
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div
      className={`flex animate-slide-up ${
        message.sender === "me" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-3 py-2 rounded-lg max-w-xs flex flex-col gap-2 ${
          message.sender === "me"
            ? "bg-[#6c63ff]"
            : "bg-white/10"
        }`}
      >
        {(message.messageType === "image" || message.mediaUrl) && (
          <img
            src={message.mediaUrl}
            alt="Message Attachment"
            className="w-full max-w-[200px] rounded-md object-cover"
          />
        )}
        <div className="flex justify-between items-end gap-3">
          {message.text && <span className="text-sm">{message.text}</span>}
          {time && (
            <span className={`text-[10px] whitespace-nowrap opacity-70 ${!message.text && (message.messageType === "image" || message.mediaUrl) ? "mt-1 text-right w-full" : "mt-2"}`}>
              {time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;