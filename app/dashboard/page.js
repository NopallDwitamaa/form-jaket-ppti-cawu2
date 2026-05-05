"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    }
    return null;
  });

  const [showModal, setShowModal] = useState(false);

  const [refCode] = useState(() => {
    const name = user?.nama?.split(" ")[0]?.toUpperCase() || "USER";
    return `${name}-${Date.now().toString().slice(-5)}`;
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

  const base = 250000;
  const subsidy = 125000;
  const additions = [];

  if (user.model === "BOXY") {
    additions.push({ label: "Model BOXY", value: 20000 });
  }

  const sizePrice = getSizePrice(user.size);

  if (sizePrice > 0) {
    additions.push({
      label: `Size ${user.size}`,
      value: sizePrice,
    });
  }

  const total =
    base - subsidy + additions.reduce((sum, item) => sum + item.value, 0);
  const rupiah = (n) => "Rp. " + n.toLocaleString("id-ID");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-5 py-8 text-slate-900">
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

        @keyframes softFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }

        @keyframes sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(120%); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,.16),transparent_34%),linear-gradient(315deg,rgba(16,185,129,.16),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.9),transparent_32%)]" />
      <div className="absolute left-0 top-0 h-full w-full opacity-[.25] [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_460px]">
          <div className="hidden lg:block [animation:pageIn_.65s_ease_both]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/75 px-4 py-2 text-sm font-medium text-cyan-800 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Jacket Verification
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-950">
              Review data jacket sebelum lanjut ke pembayaran.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Pastikan nama, nickname, size, dan model sudah sesuai. Rincian
              harga otomatis dihitung berdasarkan pilihan kamu.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["Size", user.size || "-"],
                ["Model", user.model || "-"],
                ["Total", rupiah(total)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur [animation:softFloat_4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md [animation:pageIn_.55s_ease_both]">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-lg font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              ←
            </button>

            <div className="relative rounded-[28px] border border-white/80 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,.16)] backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" />

              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-cyan-700">
                    Data Jacket Kamu
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    Order Summary
                  </h2>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                  <p className="text-[11px] font-medium uppercase tracking-[.14em] text-slate-400">
                    Ref
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {refCode.split("-")[1]}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                {[
                  ["Nama", user.nama],
                  ["Nickname", user.nickname],
                  ["Size", user.size],
                  ["Model", user.model],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 [animation:cardIn_.45s_ease_both]"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-6 rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 font-mono text-[13px] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_16px_40px_rgba(15,23,42,.08)] [animation:cardIn_.45s_ease_both]">
                <div className="text-center">
                  <p className="font-bold tracking-[.22em] text-slate-950">
                    JACKET BILL
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>

                <div className="my-4 border-t border-dashed border-slate-400" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span>Harga Jacket</span>
                    <span className="shrink-0">{rupiah(base)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-emerald-600">
                    <span>Subsidi Kelas</span>
                    <span className="shrink-0">- {rupiah(subsidy)}</span>
                  </div>

                  {additions.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 text-amber-600"
                    >
                      <span>{item.label}</span>
                      <span className="shrink-0">+ {rupiah(item.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-dashed border-slate-400" />

                <div className="flex items-center justify-between gap-4 text-base font-bold">
                  <span>TOTAL</span>
                  <span className="shrink-0">{rupiah(total)}</span>
                </div>

                <p className="mt-4 text-center text-[10px] text-slate-400">
                  Ref: {refCode}
                </p>

                <div className="my-4 border-t border-dashed border-slate-400" />

                <p className="text-center text-xs text-slate-500">
                  Thank you 🙌
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-md active:translate-y-0"
                >
                  Update
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/payment")}
                  className="group relative overflow-hidden rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,.22)] transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_42px_rgba(15,23,42,.28)] active:translate-y-0"
                >
                  <span className="relative z-10">Lanjut</span>
                  <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100 [animation:sheen_1.2s_ease]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[26px] border border-white/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.28)] [animation:modalIn_.22s_ease_both]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl font-bold text-amber-700">
              !
            </div>

            <h2 className="text-xl font-semibold text-slate-950">
              Update Tidak Tersedia
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Data jacket sudah disetor ke vendor sehingga tidak bisa diubah
              langsung. Jika ada kesalahan, silakan hubungi PIC melalui
              WhatsApp.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Tutup
              </button>

              <a
                href={`https://wa.me/6287766747506?text=Halo kak, saya ${user.nama} ingin request perubahan data jacket`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
