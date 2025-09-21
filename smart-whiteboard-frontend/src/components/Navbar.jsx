import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-900 text-white py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-pink-400">🎨 Collaborative Whiteboard</h1>
        <div className="space-x-6 text-sm">
          <Link to="/" className="hover:text-pink-300 transition">Whiteboard</Link>
          <Link to="/notes" className="hover:text-pink-300 transition">Sticky Notes</Link>
          <Link to="/comments" className="hover:text-pink-300 transition">Comments</Link>
          <Link to="/login" className="hover:text-pink-300 transition">Login</Link>
          <Link to="/register" className="hover:text-pink-300 transition">Register</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
