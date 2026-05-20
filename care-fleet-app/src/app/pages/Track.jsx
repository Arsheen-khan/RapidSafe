import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import api from "../services/api";
import Loader from "../components/Loader";

// =======================
// LEAFLET DEFAULT ICON FIX
// =======================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =======================
// PROFESSIONAL AMBULANCE VAN ICON
// =======================

const ambulanceIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/1048/1048315.png",

  iconRetinaUrl:
    "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [60, 60],

  shadowSize: [60, 60],

  iconAnchor: [40, 40],

  popupAnchor: [0, -35],
});

// =======================
// PICKUP ICON
// =======================

const pickupIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",

  iconRetinaUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",

  iconSize: [42, 42],

  iconAnchor: [21, 42],

  popupAnchor: [0, -35],
});

export default function Track() {
  const { rideId } = useParams();

  const navigate = useNavigate();

  // =======================
  // STATES
  // =======================

  const [ride, setRide] = useState(null);

  const [loading, setLoading] = useState(true);

  const [ambulance, setAmbulance] = useState({
    lat: 23.2899,
    lng: 77.4326,
  });

  const [routePath, setRoutePath] = useState([]);

  // =======================
  // FETCH RIDE
  // =======================

  useEffect(() => {
    fetchRide();
  }, []);

  const fetchRide = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await api.get(
        `/rides/get-ride?rideId=${rideId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRide(data);

      setLoading(false);
    } catch (err) {
      console.log(err);

      setLoading(false);
    }
  };

  // =======================
  // PICKUP LOCATION
  // =======================

  const pickup = useMemo(() => {
    if (!ride?.pickup) {
      return {
        lat: 23.2599,
        lng: 77.4126,
      };
    }

    return {
      lat: ride.pickup.lat,
      lng: ride.pickup.lng,
    };
  }, [ride]);

  // =======================
  // AMBULANCE MOVEMENT
  // =======================

  useEffect(() => {
    if (!pickup) return;

    const interval = setInterval(() => {
      setAmbulance((prev) => ({
        lat:
          prev.lat +
          (pickup.lat - prev.lat) * 0.05,

        lng:
          prev.lng +
          (pickup.lng - prev.lng) * 0.05,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [pickup]);

  // =======================
  // FETCH ROUTE
  // =======================

  useEffect(() => {
    if (!ambulance || !pickup) return;

    const fetchRoute = async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${ambulance.lng},${ambulance.lat};` +
          `${pickup.lng},${pickup.lat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.routes?.length > 0) {
          const coords =
            data.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            );

          setRoutePath(coords);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchRoute();
  }, [ambulance, pickup]);

  // =======================
  // DISTANCE + ETA
  // =======================

  const distanceKm = useMemo(() => {
    const dx = pickup.lat - ambulance.lat;

    const dy = pickup.lng - ambulance.lng;

    return (
      Math.sqrt(dx * dx + dy * dy) * 111
    ).toFixed(2);
  }, [pickup, ambulance]);

  const eta = useMemo(() => {
    return Math.max(
      1,
      Math.round(distanceKm * 1.5)
    );
  }, [distanceKm]);

  // =======================
  // END RIDE
  // =======================

  const endRide = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/rides/end-ride",
        {
          rideId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  // =======================
  // LOADING UI
  // =======================

  if (loading) {
    return (
      <Loader label="Loading tracking..." />
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-3xl font-bold">
        Ride not found
      </div>
    );
  }

  // =======================
  // MAIN UI
  // =======================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-6">

        {/* MAP */}

        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200">
          <div className="h-[720px] w-full">

            <MapContainer
              center={[
                pickup.lat,
                pickup.lng,
              ]}
              zoom={13}
              scrollWheelZoom={true}
              style={{
                height: "100%",
                width: "100%",
              }}
            >

              {/* TILE */}

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* PICKUP */}

              <Marker
                position={[
                  pickup.lat,
                  pickup.lng,
                ]}
                icon={pickupIcon}
              >
                <Popup>
                  📍 Pickup Location
                </Popup>
              </Marker>

              {/* AMBULANCE */}

              <Marker
                position={[
                  ambulance.lat,
                  ambulance.lng,
                ]}
                icon={ambulanceIcon}
              >
                <Popup>
                  🚑 Ambulance is arriving
                </Popup>
              </Marker>

              {/* ROUTE */}

              {routePath.length > 0 && (
                <Polyline
                  positions={routePath}
                  pathOptions={{
                    color: "#ff0000",
                    weight: 7,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              )}

            </MapContainer>

          </div>
        </div>

        {/* SIDEBAR */}

        <div className="space-y-6">

          {/* STATUS */}

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <div className="text-sm uppercase text-gray-400 font-bold">
              Ride Status
            </div>

            <div className="mt-4 text-5xl font-black text-red-600 leading-tight">
              🚑 Ambulance Coming
            </div>
          </div>

          {/* ETA */}

          <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-8 shadow-xl">
            <div className="uppercase text-sm font-bold opacity-80">
              ETA
            </div>

            <div className="mt-4 text-7xl font-black">
              {eta} min
            </div>

            <div className="mt-3 text-xl">
              {distanceKm} km away
            </div>
          </div>

          {/* DETAILS */}

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">

            <div className="uppercase text-sm text-gray-400 font-bold">
              Ride ID
            </div>

            <div className="mt-2 font-semibold break-all">
              {ride._id}
            </div>

            <div className="mt-6 text-gray-400 text-sm">
              Pickup:
            </div>

            <div className="font-semibold text-lg">
              {ride.pickup?.address}
            </div>

            <div className="mt-6 text-gray-400 text-sm">
              Destination:
            </div>

            <div className="font-semibold text-lg">
              Hospital
            </div>

          </div>

          {/* END BUTTON */}

          <button
            onClick={endRide}
            className="w-full py-5 rounded-2xl bg-black text-white font-bold text-xl hover:scale-[1.02] transition"
          >
            End Ride
          </button>

        </div>
      </div>
    </div>
  );
}