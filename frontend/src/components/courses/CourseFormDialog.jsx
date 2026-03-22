import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { getTags, createTag } from "../../api/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const empty = {
  title: "",
  description: "",
  shortDesc: "",
  visibility: "EVERYONE",
  accessRule: "OPEN",
  price: "",
  websiteUrl: "",
  tags: [],
};

export default function CourseFormDialog({ open, onOpenChange, editing, onSave, saving }) {
  const [form, setForm] = useState({ ...empty });
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    getTags()
      .then((r) => setAllTags(r.data.data || r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        description: editing.description || "",
        shortDesc: editing.shortDesc || "",
        visibility: editing.visibility || "EVERYONE",
        accessRule: editing.accessRule || "OPEN",
        price: editing.price ?? "",
        websiteUrl: editing.websiteUrl || "",
        tags: editing.tags?.map((t) => (typeof t === "object" ? t.id : t)) || [],
      });
    } else {
      setForm({ ...empty });
    }
  }, [editing, open]);

  const toggleTag = (id) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter((t) => t !== id) : [...f.tags, id],
    }));
  };

  const handleNewTag = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await createTag(newTag.trim());
      const tag = res.data.data || res.data;
      setAllTags((t) => [...t, tag]);
      setForm((f) => ({ ...f, tags: [...f.tags, tag.id] }));
      setNewTag("");
      toast.success("Tag created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSave(form, editing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Course" : "Create Course"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the course details below." : "Fill in the details to create a new course."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Course title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Full description"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortDesc">Short Description</Label>
            <Input
              id="shortDesc"
              value={form.shortDesc}
              onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
              placeholder="Brief summary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select value={form.visibility} onValueChange={(v) => setForm((f) => ({ ...f, visibility: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVERYONE">Everyone</SelectItem>
                  <SelectItem value="SIGNED_IN">Signed In</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Access Rule</Label>
              <Select value={form.accessRule} onValueChange={(v) => setForm((f) => ({ ...f, accessRule: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="ON_INVITATION">On Invitation</SelectItem>
                  <SelectItem value="ON_PAYMENT">On Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.accessRule === "ON_PAYMENT" && (
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              value={form.websiteUrl}
              onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">Required to publish the course</p>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allTags.map((t) => (
                <Badge
                  key={t.id}
                  variant={form.tags.includes(t.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(t.id)}
                >
                  {t.name}
                  {form.tags.includes(t.id) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleNewTag())}
              />
              <Button variant="outline" size="sm" onClick={handleNewTag}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
