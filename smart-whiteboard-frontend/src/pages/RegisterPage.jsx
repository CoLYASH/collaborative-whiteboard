import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'write' // default or allow selection
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/register', formData);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: "Username or email already taken" });
    }

  };


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-96">
      <input name="username" placeholder="Username" onChange={handleChange} className="p-2 rounded" />
      <input name="email" placeholder="Email" type="email" onChange={handleChange} className="p-2 rounded" />
      <input name="password" placeholder="Password" type="password" onChange={handleChange} className="p-2 rounded" />

      <select name="role" value={formData.role} onChange={handleChange} className="p-2 rounded">
        <option value="admin">Admin</option>
        <option value="write">Write</option>
        <option value="erase">Erase</option>
        <option value="comment">Comment</option>
        <option value="view">View</option>
      </select>

      <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Register</button>
    </form>
  );
}

export default Register;
