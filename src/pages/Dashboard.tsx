import { useEffect, useState } from "react";
import { 
  Users, Images, MessageSquare, BookOpen, 
  ArrowUpRight, Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import API from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [data, setData] = useState({
    gallery: 0,
    menu: 0,
    contact: 0,
    testimonials: 0,
    activity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [galleryRes, menuRes, contactRes, testimonialRes] = await Promise.all([
        API.get("/gallery"),
        API.get("/menu"),
        API.get("/contact"),
        API.get("/testimonials"),
      ]);

      const sortedGallery = [...galleryRes.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setData({
        gallery: galleryRes.data.length,
        menu: menuRes.data.length,
        contact: contactRes.data.length,
        testimonials: testimonialRes.data.length,
        activity: sortedGallery.slice(0, 5).map((img) => ({
          action: "New Gallery Upload",
          user: "Admin",
          time: new Date(img.createdAt).toLocaleDateString(),
        }))
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

  const stats = [
    { title: "Gallery", value: data.gallery, icon: Images, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Menu", value: data.menu, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Inquiries", value: data.contact, icon: MessageSquare, color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Reviews", value: data.testimonials, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8">
        
        {/* Simplified Header */}
        <header className="border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Real-time status of your platform assets and activity.
          </p>
        </header>

        {/* High-Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className={`rounded-2xl p-4 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight size={14} className="mr-1" /> ACTIVE
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{data[stat.title.toLowerCase() as keyof typeof data] || stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity Timeline */}
          <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <Clock size={22} className="text-indigo-500" />
                Latest Updates
              </h2>
            </div>
            <div className="p-8">
              {data.activity.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic bg-slate-50 rounded-2xl">
                  Waiting for new activity...
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-100">
                  {data.activity.map((item, index) => (
                    <div key={index} className="relative flex items-start gap-6 group">
                      <div className="z-10 mt-1.5 h-[24px] w-[24px] rounded-full border-4 border-white bg-indigo-600 shadow-md group-hover:scale-110 transition-transform" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="text-base font-bold text-slate-800">{item.action}</p>
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{item.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Verified by system administrator</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Visualization Section */}
          <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Usage Analytics</h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Resource distribution across modules.</p>
              </div>
              
              <div className="space-y-8">
                <AssetProgress label="Gallery Space" current={data.gallery} max={100} color="bg-blue-500" />
                <AssetProgress label="Menu Capacity" current={data.menu} max={50} color="bg-emerald-500" />
                <AssetProgress label="Inquiry Volume" current={data.contact} max={30} color="bg-violet-500" />
              </div>
            </div>

            <div className="mt-12 p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-tighter">System Health: 100%</p>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

const AssetProgress = ({ label, current, max, color }: { label: string, current: number, max: number, color: string }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <span className="text-xs font-black text-white/40">{Math.round((current/max)*100)}%</span>
    </div>
    <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ease-out ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
        style={{ width: `${Math.min((current / max) * 100, 100)}%` }} 
      />
    </div>
  </div>
);

export default Dashboard;