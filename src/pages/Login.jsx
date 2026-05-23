import { useState } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
  LockKeyhole,
} from "lucide-react";

import { supabase } from "../supabase/supabase";

export default function Login() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

      if (error || !data) {

        alert("User not found");

        setLoading(false);

        return;

      }

      if (
        String(data.password) !==
        String(password)
      ) {

        alert("Wrong password");

        setLoading(false);

        return;

      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      alert(`Welcome ${data.name}`);

      window.location.reload();

    } catch (error) {

      console.log(error);

      alert("Login Failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#030712] flex items-center justify-center px-6">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#22c55e_1px,transparent_1px),linear-gradient(to_bottom,#22c55e_1px,transparent_1px)] bg-[size:80px_80px]"></div>

      {/* GLOW EFFECT */}
      <div className="absolute top-[-150px] left-[-120px] w-[420px] h-[420px] bg-green-500/20 blur-[140px] rounded-full"></div>

      <div className="absolute bottom-[-150px] right-[-120px] w-[420px] h-[420px] bg-emerald-400/10 blur-[140px] rounded-full"></div>

      {/* ANIMATED RING */}
      <div className="absolute w-[700px] h-[700px] border border-green-500/10 rounded-full animate-pulse"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[1200px] rounded-[40px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(34,197,94,.15)] grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden bg-gradient-to-br from-[#07130b] via-[#08170d] to-[#0b1f12]">

          {/* TOP */}
          <div>

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,.5)]">

                <Cpu className="text-white w-8 h-8" />

              </div>

              <div>

                <h1 className="text-4xl font-black text-white tracking-tight">
                  WIK-TPM
                </h1>

                <p className="text-green-400 text-sm mt-1">
                  Smart Engineering Platform
                </p>

              </div>

            </div>

            {/* HERO */}
            <div className="mt-20">

              <h2 className="text-6xl leading-[72px] font-black text-white tracking-tight">

                Future of
                <br />

                Maintenance
                <br />

                Engineering

              </h2>

              <p className="mt-8 text-slate-400 leading-8 text-lg max-w-[500px]">

                Integrated TPM system for manufacturing,
                automation, digital monitoring, preventive
                maintenance, and engineering management.

              </p>

            </div>

          </div>

          {/* BOTTOM FEATURE */}
          <div className="grid grid-cols-3 gap-4">

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">

              <ShieldCheck className="text-green-400 w-7 h-7" />

              <p className="text-white mt-4 font-semibold">
                Secure Access
              </p>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                Enterprise-grade authentication
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">

              <Cpu className="text-green-400 w-7 h-7" />

              <p className="text-white mt-4 font-semibold">
                Smart System
              </p>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                Real-time automation monitoring
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">

              <LockKeyhole className="text-green-400 w-7 h-7" />

              <p className="text-white mt-4 font-semibold">
                Protected Data
              </p>

              <p className="text-slate-500 text-sm mt-2 leading-6">
                Advanced database security
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex items-center justify-center p-8 lg:p-14">

          <div className="w-full max-w-[420px]">

            {/* MOBILE TITLE */}
            <div className="lg:hidden text-center mb-10">

              <div className="w-24 h-24 mx-auto rounded-[30px] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,.45)]">

                <Cpu className="text-white w-12 h-12" />

              </div>

              <h1 className="text-white text-4xl font-black mt-6">
                WIK-TPM
              </h1>

              <p className="text-slate-400 mt-3">
                Enterprise Maintenance System
              </p>

            </div>

            {/* LOGIN PANEL */}
            <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(0,0,0,.25)]">

              <div className="mb-8">

                <h2 className="text-3xl font-black text-white">
                  Welcome Back
                </h2>

                <p className="text-slate-400 mt-3 leading-7">
                  Login to continue accessing your
                  engineering management system.
                </p>

              </div>

              {/* USERNAME */}
              <div className="mb-5">

                <label className="block text-sm font-semibold text-slate-300 mb-3">

                  Username

                </label>

                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  className="w-full h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                />

              </div>

              {/* PASSWORD */}
              <div className="mb-7">

                <label className="block text-sm font-semibold text-slate-300 mb-3">

                  Password

                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full h-14 px-5 pr-14 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute top-1/2 right-5 -translate-y-1/2 text-slate-500 hover:text-green-400 transition-all"
                  >

                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}

                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="relative overflow-hidden w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-[0_10px_30px_rgba(34,197,94,.35)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60"
              >

                <span className="relative z-10">

                  {loading
                    ? "Authenticating..."
                    : "Login System"}

                </span>

                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.18),transparent)] translate-x-[-200%] hover:translate-x-[200%] duration-1000"></div>

              </button>

              {/* FOOTER */}
              <div className="mt-8 pt-6 border-t border-white/10">

                <div className="flex items-center justify-between text-xs text-slate-500">

                  <span>
                    WIK-TPM Enterprise
                  </span>

                  <span>
                    v2.0 Industrial Edition
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}