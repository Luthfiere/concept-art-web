import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ChatProvider } from "./context/ChatContext";
import ChatWidget from "./components/chat/ChatWidget";
import DeletionBanner from "./components/moderation/DeletionBanner";

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <DeletionBanner />
        <AppRoutes />
        <ChatWidget />
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;
