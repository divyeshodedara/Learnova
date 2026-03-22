import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  Eye,
  EyeOff,
  BookOpen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCourses,
  createCourse,
  updateCourse,
  togglePublish,
  deleteCourse,
} from "../../api/courses";
import { getTags, createTag } from "../../api/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* ─── helpers ─── */
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

/* ─── main component ─── */
export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* modal state */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  /* publish-url prompt */
  const [urlPrompt, setUrlPrompt] = useState(null); // courseId
  const [urlValue, setUrlValue] = useState("");

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* tags */
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  /* ─── fetch ─── */
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter === "PUBLISHED") params.isPublished = true;
      if (statusFilter === "DRAFT") params.isPublished = false;
      const res = await getCourses(params);
      setCourses(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    getTags()
      .then((r) => setAllTags(r.data.data || r.data || []))
      .catch(() => {});
  }, []);

  /* ─── open create / edit ─── */
  const openCreate = () => {
    setEditing(null);
    setForm({ ...empty });
    setDialogOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      title: c.title || "",
      description: c.description || "",
      shortDesc: c.shortDesc || "",
      visibility: c.visibility || "EVERYONE",
      accessRule: c.accessRule || "OPEN",
      price: c.price ?? "",
      websiteUrl: c.websiteUrl || "",
      tags: c.tags?.map((t) => (typeof t === "object" ? t.id : t)) || [],
    });
    setDialogOpen(true);
  };

  /* ─── save ─── */
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        shortDesc: form.shortDesc,
        visibility: form.visibility,
        accessRule: form.accessRule,
        tags: form.tags,
      };
      if (form.accessRule === "ON_PAYMENT" && form.price) {
        payload.price = Number(form.price);
      }
      if (form.websiteUrl) payload.websiteUrl = form.websiteUrl;

      if (editing) {
        await updateCourse(editing.id, payload);
        toast.success("Course updated");
      } else {
        await createCourse(payload);
        toast.success("Course created");
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ─── publish toggle ─── */
  const handlePublishToggle = async (course) => {
    const willPublish = !course.isPublished;
    if (willPublish && !course.websiteUrl) {
      setUrlPrompt(course.id);
      setUrlValue("");
      return;
    }
    try {
      await togglePublish(course.id, {
        isPublished: willPublish,
        websiteUrl: course.websiteUrl || "",
      });
      toast.success(willPublish ? "Published" : "Unpublished");
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const submitPublishUrl = async () => {
    if (!urlValue.trim()) {
      toast.error("Website URL is required to publish");
      return;
    }
    try {
      await togglePublish(urlPrompt, {
        isPublished: true,
        websiteUrl: urlValue,
      });
      toast.success("Published");
      setUrlPrompt(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  /* ─── delete ─── */
  const handleDelete = async () => {
    try {
      await deleteCourse(deleteTarget.id);
      toast.success("Course deleted");
      setDeleteTarget(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ─── tag helpers ─── */
  const toggleTag = (id) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(id)
        ? f.tags.filter((t) => t !== id)
        : [...f.tags, id],
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

  /* ─── render ─── */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground text-sm">
            Manage your platform courses
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Create Course
        </Button>
      </div>

      <Separator />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Access Rule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No courses found</p>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/courses/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {c.visibility?.toLowerCase().replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {c.accessRule?.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isPublished ? "default" : "outline"}>
                      {c.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.createdBy?.firstName} {c.createdBy?.lastName}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePublishToggle(c)}
                        >
                          {c.isPublished ? (
                            <>
                              <EyeOff className="mr-2 h-3.5 w-3.5" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-3.5 w-3.5" /> Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Create / Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Course" : "Create Course"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the course details below."
                : "Fill in the details to create a new course."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Full description"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shortDesc">Short Description</Label>
              <Input
                id="shortDesc"
                value={form.shortDesc}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shortDesc: e.target.value }))
                }
                placeholder="Brief summary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, visibility: v }))
                  }
                >
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
                <Select
                  value={form.accessRule}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, accessRule: v }))
                  }
                >
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                }
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Required to publish the course
              </p>
            </div>

            {/* tags */}
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
                    {form.tags.includes(t.id) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
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
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Publish URL Prompt ─── */}
      <Dialog open={!!urlPrompt} onOpenChange={() => setUrlPrompt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Website URL Required</DialogTitle>
            <DialogDescription>
              Enter a website URL before publishing this course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="pub-url">Website URL</Label>
            <Input
              id="pub-url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUrlPrompt(null)}>
              Cancel
            </Button>
            <Button onClick={submitPublishUrl}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ─── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
