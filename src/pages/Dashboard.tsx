import { useEffect, useState } from "react";
import { Users, Images, Eye, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import API from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [galleryCount, setGalleryCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(0);
  const [latestActivity, setLatestActivity] = useState([]);
  const [userName, setUserName] = useState("Admin");

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [galleryRes, menuRes, contactRes, testimonialRes] = await Promise.all([
        API.get("/gallery"),
        API.get("/menu"),
        API.get("/contact"),
        API.get("/testimonials"),
      ]);

      const gallery = galleryRes.data;
      const sortedGallery = [...gallery].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setGalleryCount(gallery.length);
      setMenuCount(menuRes.data.length);
      setContactCount(contactRes.data.length);
      setTestimonialCount(testimonialRes.data.length);

      // Dynamic recent activity (latest 5 uploads)
      setLatestActivity(
        sortedGallery.slice(0, 5).map((img) => ({
          action: "Image uploaded",
          user: "Admin",
          time: new Date(img.createdAt).toLocaleString(),
        }))
      );
    } catch (err) {
      toast({
        title: "Error loading dashboard",
        description: "Backend connection failed",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // You can decode username from token later
    setUserName("Admin");
  }, []);

  const stats = [
    {
      title: "Gallery Images",
      value: galleryCount,
      change: "+ Real-time",
      changeType: "positive" as const,
      icon: Images,
      iconColor: "bg-success/10 text-success",
    },
    {
      title: "Menu Items",
      value: menuCount,
      change: "+ Updated",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "Contact Messages",
      value: contactCount,
      change: "Inbox",
      changeType: "positive" as const,
      icon: Eye,
      iconColor: "bg-info/10 text-info",
    },
    {
      title: "Testimonials",
      value: testimonialCount,
      change: "Customer reviews",
      changeType: "positive" as const,
      icon: Users,
      iconColor: "bg-warning/10 text-warning",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Welcome back, {userName}! Here is your site activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">

          {/* Recent Activity */}
          <div className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold sm:text-lg">
              Recent Activity
            </h2>

            {latestActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {latestActivity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {item.user}
                      </p>
                    </div>
                    <span className="ml-4 text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Overview */}
          <div className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold sm:text-lg">
              Quick Overview
            </h2>

            <div className="space-y-5">

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Images Uploaded</span>
                  <span className="text-sm font-medium">{galleryCount}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-2 bg-primary"
                    style={{ width: `${Math.min(galleryCount, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Menu Items</span>
                  <span className="text-sm font-medium">{menuCount}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-2 bg-success"
                    style={{ width: `${Math.min(menuCount, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Messages</span>
                  <span className="text-sm font-medium">{contactCount}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-2 bg-info"
                    style={{ width: `${Math.min(contactCount, 100)}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
