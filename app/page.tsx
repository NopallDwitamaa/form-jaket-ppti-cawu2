"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { users as dummyUsers } from "./data";
import { supabase } from "@/lib/supabase";

type User = {
  id?: string;
  nama: string;
  size: string;
  model: string;
  nickname: string;
  updated?: boolean;
  paid?: boolean;
};

type Toast = {
  type: "error" | "success";
  message: string;
};

export default function Home() {
  const router = useRouter();

  const [selected, setSelected] = useState<string>("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    accepted: 0,
    rejected: 0,
    pending: 0,
  });

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUsersFromDB = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "available")
        .order("urutan", { ascending: true, nullsFirst: false });

      if (!error && data) {
        setUsers(data);
      } else {
        setUsers(dummyUsers);
      }

      setLoading(false);
    };

    const fetchStats = async () => {
      const { data, error } = await supabase.from("orders").select("status");

      if (error || !data) return;

      setStats({
        accepted: data.filter((order) => order.status === "verified").length,
        rejected: data.filter((order) => order.status === "rejected").length,
        pending: data.filter((order) => order.status === "pending").length,
      });
    };

    fetchUsersFromDB();
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const filteredUsers = users.filter((u) =>
    u.nama.toLowerCase().includes(search.toLowerCase()),
  );

  const handleNext = () => {
    if (!selected) {
      setToast({
        type: "error",
        message: "Pilih nama dulu!",
      });

      setTimeout(() => setToast(null), 3000);
      return;
    }

    const user = users.find((u) => u.nama === selected);
    if (!user) return;

    localStorage.setItem("user", JSON.stringify(user));
    router.push("/dashboard");
  };

  const handleSelect = (user: User) => {
    setSelected(user.nama);
    setOpen(false);
    setSearch("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : prev,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(filteredUsers[activeIndex]);
    }

    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const highlightText = (text: string) => {
    if (!search) return text;

    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const splitRegex = new RegExp(`(${safeSearch})`, "gi");
    const testRegex = new RegExp(`^${safeSearch}$`, "i");

    return text.split(splitRegex).map((part, i) =>
      testRegex.test(part) ? (
        <span key={i} className="rounded-md bg-cyan-100 px-1 text-cyan-900">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-5 py-8 text-slate-900">
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(18px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes softFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -10px, 0); }
        }

        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes sheen {
          from { transform: translateX(-120%); }
          to { transform: translateX(120%); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,.16),transparent_34%),linear-gradient(315deg,rgba(16,185,129,.16),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.9),transparent_32%)]" />
      <div className="absolute left-0 top-0 h-full w-full opacity-[.28] [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_440px]">
          <div className="hidden lg:block">
            <div className="max-w-xl [animation:pageIn_.7s_ease_both]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-4 py-2 text-sm font-medium text-cyan-800 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Jacket Verification System
              </div>

              <h1 className="text-5xl font-semibold leading-tight tracking-normal text-slate-950">
                Verifikasi data jacket dengan tampilan yang rapi dan cepat.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                Pilih nama, lanjutkan ke dashboard, dan pastikan data pesanan
                kamu sesuai sebelum proses berikutnya.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {[
                  ["Accepted", stats.accepted],
                  ["Rejected", stats.rejected],
                  ["Pending", stats.pending],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur [animation:softFloat_4s_ease-in-out_infinite]"
                    style={{ animationDelay: `${index * 140}ms` }}
                  >
                    <p className="text-xs font-medium uppercase tracking-[.12em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md [animation:pageIn_.55s_ease_both]">
            <div className="relative rounded-[28px] border border-white/80 bg-white/95 p-7 shadow-[0_24px_80px_rgba(15,23,42,.16)] backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/60 to-transparent" />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-cyan-700">
                      Form Verifikasi
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                      Jacket Order
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                    <p className="text-[11px] font-medium uppercase tracking-[.14em] text-slate-400">
                      Nama
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {users.length || "-"}
                    </p>
                  </div>
                </div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pilih Nama
                </label>

                <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
                  <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-slate-800 shadow-sm outline-none transition duration-300 hover:border-cyan-300 hover:shadow-md focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  >
                    <span className="truncate text-sm font-medium">
                      {selected || "-- Pilih Nama --"}
                    </span>

                    <span
                      className={`ml-3 text-sm text-slate-400 transition duration-300 ${
                        open ? "rotate-180 text-cyan-600" : ""
                      }`}
                    >
                      ▼
                    </span>

                    <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 transition group-hover:opacity-100 [animation:sheen_1.2s_ease]" />
                  </button>

                  {open && (
                    <div className="absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,.22)] [animation:menuIn_.18s_ease_both]">
                      <div className="border-b border-slate-200 bg-slate-50 p-3">
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Cari nama..."
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setActiveIndex(-1);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto bg-white p-2">
                        {loading && (
                          <div className="space-y-2 p-2">
                            {[0, 1, 2].map((item) => (
                              <div
                                key={item}
                                className="h-11 animate-pulse rounded-xl bg-slate-100"
                              />
                            ))}
                          </div>
                        )}

                        {!loading &&
                          filteredUsers.map((u, i) => {
                            const isActive = i === activeIndex;
                            const isSelected = selected === u.nama;

                            return (
                              <button
                                type="button"
                                key={u.id ?? u.nama}
                                onClick={() => handleSelect(u)}
                                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition duration-200 ${
                                  isActive
                                    ? "bg-slate-950 text-white shadow-md"
                                    : isSelected
                                      ? "bg-cyan-50 text-cyan-900 ring-1 ring-cyan-200"
                                      : "text-slate-800 hover:bg-slate-100"
                                }`}
                              >
                                <span className="min-w-0 truncate font-semibold">
                                  {isActive ? u.nama : highlightText(u.nama)}
                                </span>

                                {isSelected && (
                                  <span
                                    className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                                      isActive
                                        ? "bg-white/15 text-white"
                                        : "bg-cyan-100 text-cyan-800"
                                    }`}
                                  >
                                    Dipilih
                                  </span>
                                )}
                              </button>
                            );
                          })}

                        {!loading && filteredUsers.length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm font-semibold text-slate-800">
                              Tidak ditemukan
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Coba ketik nama yang lain.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_42px_rgba(15,23,42,.28)] active:translate-y-0"
                >
                  Lanjut ke Dashboard
                </button>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Pastikan nama yang dipilih sudah sesuai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed right-5 top-5 z-[60] [animation:toastIn_.22s_ease_both]">
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md ${
              toast.type === "error" ? "bg-rose-500/95" : "bg-emerald-500/95"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
              !
            </span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </main>
  );
}
