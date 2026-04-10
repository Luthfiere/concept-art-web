import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../services/api";
import { useChat } from "../../context/ChatContext";

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now - 86400000).toDateString() === date.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  if (diffMs < 604800000) {
    return `${date.toLocaleDateString([], { weekday: "short" })} ${time}`;
  }
  return `${date.toLocaleDateString()} ${time}`;
}

const ArrowLeftIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

const ChatWindow = () => {
  const { activeConversation, backToList, fetchUnreadCount } = useChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const messageCountRef = useRef(0);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = currentUser?.id;

  const convId = activeConversation?.id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!convId) return;
    try {
      const res = await api.get(`/messages/conversation/${convId}`);
      const newMessages = res.data.messages;
      // Only update if message count changed (avoid unnecessary re-renders)
      if (newMessages.length !== messageCountRef.current) {
        messageCountRef.current = newMessages.length;
        setMessages(newMessages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [convId]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    messageCountRef.current = 0;
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 5s
  useEffect(() => {
    if (!convId) return;
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [convId, fetchMessages]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update unread count when leaving
  useEffect(() => {
    return () => {
      fetchUnreadCount();
    };
  }, [fetchUnreadCount]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // Optimistic update
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      conversation_id: convId,
      sender_id: currentUserId,
      sender_username: currentUser?.username,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    messageCountRef.current += 1;

    try {
      await api.post(`/messages/conversation/${convId}`, { message: text });
      // Next poll will reconcile
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      messageCountRef.current -= 1;
      setInput(text); // restore input
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUsername = activeConversation?.other_user_username || "User";
  const artTitle = activeConversation?.art_title || "";

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
        <button
          onClick={backToList}
          className="text-gray-400 hover:text-white transition-colors duration-150"
        >
          <ArrowLeftIcon />
        </button>
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherUsername}`}
          className="w-8 h-8 rounded-full"
          alt=""
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate">
            {otherUsername}
          </p>
          {artTitle && (
            <p className="text-[10px] text-yellow-500/70 truncate">
              {artTitle}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-xs">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] ${
                    isMine
                      ? "bg-yellow-500 text-black rounded-2xl rounded-br-md"
                      : "bg-white/5 text-gray-200 rounded-2xl rounded-bl-md"
                  } px-3.5 py-2`}
                >
                  <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <p
                    className={`text-[9px] mt-1 ${
                      isMine ? "text-black/40" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-sm text-gray-200 outline-none focus:border-yellow-500/50 focus:bg-white/[0.07] placeholder-gray-600 transition-all duration-200"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim()
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
