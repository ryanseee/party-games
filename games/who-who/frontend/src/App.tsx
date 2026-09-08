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
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <SessionProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
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
    </ThemeProvider>
  );
}

export default App;
