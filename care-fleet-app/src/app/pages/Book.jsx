// Book.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import gsap from "gsap";

import api from "../services/api";

import { useToast } from "../components/Toast";

import useVoiceTrigger from "../hooks/useVoiceTrigger";

import Loader from "../components/Loader";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// ======================================
// LEAFLET ICON FIX
// ======================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ======================================
// EMERGENCY TYPES
// ======================================

const EMERGENCY_TYPES = [
  { value: "accident", label: "Accident" },

  { value: "cardiac", label: "Cardiac" },

  { value: "stroke", label: "Stroke" },

  { value: "respiratory", label: "Respiratory" },

  { value: "trauma", label: "Trauma" },

  { value: "other", label: "Other" },
];

export default function Book() {
  const toast = useToast();

  const navigate = useNavigate();

  const cardRef = useRef(null);

  // ======================================
  // STATES
  // ======================================

  const [coords, setCoords] = useState(null);

  const [nearestHospital, setNearestHospital] =
    useState(null);

  const [emergencyType, setEmergencyType] =
    useState("accident");

  const [locating, setLocating] =
    useState(true);

  const [booking, setBooking] =
    useState(false);

  // ======================================
  // ANIMATION
  // ======================================

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

  // ======================================
  // GET CURRENT LOCATION
  // ======================================

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.push(
        "Geolocation not supported",
        "error"
      );

      setLocating(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,

          lng: pos.coords.longitude,
        });

        setLocating(false);
      },

      () => {
        setCoords({
          lat: 23.2599,

          lng: 77.4126,
        });

        setLocating(false);

        toast.push(
          "Using default location",
          "info"
        );
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,
      }
    );
  }, []);

  // ======================================
  // FETCH NEAREST HOSPITAL
  // ======================================

  useEffect(() => {
    if (!coords) return;

    const fetchNearestHospital =
      async () => {
        try {
          const query = `
          [out:json];
          (
            node
            ["amenity"="hospital"]
            (around:5000,${coords.lat},${coords.lng});
          );
          out;
        `;

          const url =
            "https://overpass-api.de/api/interpreter?data=" +
            encodeURIComponent(query);

          const response =
            await fetch(url);

          const data =
            await response.json();

          if (
            data.elements &&
            data.elements.length > 0
          ) {
            const hospital =
              data.elements[0];

            setNearestHospital({
              address:
                hospital.tags.name ||
                "Nearest Hospital",

              lat: hospital.lat,

              lng: hospital.lon,
            });
          }
        } catch (err) {
          console.log(err);

          toast.push(
            "Unable to fetch hospitals",
            "error"
          );
        }
      };

    fetchNearestHospital();
  }, [coords]);

  // ======================================
  // BOOK AMBULANCE
  // ======================================

  const book = async () => {
    if (!coords || !nearestHospital) {
      toast.push(
        "Finding nearest hospital...",
        "info"
      );

      return;
    }

    setBooking(true);

    try {
      const token =
        localStorage.getItem("token");

      const { data } = await api.post(
        "/rides/create",
        {
          pickup: {
            address:
              "Current Location",

            lat: coords.lat,

            lng: coords.lng,
          },

          destination: nearestHospital,

          emergencyType,

          vehicleType: "ambulance",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.push(
        "Ambulance dispatched!",
        "success"
      );

      navigate(
        `/track/${data._id || data.rideId}`
      );
    } catch (err) {
      console.log(err);

      toast.push(
        err?.response?.data?.message ||
          "Booking failed",

        "error"
      );
    } finally {
      setBooking(false);
    }
  };

  // ======================================
  // VOICE SOS
  // ======================================

  const {
    listening,

    supported,

    start,

    stop,
  } = useVoiceTrigger(() => {
    toast.push(
      "Voice trigger detected!",
      "success"
    );

    book();
  });

  // ======================================
  // UI
  // ======================================

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div
        ref={cardRef}
        className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-red-100 p-8 md:p-10"
      >
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">
              Book an Ambulance
            </h1>

            <p className="text-gray-500 mt-3">
              We’ll dispatch the nearest
              ambulance instantly.
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 text-3xl">
            🚑
          </div>
        </div>

        {/* MAP */}

        <div className="rounded-3xl overflow-hidden border border-red-100 mb-8 shadow-sm">
          <div className="bg-white px-5 py-4 border-b border-red-100 flex items-center gap-2">
            <span>📍</span>

            <div className="text-sm font-bold text-red-700 uppercase tracking-wide">
              Pickup Location
            </div>
          </div>

          <div className="h-[320px] w-full">
            {coords ? (
              <MapContainer
                center={[
                  coords.lat,
                  coords.lng,
                ]}
                zoom={15}
                scrollWheelZoom={true}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[
                    coords.lat,
                    coords.lng,
                  ]}
                >
                  <Popup>
                    Your current location
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-red-50">
                Loading map...
              </div>
            )}
          </div>
        </div>

        {/* HOSPITAL */}

        {nearestHospital && (
          <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100">
            <div className="text-sm text-gray-500">
              Nearest Hospital
            </div>

            <div className="font-bold text-lg text-red-700 mt-1">
              🏥{" "}
              {
                nearestHospital.address
              }
            </div>
          </div>
        )}

        {/* EMERGENCY TYPES */}

        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 block">
          Select Emergency Type
        </label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {EMERGENCY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() =>
                setEmergencyType(
                  t.value
                )
              }
              className={`px-4 py-4 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
                emergencyType === t.value
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-600 shadow-xl scale-[1.03]"
                  : "bg-white border-gray-200 text-gray-800 hover:border-red-300 hover:shadow-md"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* BUTTON */}

        <button
          onClick={book}
          disabled={
            booking || locating
          }
          className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.01] transition-all duration-300 disabled:opacity-60"
        >
          {booking
            ? "Searching ambulance..."
            : "🚑 Request Ambulance"}
        </button>

        {/* LOADER */}

        {booking && (
          <div className="mt-6">
            <Loader label="Searching ambulance..." />
          </div>
        )}

        {/* VOICE SOS */}

        {supported && (
          <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-gray-900">
                🎙️ Voice SOS
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Say "help" or "call
                ambulance"
              </div>
            </div>

            <button
              onClick={
                listening
                  ? stop
                  : start
              }
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                listening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-gray-900 text-white"
              }`}
            >
              {listening
                ? "Listening..."
                : "Enable"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}