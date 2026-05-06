// Floating SOS button with GSAP pulse animation
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function FloatingEmergency() {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ref.current) return;
    const tl = gsap.to(ref.current, {
      scale: 1.1,
      boxShadow: "0 0 30px rgba(220,38,38,0.7)",
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
    return () => tl.kill();
  }, []);

  return (
    <button
      ref={ref}
      onClick={() => navigate("/book")}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 text-white text-xl font-extrabold shadow-2xl flex items-center justify-center hover:bg-red-700"
      aria-label="Emergency SOS"
    >
      SOS
    </button>
  );
}
