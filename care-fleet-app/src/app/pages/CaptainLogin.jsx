// Captain (driver) login
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function CaptainLogin() {
  const { loginCaptain } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginCaptain(form.email, form.password);
      toast.push("Captain logged in", "success");
      navigate("/profile");
    } catch (err) {
      toast.push(err?.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-gradient-to-br from-red-600 to-rose-700 p-8 rounded-2xl shadow-2xl text-white"
      >
        <h2 className="text-2xl font-bold mb-1">🚑 Captain Login</h2>
        <p className="text-sm opacity-90 mb-6">Drivers sign in here</p>
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 mb-3 rounded-lg bg-white/95 text-gray-900 focus:ring-2 focus:ring-white outline-none"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 mb-4 rounded-lg bg-white/95 text-gray-900 focus:ring-2 focus:ring-white outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full py-3 bg-white text-red-700 rounded-lg font-bold hover:bg-red-50 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm text-center mt-4">
          New driver?{" "}
          <Link to="/captain/register" className="font-semibold underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
