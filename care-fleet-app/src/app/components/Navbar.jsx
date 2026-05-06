// Top navigation bar
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? "bg-red-600 text-white"
        : "text-gray-700 hover:bg-red-50 hover:text-red-600"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm border-b border-red-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🚑</span>
          <span className="font-bold text-xl bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            RescueNow
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          {user && role === "user" && (
            <>
              <NavLink to="/book" className={linkClass}>
                Book
              </NavLink>
              <NavLink to="/hospitals" className={linkClass}>
                Hospitals
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          )}
          {user && role === "captain" && (
            <NavLink to="/profile" className={linkClass}>
              Captain
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold rounded-md text-red-600 hover:bg-red-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
