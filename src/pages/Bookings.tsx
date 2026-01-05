import { useEffect, useState, useMemo } from "react";
import API from "@/lib/api";
import {
  Trash2,
  MoreHorizontal,
  Phone,
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  Inbox,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
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

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Logic: Fetch and Mark Seen
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

  // Filtered List
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.eventType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
            <p className="text-muted-foreground">Manage your event leads and client communications.</p>
          </div>
          <div className="flex items-center gap-2">
             <Button onClick={fetchBookings} variant="outline" size="sm" className="hidden sm:flex">
               Refresh
             </Button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Leads" value={bookings.length} icon={<Inbox className="w-4 h-4" />} color="text-blue-600" />
          <StatCard title="New Inquiries" value={bookings.filter(b => b.isNew).length} icon={<Sparkles className="w-4 h-4" />} color="text-green-600" />
          <StatCard title="Upcoming Events" value={bookings.length} icon={<Calendar className="w-4 h-4" />} color="text-amber-600" />
        </div>

        {/* TABLE CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or event..." 
              className="pl-9 bg-muted/50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
            </Button>
          </div>
        </div>

        {/* MODERN TABLE */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="p-4 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Client Details</th>
                  <th className="p-4 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Event Info</th>
                  <th className="p-4 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Logistics</th>
                  <th className="p-4 font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Message Preview</th>
                  <th className="p-4 font-medium text-muted-foreground uppercase text-[10px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="group hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {b.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{b.name}</span>
                            {b.isNew && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none h-5 px-1.5">New</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {b.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="rounded-md font-medium capitalize border-primary/20 bg-primary/5 text-primary">
                        {b.eventType}
                      </Badge>
                    </td>
                    <td className="p-4">
  <div className="space-y-1.5 text-xs">

    {/* EVENT DATE */}
    <div className="flex items-center gap-2 font-medium">
      <Calendar className="h-3.5 w-3.5 text-amber-600" />
      <span>
        Event: <span className="font-semibold">{new Date(b.date + "T00:00:00").toLocaleDateString("en-IN")}
</span>
      </span>
    </div>

    {/* SUBMISSION DATE */}
    <div className="flex items-center gap-2 text-muted-foreground">
      <Calendar className="h-3.5 w-3.5" />
      Submitted:{" "}
      {new Date(b.createdAt).toLocaleDateString("en-IN")}
    </div>

    {/* GUESTS */}
    <div className="flex items-center gap-2">
      <Users className="h-3.5 w-3.5" />
      {b.guests} Guests
    </div>

  </div>
</td>

                    <td className="p-4 max-w-[250px]">
                      <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                        "{b.message || "No message provided..."}"
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.open(`tel:${b.phone}`)}>
                            <Phone className="mr-2 h-4 w-4" /> Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => setDeleteId(b._id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Inquiry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Empty State */}
            {!isLoading && filteredBookings.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                   <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold">No results found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* ALERT DIALOG (Remains similar but styled) */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete <strong>{bookings.find(b => b._id === deleteId)?.name}'s</strong> inquiry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

// Helper Sub-component
function StatCard({ title, value, icon, color }: any) {
  return (
    <Card className="shadow-sm border-none bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}