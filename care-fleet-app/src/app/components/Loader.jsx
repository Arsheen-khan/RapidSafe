// Pulsing ambulance loader
export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-red-200 border-t-red-600 animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">
          🚑
        </span>
      </div>
      <p className="text-sm text-gray-600 animate-pulse">{label}</p>
    </div>
  );
}
