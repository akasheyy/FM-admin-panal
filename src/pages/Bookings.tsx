import { useEffect, useState } from "react";
import API from "@/lib/api";
import { 
  Trash2, 
  MoreHorizontal, 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
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

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/contact");
      setBookings(res.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Delete booking
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await API.delete(`/contact/${deleteId}`);
      setBookings((prev) => prev.filter((b) => b._id !== deleteId));
      toast({ title: "Booking deleted successfully" });
    } catch {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bookings</h1>
            <p className="text-muted-foreground mt-1">
              You have {bookings.length} total event inquiries.
            </p>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b transition-colors">
                  <th className="h-12 px-4 font-medium text-muted-foreground">Client</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground">Event Type</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground">Logistics</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground">Location</th>
                  <th className="h-12 px-4 font-medium text-muted-foreground">Message</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {/* CLIENT INFO */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{b.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {b.phone}
                        </div>
                      </div>
                    </td>

                    {/* EVENT TYPE */}
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize font-medium bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
                        {b.eventType}
                      </Badge>
                    </td>

                    {/* LOGISTICS (DATE & GUESTS) */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-foreground/80">
                            {new Date(b.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>{b.guests} Guests</span>
                        </div>
                      </div>
                    </td>

                    {/* PLACE */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className={!b.place ? "italic text-muted-foreground text-xs" : ""}>
                          {b.place || "No location set"}
                        </span>
                      </div>
                    </td>

                    {/* MESSAGE */}
                    <td className="p-4">
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <MessageSquare className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                        <p className="truncate text-muted-foreground italic group-hover:whitespace-normal group-hover:line-clamp-3 transition-all">
                          {b.message || "—"}
                        </p>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage Inquiry</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(`tel:${b.phone}`)}>
                            <Phone className="mr-2 h-4 w-4" /> Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => setDeleteId(b._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {!isLoading && bookings.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="bg-muted rounded-full p-4 mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No bookings found</h3>
                <p className="text-muted-foreground max-w-sm">
                  New inquiries from your website contact form will automatically appear here.
                </p>
              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
               <div className="p-8 space-y-4">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="h-16 w-full bg-muted/40 animate-pulse rounded-lg" />
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* DELETE CONFIRMATION */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the booking inquiry from{" "}
                <span className="font-semibold text-foreground">
                  {bookings.find((b) => b._id === deleteId)?.name}
                </span>. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}