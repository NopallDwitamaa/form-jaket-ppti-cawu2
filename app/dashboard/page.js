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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <button
          onClick={() => router.push("/")}
          className="mb-4 px-3 py-1 rounded-lg bg-white shadow text-black font-bold hover:bg-gray-100 text-sm"
        >
          ←
        </button>

        <div className="bg-white w-full p-8 rounded-2xl shadow-xl border border-gray-200">
          <h1 className="text-2xl text-black font-bold text-center mb-6">
            Data Jacket Kamu
          </h1>

          <div className="space-y-2 text-gray-700 mb-6 text-sm">
            <p>
              <b>Nama:</b> {user.nama}
            </p>
            <p>
              <b>Nickname:</b> {user.nickname}
            </p>
            <p>
              <b>Size:</b> {user.size}
            </p>
            <p>
              <b>Model:</b> {user.model}
            </p>
          </div>

          {(() => {
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
              base - subsidy + additions.reduce((s, i) => s + i.value, 0);

            const rupiah = (n) => "Rp. " + n.toLocaleString("id-ID");

            return (
              <div className="bg-[#fafafa] font-mono text-[13px] text-black p-5 rounded-2xl border border-dashed border-gray-400 mb-6 shadow-inner">
                <div className="text-center">
                  <p className="font-bold tracking-widest">JACKET BILL</p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>

                <div className="border-t border-dashed my-3" />

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Harga Jacket</span>
                    <span>{rupiah(base)}</span>
                  </div>

                  <div className="flex justify-between text-green-600">
                    <span>Subsidi Kelas</span>
                    <span>- {rupiah(subsidy)}</span>
                  </div>

                  {additions.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-orange-500"
                    >
                      <span>{item.label}</span>
                      <span>+ {rupiah(item.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed my-3" />

                <div className="flex justify-between font-bold text-base">
                  <span>TOTAL</span>
                  <span>{rupiah(total)}</span>
                </div>

                <p className="text-center text-[10px] mt-2 text-gray-400">
                  Ref: {refCode}
                </p>

                <div className="border-t border-dashed my-3" />

                <p className="text-center text-xs text-gray-500">
                  Thank you 🙌
                </p>
              </div>
            );
          })()}

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="w-1/2 bg-yellow-400 hover:bg-yellow-500 text-white p-3 rounded-xl font-semibold"
            >
              Update
            </button>

            <button
              onClick={() => router.push("/payment")}
              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold"
            >
              Lanjut
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-scaleIn">
            <h2 className="text-lg text-black font-bold mb-2">
              Update Tidak Tersedia
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Data jacket sudah disetor ke vendor sehingga tidak bisa diubah
              langsung.
              <br />
              <br />
              Jika ada kesalahan, silakan hubungi PIC melalui WhatsApp.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-1/2 bg-gray-200 text-black hover:bg-gray-300 p-2 rounded-xl"
              >
                Tutup
              </button>

              <a
                href={`https://wa.me/6287766747506?text=Halo kak, saya ${user.nama} ingin request perubahan data jacket`}
                target="_blank"
                className="w-1/2 bg-green-500 text-white hover:bg-green-600 p-2 rounded-xl text-center"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
