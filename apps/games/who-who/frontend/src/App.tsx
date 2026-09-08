import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ParticipantView from "./pages/ParticipantView";
import JoinSession from "./pages/JoinSession";
import { SessionProvider } from "./context/SessionContext";

function App() {
  return (
    <Router>
      <SessionProvider>
        <div className="min-h-screen text-[#121212] font-['Space_Mono',_monospace]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/join" element={<JoinSession />} />
            <Route path="/participant/:code" element={<ParticipantView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </SessionProvider>
    </Router>
  );
}

export default App;
