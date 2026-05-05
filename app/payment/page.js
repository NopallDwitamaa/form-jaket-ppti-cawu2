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

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

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

  const rupiah = (n) => "Rp. " + n.toLocaleString("id-ID");

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const maxSize = 1 * 1024 * 1024;

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

    setLoading(true);

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
          user_id: user.id,
          nama: user.nama,
          nickname: user.nickname,
          size: user.size,
          model: user.model,
          total,
          bukti_url: imageUrl,
        },
      ]);

      if (error) throw error;

      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (existing && existing.length > 0) {
        await supabase
          .from("users")
          .update({ status: "pending" })
          .eq("id", user.id);
      }

      setSuccess(true);

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
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-5 py-6 text-slate-900">
      <style>{`
      @keyframes pageIn {
        from { opacity: 0; transform: translateY(18px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes cardIn {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes modalIn {
        from { opacity: 0; transform: translateY(16px) scale(.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes toastIn {
        from { opacity: 0; transform: translateX(16px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes softFloat {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(0, -8px, 0); }
      }

      @keyframes sheen {
        from { transform: translateX(-120%); }
        to { transform: translateX(120%); }
      }
        
      @keyframes glowLine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes breathe {
  0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 18px 42px rgba(15,23,42,.18); }
  50% { transform: translateY(-3px) scale(1.01); box-shadow: 0 24px 55px rgba(15,23,42,.22); }
}

@keyframes revealUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.payment-scroll::-webkit-scrollbar {
  width: 8px;
}

.payment-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.payment-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
  border: 2px solid white;
}

.payment-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

    `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,.14),transparent_34%),linear-gradient(315deg,rgba(16,185,129,.14),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.92),transparent_32%)]" />
      <div className="absolute left-0 top-0 h-full w-full opacity-[.22] [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="[animation:pageIn_.65s_ease_both]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/75 px-4 py-2 text-sm font-medium text-cyan-800 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Payment Verification
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Selesaikan pembayaran dan upload bukti transfer.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
            Scan QRIS, bayar sesuai nominal, lalu upload bukti pembayaran. Data
            kamu akan masuk ke proses verifikasi.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["Nama", user.nama],
              ["Size", user.size],
              ["Total", rupiah(calculatePrice())],
            ].map(([label, value], index) => (
              <div
                key={label}
                className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur [animation:softFloat_4s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 140}ms` }}
              >
                <p className="text-[10px] font-medium uppercase tracking-[.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px] self-center [animation:pageIn_.55s_ease_both]">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
          >
            ← Kembali
          </button>

          <div className="relative max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,.18)] backdrop-blur-2xl">
            <div className="sticky -top-6 z-10 -mx-6 -mt-6 mb-5 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" />

              <p className="text-xs font-medium text-cyan-700">
                Pembayaran Jacket
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Payment Summary
              </h2>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                ["Nama", user.nama],
                ["Size", user.size],
                ["Model", user.model],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 [animation:cardIn_.45s_ease_both]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <p className="text-[9px] font-medium uppercase tracking-[.12em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-slate-900">
                    {value || "-"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-5 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-[0_18px_42px_rgba(15,23,42,.22)]">
              <div className="relative p-5">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent [animation:sheen_1.6s_ease_infinite]" />

                <p className="relative text-xs text-slate-300">
                  Total Pembayaran
                </p>
                <p className="relative mt-1 text-3xl font-bold">
                  {rupiah(calculatePrice())}
                </p>
                <p className="relative mt-2 text-[11px] text-cyan-200">
                  Pastikan nominal pembayaran sesuai.
                </p>
              </div>
            </div>

            <div className="mb-5 text-center">
              <p className="mb-3 text-xs font-semibold text-slate-700">
                Scan QRIS
              </p>

              <div className="inline-block rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,.12)]">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-2">
                  <img
                    src="/qris.png"
                    alt="QRIS"
                    className="mx-auto w-full max-w-[300px] rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
              <p className="font-semibold">Langkah pembayaran</p>
              <div className="mt-3 space-y-2 text-xs leading-5 text-cyan-800">
                <p>1. Scan QRIS di atas.</p>
                <p>2. Transfer sesuai nominal yang tertera.</p>
                <p>3. Upload bukti pembayaran maksimal 1MB.</p>
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-end justify-between gap-3">
                <label className="text-sm font-semibold text-slate-700">
                  Upload Bukti Pembayaran
                </label>
                <span className="text-xs text-slate-400">Max 1MB</span>
              </div>

              <label
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition ${
                  loading
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                    : file
                      ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                      : "border-cyan-300 bg-cyan-50 hover:-translate-y-0.5 hover:bg-cyan-100 hover:shadow-md"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-base font-bold ${
                    file
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-cyan-700 shadow-sm"
                  }`}
                >
                  {file ? "OK" : "+"}
                </span>

                <span className="mt-3 max-w-full truncate text-sm font-semibold text-slate-800">
                  {file ? file.name : "Klik untuk upload bukti"}
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Format gambar, ukuran maksimal 1MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={loading}
                  className="hidden"
                />
              </label>

              {preview && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm [animation:cardIn_.25s_ease_both]">
                  <img
                    src={preview}
                    alt="Preview bukti pembayaran"
                    className="mx-auto max-h-56 rounded-2xl object-contain"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-[0_14px_30px_rgba(15,23,42,.22)] transition ${
                loading
                  ? "cursor-not-allowed bg-slate-400 text-white"
                  : "bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_42px_rgba(15,23,42,.28)]"
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mengirim...
                </>
              ) : (
                <>
                  <span className="relative z-10">Kirim Bukti Pembayaran</span>
                  <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100 [animation:sheen_1.2s_ease]" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/25 px-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-6 py-4 shadow-[0_20px_60px_rgba(15,23,42,.22)]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="text-sm font-semibold text-slate-700">
              Mengupload...
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-5 top-5 z-50 [animation:toastIn_.22s_ease_both]">
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md ${
              toast.type === "error" ? "bg-rose-500/95" : "bg-emerald-500/95"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
              {toast.type === "error" ? "!" : "OK"}
            </span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[26px] border border-white/80 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,.28)] [animation:modalIn_.22s_ease_both]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">
              OK
            </div>

            <h2 className="text-xl font-semibold text-slate-950">
              Pembayaran Berhasil
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Bukti pembayaran kamu sudah kami terima. Kamu akan diarahkan ke
              halaman utama.
            </p>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
