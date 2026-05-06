// Nearby hospitals sorted by distance + bed availability
import { useEffect, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

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

export default function Hospitals() {
  const toast = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords({ lat: 23.2599, lng: 77.4126 })
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Backend doesn't have a /hospitals endpoint, so use mock data
        const mockHospitals = [
          {
            _id: '1',
            name: 'City General Hospital',
            lat: 23.2599,
            lng: 77.4126,
            beds: 12,
            rating: 4.8,
            address: 'Downtown Medical Complex'
          },
          {
            _id: '2',
            name: 'St. Mary Medical Center',
            lat: 23.2750,
            lng: 77.4200,
            beds: 8,
            rating: 4.6,
            address: 'North Hospital District'
          },
          {
            _id: '3',
            name: 'Emergency Care Facility',
            lat: 23.2400,
            lng: 77.3900,
            beds: 15,
            rating: 4.7,
            address: 'West Side Medical'
          },
          {
            _id: '4',
            name: 'Trauma & Emergency Unit',
            lat: 23.2200,
            lng: 77.4300,
            beds: 10,
            rating: 4.9,
            address: 'South Hospital Complex'
          }
        ];
        setHospitals(mockHospitals);
      } catch (err) {
        toast.push(err?.response?.data?.message || "Failed to load hospitals", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  if (loading) return <Loader label="Finding hospitals..." />;

  const sorted = coords
    ? [...hospitals]
        .map((h) => ({ ...h, _km: haversineKm(coords, { lat: h.lat, lng: h.lng }) }))
        .sort((a, b) => a._km - b._km || b.beds - a.beds)
    : hospitals;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Nearby Hospitals</h1>
      <p className="text-gray-500 mb-6">Sorted by distance and bed availability.</p>
      {sorted.length === 0 && (
        <div className="p-6 bg-white rounded-xl border text-center text-gray-500">
          No hospitals found.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {sorted.map((h, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{h.name}</h3>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  h.beds > 5
                    ? "bg-emerald-100 text-emerald-700"
                    : h.beds > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {h.beds} beds
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">🏥 {h.specialization}</p>
            {h._km != null && (
              <p className="text-xs text-gray-500 mt-2">
                📍 {h._km.toFixed(2)} km away
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
