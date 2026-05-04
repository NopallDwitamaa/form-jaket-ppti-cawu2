"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { users as dummyUsers } from "./data";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
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

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUsersFromDB = async () => {
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
  };

  useEffect(() => {
    const load = async () => {
      await fetchUsersFromDB();
    };

    load();
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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredUsers = users.filter((u: User) =>
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

  const user = users.find((u: User) => u.nama === selected);
  if (!user) return;

  localStorage.setItem("user", JSON.stringify(user));

  router.push("/dashboard");
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

    if (e.key === "Enter") {
      if (activeIndex >= 0) {
        setSelected(filteredUsers[activeIndex].nama);
        setOpen(false);
        setSearch("");
        setActiveIndex(-1);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const highlightText = (text: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-indigo-200 text-indigo-900 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-md">
        <div
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl 
        shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] 
        transition hover:scale-[1.02] border border-white/40"
        >
          <h1 className="text-2xl text-gray-800 font-semibold text-center mb-2">
            Form Verifikasi Jacket
          </h1>

          <p className="text-center text-gray-500 text-sm mb-6">
            Pilih nama kamu untuk melanjutkan
          </p>

          <label className="text-sm font-medium text-gray-600">
            Pilih Nama
          </label>

          <div ref={ref} className="relative mt-2" onKeyDown={handleKeyDown}>
            <div
              onClick={() => setOpen(!open)}
              className="w-full p-3 rounded-xl bg-white/70 text-gray-800 cursor-pointer 
              shadow-sm border border-gray-200 
              hover:border-indigo-400 hover:shadow-md 
              flex justify-between items-center transition"
            >
              {selected || "-- Pilih Nama --"}
              <span
                className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </div>

            {open && (
              <div
                className="absolute z-50 w-full mt-2 
              bg-white/70 backdrop-blur-xl 
              border border-white/40 
              rounded-2xl 
              shadow-[0_20px_50px_rgba(0,0,0,0.15)] 
              overflow-hidden animate-fadeIn"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari nama..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setActiveIndex(-1);
                  }}
                  className="w-full px-4 py-3 border-b border-white/40 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                />

                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredUsers.map((u: User, i: number) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelected(u.nama);
                        setOpen(false);
                        setSearch("");
                        setActiveIndex(-1);
                      }}
                      className={`px-4 py-2 rounded-xl cursor-pointer transition
                      ${
                        i === activeIndex
                          ? "bg-indigo-500 text-white"
                          : selected === u.nama
                            ? "bg-indigo-100 text-indigo-700"
                            : "hover:bg-white/60 text-gray-800"
                      }`}
                    >
                      {highlightText(u.nama)}
                    </div>
                  ))}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="p-3 text-gray-500 text-sm">
                    Tidak ditemukan
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-blue-500 
            text-white py-3 rounded-xl font-medium 
            shadow-lg hover:shadow-xl hover:scale-[1.02] 
            transition"
          >
            Lanjut
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div
            className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-white backdrop-blur-md
            ${toast.type === "error" ? "bg-red-500/90" : "bg-green-500/90"}`}
          >
            <span>⚠️</span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}