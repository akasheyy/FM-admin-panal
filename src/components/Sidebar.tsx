import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Images, 
  LogOut, 
  X,
  CalendarCheck
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import API from "@/lib/api";

/* ================= NAV ITEMS ================= */

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Images, label: "Gallery", path: "/gallery" },
  { icon: CalendarCheck, label: "Bookings", path: "/bookings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [newBookingCount, setNewBookingCount] = useState(0);

  /* ================= FETCH NEW BOOKINGS ================= */
  const fetchNewBookings = async () => {
    try {
      const res = await API.get("/contact");
      const newOnes = res.data.filter((b: any) => b.isNew);
      setNewBookingCount(newOnes.length);
    } catch {
      // silent fail (sidebar shouldn't break)
    }
  };

  useEffect(() => {
    fetchNewBookings();

    // 🔄 Optional auto refresh every 30s
    const interval = setInterval(fetchNewBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">

          {/* HEADER */}
          <div className="flex h-16 items-center justify-between border-b px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-semibold">Admin Panel</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isBooking = item.path === "/bookings";

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )
                  }
                >
                  {/* ICON + INDICATOR */}
                  <div className="relative">
                    <item.icon className="h-[18px] w-[18px]" />

                    {/* 🔔 NEW BOOKING DOT */}
                    {isBooking && newBookingCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sidebar" />
                    )}
                  </div>

                  {/* LABEL */}
                  <span className="flex-1">{item.label}</span>

                  {/* 🔢 OPTIONAL COUNT BADGE */}
                  {isBooking && newBookingCount > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {newBookingCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* FOOTER */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
