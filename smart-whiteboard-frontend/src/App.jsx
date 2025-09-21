import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Whiteboard from './pages/Whiteboard';
import AdminPage from './pages/AdminPage';
import StickyNotes from './pages/StickyNotes';
import Comments from './pages/Comments';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/canvas" element={<Whiteboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/sticky-notes" element={<StickyNotes />} />
          <Route path="/comments" element={<Comments />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
