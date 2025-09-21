import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        🎨 Welcome to Collaborative Whiteboard
      </h1>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate('/login')}
          className="bg-black px-4 py-2 rounded hover:bg-gray-800"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="bg-black px-4 py-2 rounded hover:bg-gray-800"
        >
          Register
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/canvas')}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Whiteboard
        </button>
        <button
          onClick={() => navigate('/sticky-notes')}
          className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 text-black"
        >
          Sticky Notes
        </button>
        <button
          onClick={() => navigate('/comments')}
          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
        >
          Comments
        </button>
      </div>
    </div>
  );
}

export default Home;
