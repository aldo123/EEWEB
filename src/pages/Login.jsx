import { useState } from "react";

import { supabase }
from "../supabase/supabase";

export default function Login() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {

    try {

      const { data, error } =
        await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

      if (error || !data) {

        console.log(error);

        alert("User not found");

        return;

      }

      if (String(data.password) !== String(password)) {

        alert("Wrong password");

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

    }

  };

  return (

    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-200 via-100 to-300 flex items-center justify-center p-6">

      {/* LIGHT EFFECT */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-lime-300/20 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-emerald-200/10 blur-[120px] rounded-full"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[380px] bg-white rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,.25)] overflow-hidden border border-white/30">

        {/* TOP HEADER */}
        <div className="relative bg-gradient-to-br from-[#14532d] via-[#166534] to-[#22c55e] px-8 pt-10 pb-20 text-white overflow-hidden">

          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>

          <div className="relative z-10 text-center">

            <div className="w-24 h-24 mx-auto rounded-[28px] bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center text-5xl shadow-lg">

              🏭

            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight">
              WIK-TPM
            </h1>

            <p className="mt-3 text-white/80 text-sm leading-6">
              Enterprise Maintenance System
            </p>

          </div>

        </div>

        {/* FORM */}
        <div className="px-7 pb-8 -mt-10 relative z-20">

          <div className="bg-white rounded-[30px] shadow-[0_10px_30px_rgba(15,23,42,.12)] p-6 border border-slate-100">

            <div className="space-y-5">

              {/* USERNAME */}
              <div>

                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-4 focus:ring-green-100 focus:border-green-600 transition-all"
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-4 focus:ring-green-100 focus:border-green-600 transition-all"
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

              </div>

              {/* BUTTON */}
              <button
                onClick={handleLogin}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#166534] to-[#22c55e] text-white font-bold text-lg shadow-[0_10px_25px_rgba(22,101,52,.35)] active:scale-[0.98] transition-all"
              >
                Login
              </button>

            </div>

            {/* FOOTER */}
            <p className="text-center text-slate-400 text-xs mt-6 leading-6">

              Smart Manufacturing • Engineering • Automation

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}