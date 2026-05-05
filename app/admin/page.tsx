"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

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
  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuth) return;

    const fetchOrders = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setOrders(data as Order[]);
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuth]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) =>
        order.nama.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((order) => (filter === "all" ? true : order.status === filter));
  }, [orders, search, filter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      accepted: orders.filter((order) => order.status === "verified").length,
      rejected: orders.filter((order) => order.status === "rejected").length,
    }),
    [orders],
  );

  const rupiah = (value: number) => "Rp. " + value.toLocaleString("id-ID");

  const finishAction = (message: string, orderId: string) => {
    setSuccessModal(message);
    setSelectedOrder(null);
    setConfirmDelete(null);

    setTimeout(() => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setRemovingId(null);
    }, 300);
  };

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

    finishAction("Data berhasil di-approve", order.id);
  };

  const handleReject = async (order: Order) => {
    setRemovingId(order.id);

    await supabase
      .from("orders")
      .update({ status: "rejected" })
      .eq("id", order.id);

    await supabase
      .from("users")
      .update({ status: "available" })
      .eq("id", order.user_id);

    finishAction("Data berhasil di-reject", order.id);
  };

  const handleDelete = async (order: Order) => {
    setRemovingId(order.id);

    await supabase.from("orders").delete().eq("id", order.id);

    await supabase
      .from("users")
      .update({ status: "available" })
      .eq("id", order.user_id);

    finishAction("Data berhasil dihapus", order.id);
  };

  if (!isAuth) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fb] px-5 py-8 text-slate-900">
        <style>{`
          @keyframes pageIn {
            from { opacity: 0; transform: translateY(18px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes glowLine {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,.14),transparent_34%),linear-gradient(315deg,rgba(16,185,129,.14),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.92),transparent_32%)]" />
        <div className="absolute left-0 top-0 h-full w-full opacity-[.22] [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] border border-white/80 bg-white/95 p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,.18)] backdrop-blur-2xl [animation:pageIn_.55s_ease_both]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 bg-[length:220%_220%] [animation:glowLine_4s_ease_infinite]" />

          <p className="text-sm font-semibold text-cyan-700">Admin Panel</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Order Login
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Masukkan password untuk melihat data pembayaran.
          </p>

          <input
            type="password"
            value={inputPass}
            onChange={(e) => setInputPass(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputPass === "nopalgantenk123") {
                setIsAuth(true);
              }
            }}
            placeholder="Password admin"
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />

          <button
            type="button"
            onClick={() => {
              if (inputPass === "nopalgantenk123") setIsAuth(true);
              else alert("Password salah!");
            }}
            className="mt-4 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,.22)] transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Masuk
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-6 text-slate-700">
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-6 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm font-semibold">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-5 py-8 text-slate-900">
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(18px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes rowIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes glowLine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,.14),transparent_34%),linear-gradient(315deg,rgba(16,185,129,.14),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.92),transparent_32%)]" />
      <div className="absolute left-0 top-0 h-full w-full opacity-[.22] [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative z-10 mx-auto w-full max-w-6xl [animation:pageIn_.55s_ease_both]">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admin Panel
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
            Order Verification
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Kelola bukti pembayaran, approve order, reject, atau hapus data.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total", stats.total, "text-slate-900"],
            ["Pending", stats.pending, "text-amber-600"],
            ["Accepted", stats.accepted, "text-emerald-600"],
            ["Rejected", stats.rejected, "text-rose-600"],
          ].map(([label, value, color], index) => (
            <div
              key={label}
              className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg [animation:rowIn_.45s_ease_both]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
                {label}
              </p>
              <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="sticky top-4 z-20 mb-6 overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_50px_rgba(15,23,42,.12)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 bg-[length:220%_220%] [animation:glowLine_4s_ease_infinite]" />

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />

            <select
              value={filter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilter(e.target.value as FilterType)
              }
              className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <div className="rounded-3xl border border-white/80 bg-white/85 p-10 text-center shadow-sm backdrop-blur">
              <p className="font-semibold text-slate-800">
                Data tidak ditemukan
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah pencarian atau filter status.
              </p>
            </div>
          )}

          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`group cursor-pointer rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur transition duration-300 [animation:rowIn_.45s_ease_both] ${
                removingId === order.id
                  ? "scale-95 opacity-0"
                  : "hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,.14)]"
              }`}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:w-44">
                  <Image
                    src={order.bukti_url}
                    alt="bukti pembayaran"
                    fill
                    sizes="(max-width: 640px) 100vw, 176px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-950">
                        {order.nama}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {order.size} - {order.model}
                      </p>
                    </div>

                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <InfoTile label="Total" value={rupiah(order.total)} />
                    <InfoTile
                      label="Tanggal"
                      value={new Date(order.created_at).toLocaleDateString(
                        "id-ID",
                      )}
                    />
                    <InfoTile
                      label="Status"
                      value={
                        order.status === "verified"
                          ? "accepted"
                          : order.status
                      }
                    />
                  </div>

                  {order.status === "pending" && (
                    <div
                      className="mt-4 flex flex-wrap gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleApprove(order)}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(order)}
                        className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-md"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDelete(order)}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {successModal && (
        <ModalBackdrop onClose={() => setSuccessModal(null)}>
          <div
            className="w-full max-w-sm rounded-[26px] border border-white/80 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,.28)] [animation:modalIn_.22s_ease_both]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-700">
              OK
            </div>
            <h2 className="text-xl font-bold text-slate-950">Berhasil</h2>
            <p className="mt-2 text-sm text-slate-600">{successModal}</p>
            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className="mt-6 w-full rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Tutup
            </button>
          </div>
        </ModalBackdrop>
      )}

      {selectedOrder && (
        <ModalBackdrop onClose={() => setSelectedOrder(null)}>
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.28)] [animation:modalIn_.22s_ease_both]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-rose-100 hover:text-rose-600"
            >
              x
            </button>

            <div className="pr-10">
              <h2 className="text-xl font-bold text-slate-950">
                {selectedOrder.nama}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedOrder.size} - {selectedOrder.model}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              <Image
                src={selectedOrder.bukti_url}
                alt="bukti pembayaran"
                width={700}
                height={700}
                onClick={() => setZoomImage(selectedOrder.bukti_url)}
                className="w-full cursor-zoom-in object-contain"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoTile label="Total" value={rupiah(selectedOrder.total)} />
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApprove(selectedOrder)}
                className="rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => handleReject(selectedOrder)}
                className="rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedOrder)}
                className="rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Delete
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {confirmDelete && (
        <ModalBackdrop onClose={() => setConfirmDelete(null)}>
          <div
            className="w-full max-w-sm rounded-[26px] border border-white/80 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,.28)] [animation:modalIn_.22s_ease_both]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-950">Hapus Data</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Yakin mau hapus <b>{confirmDelete.nama}</b>?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {zoomImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-sm"
          onClick={() => setZoomImage(null)}
        >
          <Image
            src={zoomImage}
            alt="zoom bukti pembayaran"
            width={900}
            height={900}
            className="max-h-[92vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold capitalize text-slate-950">
        {value}
      </p>
    </div>
  );
}

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus | string }) {
  const styles =
    status === "pending"
      ? "bg-amber-100 text-amber-700 ring-amber-200"
      : status === "verified"
        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
        : "bg-rose-100 text-rose-700 ring-rose-200";

  const label = status === "verified" ? "accepted" : status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${styles}`}
    >
      {label}
    </span>
  );
}
