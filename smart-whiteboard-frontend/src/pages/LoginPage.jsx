import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios'; // ✅ use custom axios

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🚀 Sending login credentials:", { username, password });
      const res = await api.post('/login', { username, password });
      console.log("🟢 Login sent to:", api.defaults.baseURL + '/login');

      const { token, username: loggedInUsername, role } = res.data;
      login({ token, username: loggedInUsername, role });

      navigate('/canvas');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 400) {
          alert(`Missing fields: ${data.error || 'Bad Request'}`);
        } else if (status === 401) {
          alert('Login failed: Invalid username or password');
        } else if (status === 404) {
          alert('Login failed: User not found');
        } else if (status === 500) {
          alert('Login failed: Server error');
        } else {
          alert(`Login failed: ${data.error || 'Unexpected error'}`);
        }

        console.error('Login error:', data);
        console.log("Full error object:", err);

      } else {
        alert('Login failed: Could not reach server');
        console.error('Login error:', err.message);
      }
    }
  };



  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
