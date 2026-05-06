// Profile (works for both user + captain by hitting the right endpoint)
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function Profile() {
  const { role, user: cached } = useAuth();
  const [profile, setProfile] = useState(cached);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const url = role === "captain" ? "/captains/profile" : "/users/profile";
        const { data } = await api.get(url);
        setProfile(data.user || data.captain || data);
      } catch {
        // fallback to cached
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.fullname?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.fullname}</h1>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase">
              {role}
            </span>
          </div>
        </div>
        {profile?.vehicle && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100">
            <div className="text-xs uppercase font-bold text-red-700">Vehicle</div>
            <div className="text-sm mt-1">
              {profile.vehicle.type} — {profile.vehicle.number}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
