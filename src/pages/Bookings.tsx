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
  Inbox,
  Sparkles,
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

  /* ===============================
     MARK ALL NEW BOOKINGS AS SEEN
  =============================== */
  const markAllAsSeen = async (list: any[]) => {
    const newOnes = list.filter((b) => b.isNew);
    if (newOnes.length === 0) return;

    try {
      await Promise.all(
        newOnes.map((b) =>
          API.patch(`/contact/${b._id}/seen`)
        )
      );
    } catch (err) {
      console.error("❌ Failed to mark bookings as seen", err);
    }
  };

  /* ===============================
     FETCH BOOKINGS
  =============================== */
  const fetchBookings = async () => {
    try {
      setIsLoading(true);

      const res = await API.get("/contact");
      setBookings(res.data);

      // ✅ THIS FIXES THE "ALWAYS NEW" PROBLEM
      await markAllAsSeen(res.data);

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

  /* ===============================
     DELETE BOOKING
  =============================== */
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

  const newCount = bookings.filter((b) => b.isNew).length;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bookings
            </h1>
            <p className="text-muted-foreground mt-1">
              You have {bookings.length} total inquiries
              {newCount > 0 && (
                <span className="ml-2 text-green-600 font-semibold">
                  • {newCount} new
                </span>
              )}
            </p>
          </div>

          <Button onClick={fetchBookings} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="h-12 px-4">Client</th>
                  <th className="h-12 px-4">Event Type</th>
                  <th className="h-12 px-4">Logistics</th>
                  <th className="h-12 px-4">Location</th>
                  <th className="h-12 px-4">Message</th>
                  <th className="h-12 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr key={b._id} className="group hover:bg-muted/30">

                    {/* CLIENT */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{b.name}</span>

                          {b.isNew && (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <Sparkles className="h-3 w-3" />
                              New
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {b.phone}
                        </div>
                      </div>
                    </td>

                    {/* EVENT */}
                    <td className="p-4">
                      <Badge variant="secondary" className="capitalize">
                        {b.eventType}
                      </Badge>
                    </td>

                    {/* LOGISTICS */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {b.guests} Guests
                        </div>
                      </div>
                    </td>

                    {/* LOCATION */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {b.place || "—"}
                      </div>
                    </td>

                    {/* MESSAGE */}
                    <td className="p-4 max-w-[220px]">
                      <div className="flex gap-2">
                        <MessageSquare className="h-4 w-4 mt-1" />
                        <p className="truncate italic text-muted-foreground group-hover:whitespace-normal">
                          {b.message || "—"}
                        </p>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(`tel:${b.phone}`)}>
                            <Phone className="mr-2 h-4 w-4" /> Call
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(b._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading && bookings.length === 0 && (
              <div className="py-24 text-center">
                <Inbox className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold">No bookings found</h3>
                <p className="text-muted-foreground">
                  New inquiries will appear here.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="p-8 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= DELETE CONFIRM ================= */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete booking?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the inquiry from{" "}
                <strong>
                  {bookings.find((b) => b._id === deleteId)?.name}
                </strong>.
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
