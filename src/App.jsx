import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import UploadVideo from './pages/UploadVideo';
import Videos from './pages/Videos';
import WatchVideo from './pages/WatchVideo';
import './VideoApp.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">StreamSpace</Link>
          </div>
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/videos">Videos</Link>
                <Link to="/upload">Upload</Link>
                <button onClick={logout} className="logout-button">
                  Logout ({user.username})
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={user ? <Videos /> : <Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/upload" element={user ? <UploadVideo /> : <Navigate to="/login" />} />
            <Route path="/videos" element={user ? <Videos /> : <Navigate to="/login" />} />
            <Route path="/watch/:videoId" element={user ? <WatchVideo /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
