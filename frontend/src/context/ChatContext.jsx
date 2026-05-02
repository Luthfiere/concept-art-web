import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api, { isTokenExpired } from "../services/api";

const ChatContext = createContext(null);

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef(null);

  const isLoggedIn = !isTokenExpired();

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (isTokenExpired()) return;
    try {
      const res = await api.get("/messages/unread-count");
      setUnreadCount(res.data.count);
    } catch {
      // silently fail
    }
  }, []);

  // Poll unread count every 30s when logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isLoggedIn, fetchUnreadCount]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) setActiveConversation(null); // reset view on close
      return !prev;
    });
  }, []);

  const openConversation = useCallback((conversation) => {
    setActiveConversation(conversation);
  }, []);

  const backToList = useCallback(() => {
    setActiveConversation(null);
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const openChatWithUser = useCallback(async (receiverId) => {
    if (isTokenExpired()) return;
    try {
      const res = await api.post("/conversations", {
        receiver_id: receiverId,
      });
      const conversation = res.data.conversation;
      setActiveConversation(conversation);
      setIsOpen(true);
      return { ok: true, conversation };
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "Failed to open chat";
      console.error("Failed to open chat:", message);
      return { ok: false, status, message };
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        activeConversation,
        unreadCount,
        isLoggedIn,
        toggleChat,
        openConversation,
        backToList,
        openChatWithUser,
        fetchUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
