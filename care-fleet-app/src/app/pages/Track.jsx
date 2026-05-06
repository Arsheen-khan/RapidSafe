import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { io } from "socket.io-client";
import api from "../services/api";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const socket = io("http://localhost:4000");

const STATUS_LABELS = {
  pending: "🔍 Searching for ambulance...",
  accepted: "✅ Ambulance accepted",
  ongoing: "🚑 Ambulance on the way",
  completed: "✔️ Ride completed",
  cancelled: "❌ Ride cancelled",
};

function haversineKm(a, b) {
  const R = 6371;

  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function Track() {
  const { rideId } = useParams();

  const navigate = useNavigate();
  const toast = useToast();

  const [ride, setRide] = useState(null);
  const [ambulance, setAmbulance] = useState(null);

  const tickRef = useRef(0);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GMAPS_KEY,
  });

  useEffect(() => {
    let active = true;

    const fetchRide = async () => {
      try {
        const res = await api.get(`/rides/get-ride?rideId=${rideId}`);

        if (!active) return;

        setRide(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRide();

    const interval = setInterval(fetchRide, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [rideId]);

  useEffect(() => {
    socket.on("location-update", (data) => {
      if (data?.location) {
        setAmbulance({
          lat: data.location.ltd,
          lng: data.location.lng,
        });
      }
    });

    return () => {
      socket.off("location-update");
    };
  }, []);

  useEffect(() => {
    if (!ride?.pickup || ambulance) return;

    const pickupCoords = ride.pickup;

    const start = {
      lat: pickupCoords.lat + 0.03,
      lng: pickupCoords.lng + 0.03,
    };

    setAmbulance(start);

    const interval = setInterval(() => {
      tickRef.current = Math.min(tickRef.current + 0.05, 1);

      const t = tickRef.current;

      setAmbulance({
        lat: start.lat + (pickupCoords.lat - start.lat) * t,
        lng: start.lng + (pickupCoords.lng - start.lng) * t,
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [ride, ambulance]);

  const endRide = async () => {
    try {
      await api.post("/rides/end-ride", {
        rideId,
      });

      toast.push("Ride ended successfully", "success");

      navigate("/");
    } catch (err) {
      console.log(err);

      toast.push(
        err?.response?.data?.message || "Failed to end ride",
        "error"
      );
    }
  };

  if (!ride) {
    return <Loader label="Loading live tracking..." />;
  }

  let pickup = {
    lat: 23.2599,
    lng: 77.4126,
  };

  if (typeof ride.pickup === "object") {
    pickup = ride.pickup;
  }

  const distanceKm =
    ambulance && pickup ? haversineKm(ambulance, pickup) : 0;

  const etaMin = Math.max(
    1,
    Math.round((distanceKm / 40) * 60)
  );

  const status = ride.status || "pending";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[550px] rounded-3xl overflow-hidden shadow-2xl border border-red-100 bg-white">
        {GMAPS_KEY && isLoaded ? (
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            center={pickup}
            zoom={14}
          >
            <Marker position={pickup} label="You" />

            {ambulance && (
              <Marker
                position={ambulance}
                label="🚑"
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-full flex items-center justify-center bg-red-50 text-gray-500">
            {!GMAPS_KEY
              ? "Add VITE_GOOGLE_MAPS_API_KEY in .env"
              : "Loading map..."}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-red-100">
          <div className="text-xs uppercase text-gray-400 font-bold">
            Ride Status
          </div>

          <div className="text-2xl font-bold mt-2">
            {STATUS_LABELS[status] || status}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white p-6 rounded-3xl shadow-2xl">
          <div className="text-xs uppercase opacity-80 font-bold">
            ETA
          </div>

          <div className="text-5xl font-extrabold mt-2">
            {etaMin} min
          </div>

          <div className="text-sm opacity-90 mt-2">
            {distanceKm.toFixed(2)} km away
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-red-100">
          <div className="text-xs uppercase text-gray-400 font-bold">
            Ride ID
          </div>

          <div className="font-mono text-sm break-all mt-2">
            {rideId}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Pickup:
          </div>

          <div className="font-medium">
            {typeof ride.pickup === "string"
              ? ride.pickup
              : "Current Location"}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Destination:
          </div>

          <div className="font-medium">
            {ride.destination || "Nearest Hospital"}
          </div>
        </div>

        <button
          onClick={endRide}
          className="w-full py-4 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition"
        >
          End Ride
        </button>
      </div>
    </div>
  );
}