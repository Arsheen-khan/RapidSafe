// User registration
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Register() {
  const { registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
  e.preventDefault();

  // 🔥 Split fullname here (extra safety)
  const [first, ...rest] = form.fullname.trim().split(" ");
  const lastname = rest.join(" ") || "User";

  setLoading(true);
  try {
    await registerUser(
      `${first} ${lastname}`, // send clean name
      form.email,
      form.password
    );

    toast.push("Account created!", "success");
    navigate("/book");
  } catch (err) {
    console.log(err.response?.data); // 🔥 debug
    toast.push(
      err?.response?.data?.message || "Registration failed",
      "error"
    );
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
        <h2 className="text-2xl font-bold mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Join RescueNow</p>
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
          className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          Have an account?{" "}
          <Link to="/login" className="text-red-600 font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
