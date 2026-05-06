// Polished landing page with real hero photography
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import heroImg from "../../assets/hero-ambulance.jpg";

export default function Home() {
  const rootRef = useRef(null);

  useEffect(() => {
  if (!rootRef.current) return;

  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".reveal",
      {
        y: 28,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
      }
    );

    gsap.fromTo(
      ".hero-img",
      {
        scale: 1.05,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 1.1,
        ease: "power2.out",
        clearProps: "all",
      }
    );
  }, rootRef);

  return () => ctx.revert();
}, []);

  return (
    <div ref={rootRef}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Emergency ambulance at dusk"
            className="hero-img w-full h-full object-cover"
            width={1280}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="max-w-2xl text-white">
            <span className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              24 / 7 Emergency Response
            </span>
            <h1 className="reveal mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Help arrives
              <br />
              <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
                in minutes.
              </span>
            </h1>
            <p className="reveal mt-6 text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
              Book a verified ambulance, track it live, and reach the nearest
              hospital with available beds — all from one calm, considered app.
            </p>
            <div className="reveal mt-10 flex flex-wrap gap-3">
              <Link
                to="/book"
                className="group px-7 py-4 rounded-full bg-white text-gray-900 font-semibold shadow-2xl hover:shadow-red-500/30 transition flex items-center gap-2"
              >
                Request Ambulance
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                to="/captain/login"
                className="px-7 py-4 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition backdrop-blur"
              >
                I'm a Driver
              </Link>
            </div>

            <div className="reveal mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { k: "8 min", v: "Avg. response" },
                { k: "240+", v: "Hospitals" },
                { k: "99.9%", v: "Uptime" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-2xl md:text-3xl font-bold">{s.k}</div>
                  <div className="text-xs text-white/60 mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative bg-gray-50 py-24 overflow-hidden">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-red-100 rounded-full blur-3xl opacity-40"></div>

  <div className="max-w-7xl mx-auto px-6 relative z-10">
    <div className="reveal max-w-2xl mb-16">
      <div className="text-sm font-bold text-red-600 uppercase tracking-[0.2em]">
        Built for emergencies
      </div>

      <h2 className="mt-5 text-5xl font-black tracking-tight text-gray-900 leading-tight">
        Every second matters.
        <br />

        <span className="text-gray-400">
          We give you all of them back.
        </span>
      </h2>

      <p className="mt-6 text-lg text-gray-600 leading-relaxed">
        RescueNow combines real-time ambulance tracking, hospital intelligence,
        and emergency response systems into one seamless platform.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6 ">
      {[
        {
          n: "01",
          t: "Live GPS tracking",
          d: "Watch your ambulance approach in real time with accurate ETAs powered by live traffic.",
        },
        {
          n: "02",
          t: "Smart hospital routing",
          d: "Automatically routed to the nearest facility with available beds and the right specialization.",
        },
        {
          n: "03",
          t: "Hands-free voice SOS",
          d: "Can't reach your phone? Just say 'help' and we'll dispatch help to your location.",
        },
      ].map((f) => (
        <div
          key={f.n}
          className="reveal group relative p-8 rounded-3xl bg-white border border-gray-200 hover:border-red-300 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
              {f.n}
            </div>

            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              {f.t}
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              {f.d}
            </p>

            <div className="mt-8 flex items-center gap-2 text-red-600 font-semibold group-hover:gap-4 transition-all duration-300">
              Learn more
              <span>→</span>
            </div>

            <div className="mt-8 h-px bg-gradient-to-r from-red-200 to-transparent"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-950 text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal text-sm font-semibold text-red-400 uppercase tracking-wider">
            How it works
          </div>
          <h2 className="reveal mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
            Three taps between you and care.
          </h2>

          <div className="mt-16 grid md:grid-cols-3 gap-10">
            {[
              { s: "Step 1", t: "Tap SOS", d: "Open the app, allow location, choose emergency type." },
              { s: "Step 2", t: "We dispatch", d: "Nearest verified ambulance is matched in seconds." },
              { s: "Step 3", t: "Track & arrive", d: "Live tracking until handoff at the right hospital." },
            ].map((x, i) => (
              <div key={x.s} className="reveal relative">
                <div className="text-xs uppercase tracking-widest text-white/40">
                  {x.s}
                </div>
                <div className="mt-3 text-2xl font-bold">{x.t}</div>
                <p className="mt-3 text-white/70 leading-relaxed">{x.d}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-2 right-0 w-16 h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 p-12 md:p-16 text-white">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Ready when you need us.
            </h2>
            <p className="mt-4 text-white/90 text-lg">
              Create your account in under a minute. Free, always.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-7 py-4 rounded-full bg-white text-red-700 font-semibold hover:bg-red-50 transition"
              >
                Create account
              </Link>
              <Link
                to="/book"
                className="px-7 py-4 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition"
              >
                Book now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚑</span>
            <span className="font-semibold text-gray-900">RescueNow</span>
          </div>
          <div>© {new Date().getFullYear()} RescueNow. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}