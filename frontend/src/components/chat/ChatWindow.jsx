import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../services/api";
import { useChat } from "../../context/ChatContext";
import { Trash2, Download, X } from "lucide-react";

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
  const [selectedFiles, setSelectedFiles] = useState([]);

  // State baru untuk menampung gambar yang sedang di-preview
  const [previewImage, setPreviewImage] = useState(null);

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

  const getFileUrl = (path) => {
    if (!path) return "";
    const baseURL = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    return `${baseURL}/${path}`;
  };

  const fetchMessages = useCallback(async () => {
    if (!convId) return;
    try {
      const res = await api.get(`/messages/conversation/${convId}`);
      const newMessages = res.data.messages;
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

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    messageCountRef.current = 0;
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!convId) return;
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [convId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      fetchUnreadCount();
    };
  }, [fetchUnreadCount]);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && selectedFiles.length === 0) || sending) return;

    setSending(true);
    setInput("");
    const filesToSend = [...selectedFiles];
    setSelectedFiles([]);

    const tempId = `temp-${Date.now()}`;

    const optimisticMsg = {
      id: tempId,
      conversation_id: convId,
      sender_id: currentUserId,
      sender_username: currentUser?.username,
      message: text || null,
      is_read: false,
      created_at: new Date().toISOString(),
      attachments: filesToSend.map((file, idx) => ({
        id: `temp-att-${idx}`,
        attachment_type: file.type.startsWith("image/") ? "image" : "file",
        media: URL.createObjectURL(file),
        _local: true,
        _name: file.name,
      })),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    messageCountRef.current += 1;

    try {
      const formData = new FormData();
      if (text) {
        formData.append("message", text);
      }

      filesToSend.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await api.post(`/messages/conversation/${convId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const savedMessage = res.data?.data;

      if (savedMessage && savedMessage.id) {
        setMessages((prev) => {
          const updated = prev.map((m) => {
            if (m.id !== tempId) return m;
            m.attachments?.forEach((att) => {
              if (att._local) URL.revokeObjectURL(att.media);
            });
            return savedMessage;
          });
          messageCountRef.current = updated.length;
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      optimisticMsg.attachments.forEach((att) =>
        URL.revokeObjectURL(att.media),
      );
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      messageCountRef.current -= 1;
      if (text) setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (String(messageId).startsWith("temp-")) return;

    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    const previousMessages = [...messages];

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    messageCountRef.current -= 1;

    try {
      await api.delete(`/messages/${messageId}`);
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message. Please try again.");
      setMessages(previousMessages);
      messageCountRef.current = previousMessages.length;
    }
  };

  // Fungsi pembantu untuk mengunduh berkas/gambar secara paksa dari URL
  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "downloaded-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback jika fetch CORS terhalang
      window.open(url, "_blank");
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
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Header */}
      <div className="cursor-pointer flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
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
            const hasAttachments =
              msg.attachments && msg.attachments.length > 0;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                {/* Melebarkan bubble chat dinamis jika membawa file attachment */}
                <div
                  className={`flex items-center gap-2 group flex-row-reverse justify-end ${
                    hasAttachments ? "max-w-[85%]" : "max-w-[75%]"
                  }`}
                >
                  {/* Bubble Chat */}
                  <div
                    className={`${
                      isMine
                        ? "bg-yellow-500 text-black rounded-2xl rounded-br-md"
                        : "bg-white/5 text-gray-200 rounded-2xl rounded-bl-md"
                    } px-3.5 py-2 ${hasAttachments ? "w-full min-w-[200px]" : ""}`}
                  >
                    {/* Render Attachments dengan Auto-Wrap dan Penahan Overflow */}
                    {hasAttachments && (
                      <div
                        className={`grid ${
                          msg.attachments.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-2"
                        } gap-2 mb-2 w-full max-w-full overflow-hidden`}
                      >
                        {msg.attachments.map((att) => {
                          const imgUrl = att._local
                            ? att.media
                            : getFileUrl(att.media);
                          const fileName =
                            att._name ||
                            (att.media
                              ? att.media.split("/").pop()
                              : "image.jpg");

                          return att.attachment_type === "image" ? (
                            <div
                              key={att.id}
                              onClick={() =>
                                setPreviewImage({ url: imgUrl, name: fileName })
                              }
                              className="relative aspect-square w-full max-w-full overflow-hidden rounded-lg bg-black/10 group/img cursor-pointer"
                            >
                              <img
                                src={imgUrl}
                                alt="attachment"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ) : (
                            <a
                              key={att.id}
                              href={imgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className={`flex flex-col justify-between p-2 rounded-xl text-xs border border-white/5 truncate ${
                                isMine
                                  ? "bg-black/10 text-black hover:bg-black/15"
                                  : "bg-white/5 text-gray-200 hover:bg-white/10"
                              } transition-all duration-150 min-h-[64px] min-w-0`}
                            >
                              <div className="flex items-start gap-1.5 min-w-0">
                                <span className="text-base shrink-0">📄</span>
                                <p className="font-medium truncate leading-tight">
                                  {fileName}
                                </p>
                              </div>
                              <span
                                className={`text-[9px] text-right block mt-1 uppercase ${
                                  isMine ? "text-black/50" : "text-gray-500"
                                }`}
                              >
                                {att.attachment_type}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Render Text Message */}
                    {msg.message && (
                      <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    )}

                    {/* Render Waktu */}
                    <p
                      className={`text-[9px] mt-1 ${
                        isMine ? "text-black/40" : "text-gray-500"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>

                  {/* Tombol Delete */}
                  {isMine && !String(msg.id).startsWith("temp-") && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-lg text-gray-500 hover:text-red-500 hover:bg-white/5"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5 shrink-0 flex flex-col gap-2">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-white/10 text-xs text-gray-300 px-2 py-1 rounded-md flex items-center gap-1"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-gray-500 hover:text-red-400 font-bold ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (selectedFiles.length + files.length > 5) {
                  alert("Maximum 5 attachments allowed");
                  return;
                }
                setSelectedFiles((prev) => [...prev, ...files]);
              }}
            />
          </label>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFiles.length > 0
                ? "Add a message or send..."
                : "Type a message..."
            }
            maxLength={1000}
            className="flex-1 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-sm text-gray-200 outline-none focus:border-yellow-500/50 focus:bg-white/[0.07] placeholder-gray-600 transition-all duration-200"
          />

          <button
            onClick={handleSend}
            disabled={sending || (!input.trim() && selectedFiles.length === 0)}
            className={`cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() || selectedFiles.length > 0
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* MODAL LIGHTBOX PREVIEW IMAGE (FULL SCREEN) */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col animate-fade-in overflow-hidden">
          {/* Header Modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f1225]/90 backdrop-blur-md shrink-0">
            <span className="text-sm text-gray-200 truncate max-w-[70%] font-medium">
              {previewImage.name}
            </span>
            <div className="flex items-center gap-3">
              {/* Tombol Download */}
              <button
                onClick={() =>
                  downloadFile(previewImage.url, previewImage.name)
                }
                className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
              {/* Tombol Close */}
              <button
                onClick={() => setPreviewImage(null)}
                className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/10 transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Area Konten Gambar Full Screen */}
          <div
            className="flex-1 flex items-center justify-center p-6 bg-black/20 cursor-zoom-out"
            onClick={() => setPreviewImage(null)} 
          >
            <img
              src={previewImage.url}
              alt="Preview"
              onClick={(e) => e.stopPropagation()}
              className="max-w-[95vw] max-h-[85vh] sm:max-w-[85vw] sm:max-h-[80vh] object-contain rounded-lg shadow-2xl animate-scale-up"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
