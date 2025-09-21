import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from "framer-motion";
import ConnectedUsers from "./ConnectedUsers";
import { useAuth } from "../context/AuthContext";

const socket = io('http://localhost:3001');

function Whiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [userColors, setUserColors] = useState({});
  const [userRole, setUserRole] = useState("view");
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRolePanel, setShowRolePanel] = useState(false);

  const handleRoleChange = useCallback((userId, newRole) => {
    if (userRole !== "admin") return;
    
    socket.emit("assignRole", {
      targetId: userId,
      newRole,
    });
    
    // Optimistic UI update
    setConnectedUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      )
    );
    setShowRolePanel(false);
  }, [userRole]);

  useEffect(() => {
    socket.on("connect", () => {
      const username = user?.username || "Anonymous";
      setUserId(socket.id);
      socket.emit("register", {
        username,
        color: brushColor,
        role: user?.role || "view"
      });
    });

    socket.on("roleChanged", ({ userId, newRole }) => {
      setConnectedUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    });

    socket.on("drawing", drawFromSocket);
    socket.on("connectedUsers", (users) => {
      setConnectedUsers(users);
      const colors = {};
      users.forEach((u) => (colors[u.id] = u.color));
      setUserColors(colors);
      const me = users.find((u) => u.id === socket.id);
      if (me) setUserRole(me.role || "view");
    });

    socket.on("clear", clearCanvas);

    return () => {
      socket.off("drawing");
      socket.off("connectedUsers");
      socket.off("clear");
      socket.off("roleChanged");
    };
  }, [user, brushColor]);

  useEffect(() => {
    if (userId) {
      socket.emit("updateColor", { color: brushColor });
    }
  }, [brushColor, userId]);

  const startDrawing = (e) => {
    if (!["write", "erase", "admin"].includes(userRole)) return;
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    drawOnCanvas({ offsetX, offsetY, type: "begin", color: brushColor, size: brushSize });
    socket.emit("drawing", { offsetX, offsetY, type: "begin", color: brushColor, size: brushSize });
  };

  const draw = (e) => {
    if (!isDrawing || !["write", "erase", "admin"].includes(userRole)) return;
    const { offsetX, offsetY } = e.nativeEvent;
    drawOnCanvas({ offsetX, offsetY, type: "draw", color: brushColor, size: brushSize });
    socket.emit("drawing", { offsetX, offsetY, type: "draw", color: brushColor, size: brushSize });
  };

  const finishDrawing = () => setIsDrawing(false);

  const drawFromSocket = ({ offsetX, offsetY, type, color, size }) => {
    drawOnCanvas({ offsetX, offsetY, type, color, size });
  };

  const drawOnCanvas = ({ offsetX, offsetY, type, color, size }) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    if (type === "begin") {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    } else {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    if (!["erase", "admin"].includes(userRole)) return;
    clearCanvas();
    socket.emit("clear");
  };

  return (
    <div className="App" style={{ backgroundColor: "#1e1e1e", color: "white", padding: "20px" }}>
      <nav>
        <a href="#" style={{ color: "blue", marginRight: "10px" }}>Whiteboard</a>
        <a href="#" style={{ color: "blue", marginRight: "10px" }}>Sticky Notes</a>
        <a href="#" style={{ color: "blue" }}>Comments</a>
      </nav>

      <ConnectedUsers connectedUsers={connectedUsers} userId={userId} />
      <h2>🎨 Collaborative Whiteboard</h2>
      <h3>🧑‍🤝‍🧑 Connected Users</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {connectedUsers.map((u) => (
          <li key={u.id} style={{ 
            marginBottom: "8px", 
            display: "flex", 
            alignItems: "center",
            padding: "8px",
            backgroundColor: "#2d2d2d",
            borderRadius: "4px"
          }}>
            <span style={{ 
              color: u.color || "#fff",
              marginRight: "8px",
              fontSize: "24px"
            }}>●</span>
            <span style={{ flex: 1 }}>
              {u.username} {u.id === userId && "(You)"} 
              <span style={{ color: "#aaa", marginLeft: "8px" }}>({u.role})</span>
            </span>
            
            {userRole === "admin" && u.id !== userId && (
              <button
                style={{ 
                  marginLeft: "10px", 
                  padding: "4px 12px",
                  background: "#333",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setSelectedUser(u);
                  setShowRolePanel(true);
                }}
              >
                Change Role
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="max-w-5xl mx-auto p-4 bg-gray-900 rounded-lg shadow-md mt-4">
        <div style={{ marginBottom: "10px", color: "white" }}>
          <label>
            My Brush Color:{" "}
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              style={{ verticalAlign: "middle" }}
            />
          </label>
          <label style={{ marginLeft: "10px" }}>
            Brush Size:{" "}
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
              style={{ verticalAlign: "middle" }}
            />
            <span style={{ marginLeft: "5px" }}>{brushSize}</span>
          </label>
          {["admin", "erase"].includes(userRole) && (
            <button 
              onClick={handleClear} 
              style={{ 
                marginLeft: "10px", 
                padding: "5px 15px",
                background: "#d9534f",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer"
              }}
            >
              Clear Canvas
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg overflow-hidden mt-2 p-2">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            style={{ 
              background: "white", 
              border: "1px solid #ccc", 
              borderRadius: "8px",
              cursor: ["write", "erase", "admin"].includes(userRole) ? "crosshair" : "not-allowed"
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            onMouseLeave={finishDrawing}
          ></canvas>
        </div>
      </div>

      {/* Role Management Panel */}
      <AnimatePresence>
        {showRolePanel && selectedUser && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '300px',
              height: '100%',
              backgroundColor: '#2d3748',
              padding: '20px',
              boxShadow: '-5px 0 15px rgba(0,0,0,0.2)',
              zIndex: 1000,
              color: 'white'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #4a5568',
              paddingBottom: '10px'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                Manage {selectedUser.username}
              </h3>
              <button 
                onClick={() => setShowRolePanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0aec0',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p>Current role: <strong>{selectedUser.role}</strong></p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['admin', 'write', 'erase', 'view', 'comment'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(selectedUser.id, role)}
                  style={{
                    padding: '10px',
                    borderRadius: '5px',
                    background: selectedUser.role === role ? '#4299e1' : '#4a5568',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: userColors[selectedUser.id] || '#fff',
                    marginRight: '10px'
                  }}></span>
                  Set as {role}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Whiteboard;