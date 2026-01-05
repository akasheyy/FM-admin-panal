import { useEffect, useState, useMemo } from "react";
import API from "@/lib/api";
import {
  Trash2,
  MoreHorizontal,
  Phone,
  Calendar,
  Users,
  Inbox,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  X,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortKey = "createdAt" | "date" | "name" | "guests";

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/contact");
      setBookings(res.data);
      
      const newOnes = res.data.filter((b: any) => b.isNew);
      if (newOnes.length > 0) {
        await Promise.all(newOnes.map((b: any) => API.patch(`/contact/${b._id}/seen`)));
      }
    } catch {
      toast({ title: "Error", description: "Failed to load bookings", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/contact/${deleteId}`);
      setBookings((prev) => prev.filter((b) => b._id !== deleteId));
      toast({ title: "Booking deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const filterOptions = useMemo(() => {
    const fromDB = new Set(bookings.map((b) => b.eventType?.toLowerCase()));
    const defaults = ["decoration", "catering", "wedding", "birthday", "other"];
    const merged = Array.from(new Set([...defaults, ...fromDB])).filter(Boolean);
    
    const sorted = merged.sort();
    const withoutOther = sorted.filter(item => item !== 'other');
    return sorted.includes('other') ? [...withoutOther, 'other'] : sorted;
  }, [bookings]);

  const processedBookings = useMemo(() => {
    let result = [...bookings];

    if (eventTypeFilter !== "all") {
      result = result.filter((b) => b.eventType?.toLowerCase() === eventTypeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.email?.toLowerCase().includes(query) ||
          b.place?.toLowerCase().includes(query) ||
          b.eventType?.toLowerCase().includes(query) ||
          b.phone.includes(query)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === "createdAt" || sortKey === "date") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, searchQuery, eventTypeFilter, sortKey, sortOrder]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inquiries</h1>
            <p className="text-muted-foreground mt-1">Review and manage client event requests.</p>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            Refresh List
          </Button>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Leads" value={bookings.length} icon={<Inbox className="w-4 h-4" />} color="text-blue-600" />
          <StatCard title="New Leads" value={bookings.filter(b => b.isNew).length} icon={<Sparkles className="w-4 h-4" />} color="text-green-600" />
          <StatCard title="Filtered" value={processedBookings.length} icon={<Filter className="w-4 h-4" />} color="text-slate-600" />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or place..." 
              className="pl-9 border-slate-200 h-10 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            {(eventTypeFilter !== "all" || searchQuery !== "") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {setSearchQuery(""); setEventTypeFilter("all");}} 
                className="text-xs text-muted-foreground hover:text-red-500"
              >
                <X className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 text-slate-600 capitalize">
                  <Filter className="w-4 h-4 mr-2" />
                  {eventTypeFilter === "all" ? "All Services" : eventTypeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Service Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <DropdownMenuRadioItem value="all">All Services</DropdownMenuRadioItem>
                  {filterOptions.map((type) => (
                    <DropdownMenuRadioItem key={type} value={type} className="capitalize">
                      {type}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 text-slate-600">
                  <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <DropdownMenuRadioItem value="createdAt">Date Received</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="date">Event Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">Client Name</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                  <DropdownMenuRadioItem value="desc">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asc">Oldest First</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Client Details</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Service</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Logistics & Location</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Message</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedBookings.map((b) => (
                  <tr key={b._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 capitalize shrink-0">
                          {b.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 leading-none">{b.name}</span>
                            {b.isNew && <Badge className="bg-green-100 text-green-700 border-none h-4 px-1 text-[10px]">New</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{b.phone}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="h-2.5 w-2.5" /> {b.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize border-slate-200 bg-slate-50 text-slate-700">
                        {b.eventType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5 text-xs">
                        {/* PLACE / LOCATION */}
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                          <span className="capitalize">{b.place || "Not Specified"}</span>
                        </div>
                        {/* EVENT DATE */}
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-amber-600" />
                          <span>Event: <strong>{new Date(b.date + "T00:00:00").toLocaleDateString("en-IN")}</strong></span>
                        </div>
                        {/* SUBMISSION DATE */}
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Sent: {new Date(b.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-[240px]">
                      <p className="text-xs text-slate-500 line-clamp-2 italic">
                        "{b.message || "No message provided."}"
                      </p>
                      {b.guests > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                           <Users className="h-3 w-3" /> {b.guests} Guests
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(`tel:${b.phone}`)}>
                            <Phone className="mr-2 h-4 w-4 text-slate-500" /> Call Client
                          </DropdownMenuItem>
                          {b.email && (
                            <DropdownMenuItem onClick={() => window.open(`mailto:${b.email}`)}>
                              <Mail className="mr-2 h-4 w-4 text-slate-500" /> Email Client
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => setDeleteId(b._id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the record for <strong>{bookings.find(b => b._id === deleteId)?.name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}