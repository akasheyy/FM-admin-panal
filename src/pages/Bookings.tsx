import { useEffect, useState } from "react";
import API from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "@/hooks/use-toast";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/contact");
      setBookings(res.data);
    } catch (err) {
      toast({
        title: "Failed to load bookings",
        description: "Could not fetch booking requests.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Booking Requests</h1>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Event</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Guests</th>
                <th className="p-3 text-left">Place</th>
                <th className="p-3 text-left">Message</th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-muted/30">
                    <td className="p-3">{b.name}</td>
                    <td className="p-3">{b.phone}</td>
                    <td className="p-3 capitalize">{b.eventType}</td>
                    <td className="p-3">{b.date}</td>
                    <td className="p-3">{b.guests}</td>
                    <td className="p-3">{b.place}</td>
                    <td className="p-3">{b.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
