// Root JSX app with react-router-dom
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import FloatingEmergency from "./components/FloatingEmergency";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainRegister from "./pages/CaptainRegister";
import Book from "./pages/Book";
import Track from "./pages/Track";
import Hospitals from "./pages/Hospitals";
import Profile from "./pages/Profile";
import "leaflet/dist/leaflet.css";
function PageTransitions({ children }) {
  const location = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [location.pathname]);
  return <div ref={ref}>{children}</div>;
}

function Shell() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/30 to-white">
      <Navbar />
      <PageTransitions>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/captain/login" element={<CaptainLogin />} />
          <Route path="/captain/register" element={<CaptainRegister />} />
          <Route
            path="/book"
            element={
              <ProtectedRoute role="user">
                <Book />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:rideId"
            element={
              <ProtectedRoute>
                <Track />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute>
                <Hospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center py-32">
                <h1 className="text-5xl font-bold text-red-600">404</h1>
                <p className="text-gray-500 mt-2">Page not found</p>
              </div>
            }
          />
        </Routes>
      </PageTransitions>
      <FloatingEmergency />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
