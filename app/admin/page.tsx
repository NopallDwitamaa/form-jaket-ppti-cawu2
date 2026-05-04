"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type OrderStatus = "pending" | "verified" | "rejected";

type Order = {
  id: string;
  user_id: string;
  nama: string;
  size: string;
  model: string;
  total: number;
  bukti_url: string;
  status: OrderStatus;
  created_at: string;
};

type FilterType = "all" | "pending" | "verified" | "rejected";

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAuth, setIsAuth] = useState(false);
  const [inputPass, setInputPass] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("pending");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);

  // const showToast = (msg: string) => {
  //   setToast(msg);
  //   setTimeout(() => setToast(null), 2500);
  // };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAuth) return;

    const load = async () => {
      await fetchOrders();
    };

    load();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuth]);

  const handleApprove = async (order: Order) => {
    setRemovingId(order.id);

    await supabase
      .from("orders")
      .update({ status: "verified" })
      .eq("id", order.id);

    await supabase
      .from("users")
      .update({ status: "verified" })
      .eq("id", order.user_id);

    setSuccessModal("Berhasil di-approve");

    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }, 300);
  };

  const handleReject = async (order: Order) => {
    setRemovingId(order.id);

    // update order
    await supabase
      .from("orders")
      .update({ status: "rejected" })
      .eq("id", order.id);

    await supabase
      .from("users")
      .update({ status: "available" })
      .eq("id", order.user_id);

    setSuccessModal("Berhasil di-reject");

    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }, 300);
  };

  const handleDelete = async (order: Order) => {
    setRemovingId(order.id);

    await supabase.from("orders").delete().eq("id", order.id);

    await supabase
      .from("users")
      .update({ status: "available" })
      .eq("id", order.user_id);

    setSuccessModal("Data berhasil dihapus");

    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }, 300);
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => o.nama.toLowerCase().includes(search.toLowerCase()))
      .filter((o) => (filter === "all" ? true : o.status === filter));
  }, [orders, search, filter]);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 to-purple-300">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Admin Login</h1>

          <input
            type="password"
            value={inputPass}
            onChange={(e) => setInputPass(e.target.value)}
            className="w-full p-3 border rounded-xl mb-4 text-black"
          />

          <button
            onClick={() => {
              if (inputPass === "nopalgantenk123") setIsAuth(true);
              else alert("Password salah!");
            }}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl"
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 flex justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="flex gap-3 mb-6 bg-white/70 p-3 rounded-2xl shadow">
          <input
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-xl border"
          />

          <select
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilter(e.target.value as FilterType)
            }
            className="p-3 rounded-xl border"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`cursor-pointer bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow flex gap-4 transition
              ${removingId === order.id ? "opacity-0 scale-95" : "hover:scale-[1.02]"}`}
            >
              <Image
                src={order.bukti_url}
                alt="bukti"
                width={160}
                height={160}
                style={{ width: "160px", height: "auto" }}
              />

              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="font-semibold text-black">{order.nama}</p>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-sm text-black/80">
                  {order.size} • {order.model}
                </p>

                <p className="text-sm font-medium text-black">
                  Rp {order.total.toLocaleString()}
                </p>

                {order.status === "pending" && (
                  <div
                    className="flex gap-2 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleApprove(order)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(order)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => setConfirmDelete(order)}
                      className="bg-gray-800 hover:bg-black text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {successModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setSuccessModal(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-green-600 mb-2">
              Berhasil 🎉
            </h2>

            <p className="text-sm text-gray-600 mb-4">{successModal}</p>

            <button
              onClick={() => setSuccessModal(null)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-md text-black animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-lg mb-3 text-black">
              {selectedOrder.nama}
            </h2>

            <Image
              src={selectedOrder.bukti_url}
              alt="bukti"
              width={400}
              height={400}
              onClick={() => setZoomImage(selectedOrder.bukti_url)}
              className="rounded-2xl mb-4 cursor-pointer"
            />

            <div className="space-y-1 text-black text-sm">
              <p>
                <b>Size:</b> {selectedOrder.size}
              </p>
              <p>
                <b>Model:</b> {selectedOrder.model}
              </p>
              <p>
                <b>Total:</b> Rp {selectedOrder.total.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleApprove(selectedOrder)}
                className="flex-1 bg-green-500 text-white p-2 rounded-xl"
              >
                Approve
              </button>

              <button
                onClick={() => handleReject(selectedOrder)}
                className="flex-1 bg-red-500 text-white p-2 rounded-xl"
              >
                Reject
              </button>

              <button
                onClick={() => handleDelete(selectedOrder)}
                className="flex-1 bg-gray-800 text-white p-2 rounded-xl"
              >
                Delete
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-lg transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-xl shadow-lg animate-slideIn">
          {toast}
        </div>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2 text-black">Hapus Data</h2>

            <p className="text-sm text-gray-600 mb-5">
              Yakin mau hapus <b>{confirmDelete.nama}</b>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 text-black rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setZoomImage(null)}
        >
          <Image
            src={zoomImage}
            alt="zoom"
            width={800}
            height={800}
            className="max-w-[90%] max-h-[90%] object-contain"
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "pending"
      ? "bg-yellow-400"
      : status === "verified"
        ? "bg-green-500"
        : "bg-red-500";

  return (
    <span className={`text-white px-2 py-1 rounded text-xs ${color}`}>
      {status}
    </span>
  );
}
