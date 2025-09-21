import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AdminPage = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:3001/api/auth/users", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    const data = await res.json();
    if (res.ok) setUsers(data);
    else alert("Failed to fetch users");
  };

  const handleRoleChange = async (username, newRole) => {
    const res = await fetch("http://localhost:3001/api/auth/update-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ username, newRole }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Role updated!");
      fetchUsers();
    } else {
      alert(data.error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Role Management</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Current Role</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border px-4 py-2">{u.username}</td>
              <td className="border px-4 py-2">{u.role}</td>
              <td className="border px-4 py-2">
                <select
                  className="border px-2 py-1"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.username, e.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="write">write</option>
                  <option value="view">view</option>
                  <option value="erase">erase</option>
                  <option value="comment">comment</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;

