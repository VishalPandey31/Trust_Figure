import { useState, useEffect, useRef } from "react";
import socket from "../../socket/socket";
import { useChatStore } from "../../store/useChatStore";
import { Image as ImageIcon, X } from "lucide-react";

function MessageInput({ receiverId }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const { sendMessage: sendChat } = useChatStore();

  const handleTyping = () => {
    if (!receiverId) return;
    
    socket.emit("typing", { receiverId });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId });
    }, 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return;
    
    // Stop typing immediately when sending
    if (receiverId) socket.emit("stopTyping", { receiverId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (imageFile) {
        const formData = new FormData();
        if (text.trim()) formData.append("text", text);
        formData.append("image", imageFile);
        await sendChat(formData);
    } else {
        await sendChat({ text });
    }

    setText("");
    removeImage();
  };

  return (
    <div className="p-2 md:p-3 border-t border-white/10 flex flex-col gap-2">
      {imagePreview && (
        <div className="relative w-20 h-20">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/20" />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-gray-300 transition"
        >
          <ImageIcon size={20} />
        </button>

      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
        className="flex-1 bg-white/5 p-2 rounded"
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />

      <button
        onClick={sendMessage}
        className="bg-[#00d4ff] text-black px-3 md:px-4 py-2 rounded font-medium hover:bg-[#00b8e6] transition shrink-0"
      >
        Send
      </button>

      </div>
    </div>
  );
}

export default MessageInput;