import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCardProps {
  id: string;
  src: string;
  title: string;
  date: string;
  onDelete: () => void; // passed from parent
}

export function ImageCard({ id, src, title, date, onDelete }: ImageCardProps) {
  const handleDelete = () => {
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (confirmed) {
      onDelete();
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md sm:rounded-xl">
      <div className="aspect-square overflow-hidden">
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="truncate text-xs font-medium text-card-foreground sm:text-sm">
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground sm:text-xs">{date}</p>
      </div>

      <Button
  variant="destructive"
  size="icon"
  className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 sm:right-3 sm:top-3 sm:h-8 sm:w-8"
  onClick={onDelete}
>
  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
</Button>

    </div>
  );
}
