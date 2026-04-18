import { useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

const ChatBubbleIcon = () => (
  <svg
    className="w-7 h-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    />
  </svg>
);

const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ChatWidget = () => {
  const { isOpen, activeConversation, unreadCount, isLoggedIn, toggleChat } =
    useChat();

  // Lock body scroll when panel is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Floating chat button — hidden on mobile (navbar chat icon takes over) */}
      <button
        onClick={toggleChat}
        className={`hidden sm:flex fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full shadow-lg shadow-black/40 items-center justify-center transition-all duration-200 ${
          isOpen
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-110 hover:shadow-yellow-500/25"
        }`}
      >
        {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1 ring-2 ring-[#0a0d1f]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat panel — anchored bottom-left, above the chat button */}
      {isOpen && (
        <div className="fixed z-[55] sm:bottom-24 sm:left-8 sm:w-[380px] sm:h-[500px] sm:rounded-xl bottom-0 left-0 w-full h-full bg-[#0f1225] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <h3 className="text-sm font-semibold text-white">Chats</h3>
            <button
              onClick={toggleChat}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Panel body */}
          {activeConversation ? <ChatWindow /> : <ConversationList />}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
