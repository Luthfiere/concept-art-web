import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ChatProvider } from "./context/ChatContext";
import ChatWidget from "./components/chat/ChatWidget";

function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <AppRoutes />
        <ChatWidget />
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;
