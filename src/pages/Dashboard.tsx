import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Images,
  MessageSquare,
  BookOpen,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import API from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    gallery: 0,
    menu: 0,
    contact: [],
    testimonials: 0,
    activity: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [galleryRes, menuRes, contactRes, testimonialRes] =
        await Promise.all([
          API.get("/gallery"),
          API.get("/menu"),
          API.get("/contact"),
          API.get("/testimonials"),
        ]);

      const sortedGallery = [...galleryRes.data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setData({
        gallery: galleryRes.data.length,
        menu: menuRes.data.length,
        contact: contactRes.data,
        testimonials: testimonialRes.data.length,
        activity: sortedGallery.slice(0, 5).map((img) => ({
          action: "New Gallery Upload",
          user: "Admin",
          time: new Date(img.createdAt).toLocaleDateString(),
        })),
      });
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Failed to sync with the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const newBookings = data.contact.filter((c: any) => c.isNew);

  const stats = [
    {
      title: "Gallery",
      value: data.gallery,
      icon: Images,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Menu",
      value: data.menu,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Inquiries",
      value: data.contact.length,
      icon: MessageSquare,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Reviews",
      value: data.testimonials,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8">
        {/* HEADER */}
        <header className="border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Real-time status of your platform assets and activity.
          </p>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-2xl p-4 ${stat.bg} ${stat.color}`}
                >
                  <stat.icon size={28} />
                </div>
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={14} className="mr-1" /> ACTIVE
                </span>
              </div>
              <div className="mt-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {stat.title}
                </p>
                <p className="text-4xl font-black text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ACTIVITY */}
          <section className="lg:col-span-2 rounded-3xl border bg-white shadow-sm">
            <div className="px-8 py-6 border-b flex items-center gap-3">
              <Clock size={22} className="text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-800">
                Latest Updates
              </h2>
            </div>
            <div className="p-8">
              {data.activity.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl">
                  Waiting for new activity...
                </div>
              ) : (
                data.activity.map((item, index) => (
                  <div key={index} className="mb-6">
                    <p className="font-semibold">{item.action}</p>
                    <p className="text-xs text-slate-400">{item.time}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 🔔 NEW BOOKING REQUESTS (CLICKABLE) */}
          <section
            onClick={() =>
              newBookings.length > 0 && navigate("/Bookings")
            }
            className={`rounded-3xl bg-slate-900 p-8 text-white shadow-2xl flex flex-col justify-between transition ${
              newBookings.length > 0
                ? "cursor-pointer hover:bg-slate-800"
                : "cursor-default"
            }`}
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">
                  New Booking Requests
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">
                  Recent inquiries requiring attention.
                </p>
              </div>

              {newBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl">
                  No new booking requests
                </div>
              ) : (
                newBookings.slice(0, 5).map((booking: any) => (
                  <div
                    key={booking._id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">{booking.name}</span>
                      <span className="text-xs bg-indigo-500/20 px-2 py-1 rounded-full">
                        {booking.eventType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {booking.phone} • {booking.guests} guests
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs font-bold text-indigo-300 uppercase">
                Total New: {newBookings.length}
              </p>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
