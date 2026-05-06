// Captain registration with vehicle info
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function CaptainRegister() {
  const { registerCaptain } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    vehicleType: "ambulance",
    vehicleNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerCaptain({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        vehicle: { type: form.vehicleType, number: form.vehicleNumber },
      });
      toast.push("Captain registered!", "success");
      navigate("/profile");
    } catch (err) {
      toast.push(err?.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100"
      >
        <h2 className="text-2xl font-bold mb-1">Captain Registration</h2>
        <p className="text-sm text-gray-500 mb-6">Drive & save lives</p>
        <input
          required
          placeholder="Full name"
          className="w-full px-4 py-3 mb-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={form.fullname}
          onChange={(e) => setForm({ ...form, fullname: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 mb-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 mb-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <select
            className="px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
          >
            <option value="ambulance">Ambulance</option>
            <option value="bls">BLS Van</option>
            <option value="als">ALS Van</option>
          </select>
          <input
            required
            placeholder="Vehicle no."
            className="px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            value={form.vehicleNumber}
            onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
          />
        </div>
        <button
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          Already a captain?{" "}
          <Link to="/captain/login" className="text-red-600 font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
