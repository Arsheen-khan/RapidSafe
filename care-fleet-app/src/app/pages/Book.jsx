// Booking page: detect location, choose emergency type, create ride, then go to tracking
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import api from "../services/api";
import { useToast } from "../components/Toast";
import useVoiceTrigger from "../hooks/useVoiceTrigger";
import Loader from "../components/Loader";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const EMERGENCY_TYPES = [
  { value: "accident", label: "🚗 Accident" },
  { value: "cardiac", label: "❤️ Cardiac" },
  { value: "stroke", label: "🧠 Stroke" },
  { value: "respiratory", label: "🫁 Respiratory" },
  { value: "trauma", label: "🩸 Trauma" },
  { value: "other", label: "🚨 Other" },
];

export default function Book() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const cardRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [emergencyType, setEmergencyType] = useState("accident");
  const [locating, setLocating] = useState(true);
  const [booking, setBooking] = useState(false);

 useEffect(() => {
  if (!cardRef.current) return;

  gsap.fromTo(
    cardRef.current,
    {
      y: 30,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "opacity,transform",
    }
  );
}, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.push("Geolocation not supported", "error");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        // fallback: Bhopal
        setCoords({ lat: 23.2599, lng: 77.4126 });
        setLocating(false);
        toast.push("Using default location (permission denied)", "info");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const book = async () => {
    if (!coords) return;
    setBooking(true);
    try {
      const { data } = await api.post("/rides/create", {
        pickup: coords,
        destination: emergencyType || 'Nearest Hospital',
        vehicleType: 'ambulance',
      });
      toast.push("Ambulance dispatched!", "success");
      navigate(`/track/${data._id || data.rideId}`);
    } catch (err) {
      toast.push(err?.response?.data?.message || "Booking failed", "error");
    } finally {
      setBooking(false);
    }
  };

  const { listening, supported, start, stop } = useVoiceTrigger(() => {
    toast.push("Voice trigger detected — booking!", "success");
    book();
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
  <div
    ref={cardRef}
    className="bg-white/100 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-red-100 p-8 md:p-10 opacity-100  transition-all duration-500"
  >
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          Book an Ambulance
        </h1>

        <p className="text-gray-500 mt-3 text-base leading-relaxed">
          We'll dispatch the nearest available emergency unit instantly.
        </p>
      </div>

      <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-3xl shadow-inner">
        🚑
      </div>
    </div>

    <div className="rounded-3xl overflow-hidden border border-red-100 mb-8 shadow-sm">
  <div className="bg-white px-5 py-4 border-b border-red-100 flex items-center gap-2">
    <span className="animate-pulse">📍</span>

    <div className="text-sm font-bold text-red-700 uppercase tracking-wide">
      Pickup Location
    </div>
  </div>

  <div className="h-[300px] w-full">
    {isLoaded && coords ? (
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100%",
        }}
        center={{
          lat: coords.lat,
          lng: coords.lng,
        }}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker
          position={{
            lat: coords.lat,
            lng: coords.lng,
          }}
        />
      </GoogleMap>
    ) : (
      <div className="h-full flex items-center justify-center bg-red-50 text-gray-500">
        Loading map...
      </div>
    )}
  </div>
</div>

    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 block">
      Select Emergency Type
    </label>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
      {EMERGENCY_TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => setEmergencyType(t.value)}
          className={`relative overflow-hidden px-4 py-4 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
            emergencyType === t.value
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-600 shadow-xl scale-[1.03]"
              : "bg-white border-gray-200 text-gray-800 hover:border-red-300 hover:shadow-md hover:-translate-y-1"
          }`}
        >
          <span className="relative z-10">
            {t.label}
          </span>

          {emergencyType === t.value && (
            <div className="absolute inset-0 bg-white/10"></div>
          )}
        </button>
      ))}
    </div>

    <button
      onClick={book}
      disabled={booking || locating}
      className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl font-bold text-lg shadow-[0_15px_40px_rgba(239,68,68,0.35)] hover:shadow-[0_20px_50px_rgba(239,68,68,0.45)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-60"
    >
      {booking ? "Searching ambulance..." : "🚑 Request Ambulance"}
    </button>

    {booking && (
      <div className="mt-6">
        <Loader label="Searching ambulance..." />
      </div>
    )}

    {supported && (
      <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between shadow-sm">
        <div>
          <div className="font-bold text-sm text-gray-900">
            🎙️ Voice SOS
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Say "help" or "call ambulance"
          </div>
        </div>

        <button
          onClick={listening ? stop : start}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            listening
              ? "bg-red-600 text-white shadow-lg animate-pulse"
              : "bg-gray-900 text-white hover:bg-black"
          }`}
        >
          {listening ? "Listening..." : "Enable"}
        </button>
      </div>
    )}
  </div>
</div>
  );
}
