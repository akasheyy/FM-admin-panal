import { useEffect, useState, useMemo } from "react";
import API from "@/lib/api";
import {
  Trash2,
  MoreHorizontal,
  Phone,
  Calendar,
  Users,
  MessageSquare,
  Inbox,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Clock,
  Check,
  X,
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
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  
  // Sorting State
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

  // Get unique event types for the filter dropdown
  const uniqueEventTypes = useMemo(() => {
    return Array.from(new Set(bookings.map((b) => b.eventType))).filter(Boolean);
  }, [bookings]);

  /* =============================================
     CORE LOGIC: FILTERING, SEARCHING & SORTING
  ============================================= */
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // 1. Filter by Event Type
    if (eventTypeFilter !== "all") {
      result = result.filter((b) => b.eventType === eventTypeFilter);
    }

    // 2. Search by Name or Event Type
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.eventType.toLowerCase().includes(query)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle date parsing for sorting
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
            <p className="text-muted-foreground mt-1">Total Leads: {bookings.length}</p>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm" className="w-fit">
            Refresh Data
          </Button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="New Leads" value={bookings.filter(b => b.isNew).length} icon={<Sparkles className="w-4 h-4" />} color="text-green-600" />
          <StatCard title="Processed" value={processedBookings.length} icon={<Inbox className="w-4 h-4" />} color="text-blue-600" />
          <StatCard title="Upcoming" value={bookings.length} icon={<Calendar className="w-4 h-4" />} color="text-amber-600" />
        </div>

        {/* CONTROLS: SEARCH, FILTER, SORT */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or event..." 
              className="pl-9 border-slate-200 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {/* RESET BUTTON */}
            {(eventTypeFilter !== "all" || searchQuery !== "") && (
              <Button variant="ghost" size="sm" onClick={() => {setSearchQuery(""); setEventTypeFilter("all");}} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}

            {/* FILTER DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={eventTypeFilter !== "all" ? "border-primary text-primary" : ""}>
                  <Filter className="w-4 h-4 mr-2" />
                  {eventTypeFilter === "all" ? "All Categories" : eventTypeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Event Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                  {uniqueEventTypes.map((type) => (
                    <DropdownMenuRadioItem key={type} value={type} className="capitalize">
                      {type}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* SORT DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By Field</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <DropdownMenuRadioItem value="createdAt">Submission Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="date">Event Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">Client Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="guests">Guest Count</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Order</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                  <DropdownMenuRadioItem value="desc">Descending (Z-A)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asc">Ascending (A-Z)</DropdownMenuRadioItem>
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
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Event Info</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Logistics</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider">Message Preview</th>
                  <th className="p-4 font-semibold text-slate-600 uppercase text-[11px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedBookings.map((b) => (
                  <tr key={b._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 capitalize">
                          {b.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{b.name}</span>
                            {b.isNew && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none h-5 px-1.5">New</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {b.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="rounded-md font-medium capitalize border-slate-200 bg-slate-50 text-slate-700">
                        {b.eventType}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5 text-xs">
                        {/* EVENT DATE */}
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-amber-600" />
                          <span>Event: <span className="font-semibold">{new Date(b.date + "T00:00:00").toLocaleDateString("en-IN")}</span></span>
                        </div>
                        
                        {/* SUBMISSION DATE (FIXED) */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Submitted: {new Date(b.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>

                        {/* GUESTS */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{b.guests} Guests</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-[280px]">
                      <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">
                        "{b.message || "No message provided..."}"
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-200">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(`tel:${b.phone}`)}>
                            <Phone className="mr-2 h-4 w-4 text-slate-500" /> Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4 text-slate-500" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 font-medium" onClick={() => setDeleteId(b._id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Inquiry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* EMPTY STATE */}
            {!isLoading && processedBookings.length === 0 && (
              <div className="py-24 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                   <Inbox className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No matching inquiries</h3>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search keywords.</p>
                <Button variant="link" size="sm" onClick={() => {setEventTypeFilter("all"); setSearchQuery("");}} className="mt-2 text-primary">
                  Reset all filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* DELETE MODAL */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove <strong>{bookings.find(b => b._id === deleteId)?.name}</strong>'s request from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                Delete Permanently
              </AlertDialogAction>
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
        <div className={`${color} opacity-80`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}