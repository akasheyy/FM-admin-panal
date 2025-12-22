import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await API.get("/contact");
      setBookings(res.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
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
      toast({ title: "Booking deleted" });
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
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Bookings</h1>

        {/* TABLE */}
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Event</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Guests</th>
                <th className="p-3 text-left">Place</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b._id}
                  className="border-t hover:bg-muted/30 transition"
                >
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3">{b.phone}</td>
                  <td className="p-3 capitalize">{b.eventType}</td>
                  <td className="p-3">
                    {new Date(b.createdAt).toDateString()}
                  </td>
                  <td className="p-3">{b.guests}</td>
                  <td className="p-3">{b.place || "-"}</td>
                  <td className="p-3 max-w-[260px] truncate">
                    {b.message || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteId(b._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* DELETE CONFIRMATION */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
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
