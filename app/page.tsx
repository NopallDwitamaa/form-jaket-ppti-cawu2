"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { users } from "./data";

type User = {
  nama: string;
  size: string;
  model: string;
  nickname: string;
  updated?: boolean;
};

type Toast = {
  type: "error" | "success";
  message: string;
};

export default function Home() {
  const router = useRouter();

  const [selected, setSelected] = useState<string>("");
  const [toast, setToast] = useState<Toast | null>(null);

  const handleNext = () => {
    if (!selected) {
      setToast({
        type: "error",
        message: "Pilih nama dulu!",
      });

      setTimeout(() => setToast(null), 3000);
      return;
    }

    const user = users.find((u: User) => u.nama === selected);

    if (!user) return;

    localStorage.setItem("user", JSON.stringify(user));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-6">

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transition hover:scale-[1.02] border border-gray-200">

        {/* HEADER */}
        <h1 className="text-2xl text-black font-bold text-center mb-2">
          Form Verifikasi Jacket
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          Pilih nama kamu untuk melanjutkan
        </p>

        {/* DROPDOWN */}
        <label className="text-sm font-medium text-gray-700">
          Pilih Nama
        </label>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full mt-2 p-3 border rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Nama --</option>

          {users.map((u: User, i: number) => (
            <option key={i} value={u.nama}>
              {u.nama}
            </option>
          ))}
        </select>

        {/* BUTTON */}
        <button
          onClick={handleNext}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
        >
          Lanjut
        </button>

      </div>

      {/* 🔥 TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
          >
            <span>⚠️</span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}