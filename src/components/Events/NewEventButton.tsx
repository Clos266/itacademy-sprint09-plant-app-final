import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModalDialog } from "@/components/modals/ModalDialog";
import { ImageUploader } from "@/components/common/ImageUploader";
import { supabase } from "@/services/supabaseClient";
import { showSuccess, showError } from "@/services/toastService";
import { Plus } from "lucide-react";

type SwapPointOption = {
  id: number;
  name: string;
  city: string;
};

export function NewEventButton() {
  const [open, setOpen] = useState(false);
  const [swapPoints, setSwapPoints] = useState<SwapPointOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    swap_point_id: "",
    image_url: "",
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        swap_point_id: "",
        image_url: "",
      });
    }
  };

  useEffect(() => {
    const loadSwapPoints = async () => {
      try {
        const { data, error } = await supabase
          .from("swap_points")
          .select("id, name, city")
          .order("name", { ascending: true });

        if (error) throw error;
        setSwapPoints(data as SwapPointOption[]);
      } catch (err) {
        console.error("Error loading swap points:", err);
      }
    };

    loadSwapPoints();
  }, []);

  const handleImageUpload = (publicUrl: string) => {
    setForm((prev) => ({ ...prev, image_url: publicUrl }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.date || !form.location) {
      showError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        showError("You must be logged in.");
        return;
      }

      const { error } = await supabase.from("events").insert([
        {
          user_id: user.id,
          title: form.title,
          description: form.description,
          date: form.date,
          location: form.location,
          image_url: form.image_url || null,
          swap_point_id: form.swap_point_id ? Number(form.swap_point_id) : null,
        },
      ]);

      if (error) throw error;

      showSuccess("Event created successfully!");
      setOpen(false);
    } catch (err) {
      console.error("Error creating event:", err);
      showError("Could not create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
      </Button>

      <ModalDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Create New Event"
        description="Add a new community event or plant swap."
        confirmLabel="Create Event"
        onConfirm={handleCreate}
        loading={loading}
        loadingText="Creating..."
        size="lg"
      >
        <ScrollArea className="max-h-[75vh] px-1">
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <Label>Event Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Autumn Plant Swap"
              />
            </div>

            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Barcelona, Spain"
              />
            </div>

            <div>
              <Label>Swap Point (optional)</Label>
              <Select
                value={form.swap_point_id}
                onValueChange={(value) =>
                  setForm({ ...form, swap_point_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a swap point" />
                </SelectTrigger>
                <SelectContent>
                  {swapPoints.length > 0 ? (
                    swapPoints.map((sp) => (
                      <SelectItem key={sp.id} value={String(sp.id)}>
                        {sp.name} — {sp.city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No meeting points available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe your event..."
              />
            </div>

            <div>
              <Label>Event Image</Label>
              <ImageUploader
                bucket="events"
                pathPrefix="user_uploads"
                onUpload={handleImageUpload}
                label="Upload Image"
                currentUrl={form.image_url}
              />
            </div>
          </div>
        </ScrollArea>
      </ModalDialog>
    </>
  );
}
