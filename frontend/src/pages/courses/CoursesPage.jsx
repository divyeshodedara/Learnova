import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, Plus, MoreHorizontal, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { getCourses, createCourse, updateCourse, togglePublish, deleteCourse } from "../../api/courses";
import { getTags, createTag } from "../../api/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const emptyForm = {
  title: "",
  description: "",
  shortDesc: "",
  visibility: "EVERYONE",
  accessRule: "OPEN",
  price: "",
  websiteUrl: "",
  tags: [],
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [publishPrompt, setPublishPrompt] = useState(null);
  const [publishUrl, setPublishUrl] = useState("");

  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter === "PUBLISHED") params.isPublished = true;
      if (statusFilter === "DRAFT") params.isPublished = false;
      const res = await getCourses(params);
      setCourses(res.data.data || res.data.courses || res.data || []);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    getTags().then((res) => setTags(res.data.data || res.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      shortDesc: course.shortDesc || "",
      visibility: course.visibility || "EVERYONE",
      accessRule: course.accessRule || "OPEN",
      price: course.price?.toString() || "",
      websiteUrl: course.websiteUrl || "",
      tags: course.tags?.map((t) => (typeof t === "string" ? t : t.id || t.name)) || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        shortDesc: form.shortDesc,
        visibility: form.visibility,
        accessRule: form.accessRule,
        tags: form.tags,
      };
      if (form.accessRule === "ON_PAYMENT" && form.price) payload.price = Number(form.price);
      if (form.websiteUrl) payload.websiteUrl = form.websiteUrl;
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        toast.success("Course updated");
      } else {
        await createCourse(payload);
        toast.success("Course created");
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (course) => {
    const publishing = !course.isPublished;
    if (publishing && !course.websiteUrl) {
      setPublishPrompt(course);
      setPublishUrl("");
      return;
    }
    try {
      await togglePublish(course.id, { isPublished: publishing, websiteUrl: course.websiteUrl || "" });
      toast.success(publishing ? "Course published" : "Course unpublished");
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle publish");
    }
  };

  const handlePublishWithUrl = async () => {
    if (!publishUrl.trim()) { toast.error("Website URL is required to publish"); return; }
    try {
      await togglePublish(publishPrompt.id, { isPublished: true, websiteUrl: publishUrl });
      toast.success("Course published");
      setPublishPrompt(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(deleteTarget.id);
      toast.success("Course deleted");
      setDeleteTarget(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const res = await createTag({ name: newTag.trim() });
      const created = res.data.data || res.data;
      setTags((prev) => [...prev, created]);
      setForm((prev) => ({ ...prev, tags: [...prev.tags, created.id || created.name] }));
      setNewTag("");
      toast.success("Tag created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter((t) => t !== tagId) : [...prev.tags, tagId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Create and manage your courses</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Create Course
        </Button>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Access Rule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.visibility === "EVERYONE" ? "Everyone" : "Signed In"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {course.accessRule === "OPEN" ? "Open" : course.accessRule === "ON_INVITATION" ? "Invitation" : "Payment"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? "default" : "outline"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.createdBy?.firstName ? `${course.createdBy.firstName} ${course.createdBy.lastName || ""}`.trim() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(course)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleTogglePublish(course)}
                        title={course.isPublished ? "Unpublish" : "Publish"}
                      >
                        {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(course)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update course details below." : "Fill in the details to create a new course."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Course title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Short Description</label>
              <Input
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                placeholder="Brief summary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={form.visibility} onValueChange={(v) => setForm({ ...form, visibility: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVERYONE">Everyone</SelectItem>
                    <SelectItem value="SIGNED_IN">Signed In Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Access Rule</label>
                <Select value={form.accessRule} onValueChange={(v) => setForm({ ...form, accessRule: v })}>
                  <SelectTrigger className="w-full">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id || tag.name}
                    variant={form.tags.includes(tag.id || tag.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id || tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag"
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingCourse ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish URL Prompt */}
      <Dialog open={!!publishPrompt} onOpenChange={(o) => !o && setPublishPrompt(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Website URL Required</DialogTitle>
            <DialogDescription>
              A website URL is required to publish this course. Enter one below.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={publishUrl}
            onChange={(e) => setPublishUrl(e.target.value)}
            placeholder="https://..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishPrompt(null)}>Cancel</Button>
            <Button onClick={handlePublishWithUrl}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
