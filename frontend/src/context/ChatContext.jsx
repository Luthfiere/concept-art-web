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

  const openChatWithArt = useCallback(async (artId, receiverId) => {
    if (isTokenExpired()) return;
    try {
      const res = await api.post("/conversations", {
        art_id: artId,
        receiver_id: receiverId,
      });
      const conversation = res.data.conversation;
      setActiveConversation(conversation);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to open chat:", err);
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
        openChatWithArt,
        fetchUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
