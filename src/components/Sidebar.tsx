import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Images, 
  LogOut, 
  X,
  CalendarCheck,
  User
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import API from "@/lib/api";

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

  const fetchNewBookings = async () => {
    try {
      const res = await API.get("/contact");
      const newOnes = res.data.filter((b: any) => b.isNew);
      setNewBookingCount(newOnes.length);
    } catch { /* silent fail */ }
  };

  useEffect(() => {
    fetchNewBookings();
    const interval = setInterval(fetchNewBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[270px] border-r bg-background transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          
          {/* BRANDING */}
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <span className="text-sm font-black">A</span>
            </div>
            <span className="text-sm font-bold tracking-tight">STUDIO ADMIN</span>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto lg:hidden" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isBooking = item.path === "/bookings";
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  
                  {isBooking && newBookingCount > 0 && (
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20"></span>
                      <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {newBookingCount}
                      </span>
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* USER & LOGOUT SECTION */}
          <div className="mt-auto border-t p-4">
            <div className="flex items-center gap-3 px-2 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden text-xs">
                <span className="truncate font-semibold text-foreground">Administrator</span>
                <span className="truncate text-muted-foreground">Active Session</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start gap-2 border-dashed text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>

        </div>
      </aside>
    </>
  );
}