import React from 'react';

const ConnectedUsers = ({ connectedUsers, userId }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">👥 Connected Users</h2>
      <ul className="list-none pl-0">
        {connectedUsers.map((user) => (
          <li key={user.id} className="flex items-center gap-2 mb-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: user.color }}
            ></span>
            <span className="text-white">
              {user.username} {user.id === userId ? "(You)" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsers;
