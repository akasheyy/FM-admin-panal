import { useEffect, useState } from "react";
import { Upload, Search, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImageCard } from "@/components/ImageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import API from "@/lib/api";

// shadcn-ui dialog
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

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Delete dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setConfirmDeleteOpen(true);
  };

  // Fetch images
  const fetchImages = async () => {
    try {
      const res = await API.get("/gallery");
      setImages(res.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load images.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload handler
  const handleUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await API.post("/gallery", formData);
      toast({ title: "Image uploaded successfully!" });
      fetchImages();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const deleteImage = async (id: string | null) => {
    if (!id) return;

    try {
      await API.delete(`/gallery/${id}`);
      toast({ title: "Image deleted" });
      setImages((prev: any) => prev.filter((img: any) => img._id !== id));
    } catch {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-2 animate-fade-in">
          <h1 className="text-2xl font-semibold sm:text-3xl">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Manage your image collection
          </p>
        </div>

        {/* --- UPLOAD ZONE ONLY (Button Removed) --- */}
        <input
          id="gallery-upload"
          type="file"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />

        <label
          htmlFor="gallery-upload"
          className="block cursor-pointer rounded-xl border-2 border-dashed border-border bg-card p-6 text-center hover:border-primary/50 hover:bg-muted/30 sm:p-8"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>

          <h3 className="text-lg font-medium">
            {uploading ? "Uploading..." : "Drop images here or tap to upload"}
          </h3>

          <p className="text-sm text-muted-foreground"></p>
        </label>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search images..." className="h-10 pl-10" />
          </div>

          <Button variant="outline" className="h-10 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {images.length === 0 ? (
            <p className="col-span-full py-10 text-center text-muted-foreground">
              No images found. Upload your first image!
            </p>
          ) : (
            images.map((img: any, i: number) => (
              <div
                key={img._id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ImageCard
                  id={img._id}
                  src={img.url}
                  title={img.caption || "Untitled"}
                  date={new Date(img.createdAt).toDateString()}
                  onDelete={() => openDeleteConfirm(img._id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This image will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                deleteImage(selectedId);
                setConfirmDeleteOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Gallery;
