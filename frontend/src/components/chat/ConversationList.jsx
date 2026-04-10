import { useEffect, useState } from "react";
import api from "../../services/api";
import { useChat } from "../../context/ChatContext";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return date.toLocaleDateString();
}

const ConversationList = () => {
  const { openConversation } = useChat();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/conversations");
        setConversations(res.data.conversations);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
        <p className="text-gray-500 text-sm">No conversations yet</p>
        <p className="text-gray-600 text-xs mt-1">
          Message an artist from their artwork page
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => openConversation(conv)}
          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors duration-150 text-left border-b border-white/5 last:border-b-0"
        >
          {/* Avatar */}
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${conv.other_user_username}`}
            className="w-10 h-10 rounded-full shrink-0"
            alt=""
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-100 truncate">
                {conv.other_user_username}
              </span>
              <span className="text-[10px] text-gray-500 shrink-0">
                {formatRelativeTime(conv.last_message_time)}
              </span>
            </div>

            <p className="text-[11px] text-yellow-500/70 truncate mt-0.5">
              {conv.art_title}
            </p>

            <div className="flex items-center justify-between gap-2 mt-0.5">
              <p className="text-xs text-gray-500 truncate">
                {conv.last_message || "No messages yet"}
              </p>
              {parseInt(conv.unread_count) > 0 && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {conv.unread_count}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationList;
