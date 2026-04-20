/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Payment() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    }
    return null;
  });

  if (!user) return <div className="p-10">Loading...</div>;

  const getSizePrice = (size) => {
    if (!size) return 0;

    if (size.endsWith("S")) return 0;

    if (size.endsWith("L")) {
      const countX = (size.match(/X/g) || []).length;

      if (countX <= 1) return 0;

      return (countX - 1) * 10000;
    }

    return 0;
  };

  const calculatePrice = () => {
    let total = 125000;

    if (user.model === "BOXY") total += 20000;

    total += getSizePrice(user.size);

    return total;
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const maxSize = 1 * 1024 * 1024; // 1MB

    if (selected.size > maxSize) {
      setToast({
        type: "error",
        message: "Ukuran file maksimal 1MB!",
      });

      setTimeout(() => setToast(null), 3000);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (!file) {
      setToast({ type: "error", message: "Upload bukti dulu!" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true); // 🔥 mulai loading

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bukti")
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("bukti").getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      const total = calculatePrice();

      const { error } = await supabase.from("orders").insert([
        {
          nama: user.nama,
          nickname: user.nickname,
          size: user.size,
          model: user.model,
          total,
          bukti_url: imageUrl,
        },
      ]);

      if (error) throw error;

      if (file.size > 1024 * 1024) {
        setToast({
          type: "error",
          message: "File terlalu besar!",
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      setSuccess(true); // modal success

      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: err.message || "Terjadi kesalahan!",
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false); // 🔥 stop loading
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 flex items-center justify-center p-6">
    <div className="w-full max-w-lg">
      {/* 🔙 BACK */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 px-3 py-1 rounded-lg bg-white text-black shadow hover:bg-gray-100 text-sm"
      >
        ← Kembali
      </button>

      {/* CARD */}
      <div className="bg-white border border-gray-200 shadow-2xl w-full p-8 rounded-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Pembayaran Jacket
        </h1>

        {/* INFO */}
        <div className="bg-white text-black border border-gray-200 shadow-sm p-4 rounded-xl mb-4 text-sm space-y-1">
          <p><b>Nama:</b> {user.nama}</p>
          <p><b>Size:</b> {user.size}</p>
          <p><b>Model:</b> {user.model}</p>
        </div>

        {/* 🔥 HINT USER */}
        <p className="text-xs text-gray-500 mb-4 text-center">
          Pastikan nama pada bukti sesuai: <b>{user.nama}</b>
        </p>

        {/* TOTAL */}
        <div className="bg-indigo-600 text-white rounded-xl p-5 text-center mb-6 shadow-lg">
          <p className="text-sm opacity-80">Total Pembayaran</p>
          <p className="text-3xl font-bold">
            Rp {calculatePrice().toLocaleString("id-ID")}
          </p>
        </div>

        {/* QRIS */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-700 mb-3">Scan QRIS di bawah ini</p>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg inline-block">
            <img
              src="/qris.png"
              alt="QRIS"
              className="w-72 md:w-80 mx-auto rounded-xl"
            />
          </div>
        </div>

        {/* INSTRUKSI */}
        <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-700 mb-6 space-y-1">
          <p>1. Scan QRIS di atas</p>
          <p>2. Transfer sesuai nominal</p>
          <p>3. Upload bukti pembayaran</p>
        </div>

        {/* UPLOAD */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Upload Bukti Pembayaran
          </label>

          {/* 🔥 INFO SIZE */}
          <p className="text-xs text-gray-500 mb-2">
            Maksimal ukuran file: 1MB
          </p>

          <label className={`flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-xl p-6 cursor-pointer transition
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-100"}
          `}>
            <span className="text-indigo-600 font-medium">
              Klik untuk upload bukti
            </span>

            {file && (
              <p className="text-green-600 mt-2 text-xs">✔ {file.name}</p>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={loading} // 🔥 disable saat loading
              className="hidden"
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-4 rounded-xl shadow max-h-48 mx-auto"
            />
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-3 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] text-white"
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mengirim...
            </>
          ) : (
            "Kirim Bukti Pembayaran"
          )}
        </button>
      </div>
    </div>

    {/* 🔥 OVERLAY LOADING (BARU) */}
    {loading && (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
        <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-700">Mengupload...</p>
        </div>
      </div>
    )}

    {/* 🔥 TOAST */}
    {toast && (
      <div className="fixed top-5 right-5 z-50 animate-slideIn">
        <div
          className={`px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white
          ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      </div>
    )}

    {/* SUCCESS */}
    {success && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-scaleIn">
          <div className="text-5xl mb-3">✅</div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Pembayaran Berhasil!
          </h2>

          <p className="text-sm text-gray-600 mb-5">
            Bukti pembayaran kamu sudah kami terima.
            <br />
            Kamu akan diarahkan ke halaman utama.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    )}
  </div>
);
}
