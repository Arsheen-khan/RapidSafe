// User login page
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login() {
  const { loginUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      toast.push("Welcome back!", "success");
      navigate("/book");
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
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100"
      >
        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">Login to your account</p>
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
          className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          New here?{" "}
          <Link to="/register" className="text-red-600 font-semibold">
            Create account
          </Link>
        </p>
        <p className="text-xs text-center mt-2 text-gray-400">
          Driver?{" "}
          <Link to="/captain/login" className="underline">
            Captain login
          </Link>
        </p>
      </form>
    </div>
  );
}
