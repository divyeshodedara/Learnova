import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Link as LinkIcon,
  File,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment } from "../../api/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const typeIcon = {
  VIDEO: <Video className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
  IMAGE: <ImageIcon className="h-4 w-4" />,
  QUIZ: <HelpCircle className="h-4 w-4" />,
};

export default function LessonsTab({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "", type: "VIDEO", order: 1, description: "", videoUrl: "",
    duration: "", allowDownload: false, file: null, responsibleName: "",
  });
  const [lessonSaving, setLessonSaving] = useState(false);

  const [attachDialog, setAttachDialog] = useState(null);
  const [attachForm, setAttachForm] = useState({ type: "FILE", label: "", linkUrl: "", file: null });

  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, label: "" });

  const fetchLessons = useCallback(async () => {
    try {
      const res = await getLessons(courseId);
      setLessons(res.data.data || res.data || []);
    } catch {}
  }, [courseId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const openAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: "", type: "VIDEO", order: lessons.length + 1, description: "",
      videoUrl: "", duration: "", allowDownload: false, file: null, responsibleName: "",
    });
    setLessonDialog(true);
  };

  const openEditLesson = (l) => {
    setEditingLesson(l);
    setLessonForm({
      title: l.title || "", type: l.type || "VIDEO", order: l.order || 1,
      description: l.description || "", videoUrl: l.videoUrl || "",
      duration: l.duration || "", allowDownload: !!l.allowDownload,
      file: null, responsibleName: l.responsibleName || "",
    });
    setLessonDialog(true);
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim()) { toast.error("Title is required"); return; }
    setLessonSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", lessonForm.title);
      fd.append("type", lessonForm.type);
      fd.append("order", lessonForm.order);
      if (lessonForm.description) fd.append("description", lessonForm.description);
      if (lessonForm.videoUrl) fd.append("videoUrl", lessonForm.videoUrl);
      if (lessonForm.duration) fd.append("duration", lessonForm.duration);
      fd.append("allowDownload", lessonForm.allowDownload);
      if (lessonForm.responsibleName) fd.append("responsibleName", lessonForm.responsibleName);
      if (lessonForm.file) fd.append("file", lessonForm.file);

      if (editingLesson) {
        await updateLesson(editingLesson.id, fd);
        toast.success("Lesson updated");
      } else {
        await createLesson(courseId, fd);
        toast.success("Lesson created");
      }
      setLessonDialog(false);
      fetchLessons();
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally { setLessonSaving(false); }
  };

  const saveAttachment = async () => {
    if (!attachForm.label.trim()) { toast.error("Label is required"); return; }
    try {
      const fd = new FormData();
      fd.append("type", attachForm.type);
      fd.append("label", attachForm.label);
      if (attachForm.type === "LINK" && attachForm.linkUrl) fd.append("linkUrl", attachForm.linkUrl);
      if (attachForm.type === "FILE" && attachForm.file) fd.append("file", attachForm.file);
      await addAttachment(attachDialog, fd);
      toast.success("Attachment added");
      setAttachDialog(null);
      fetchLessons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async () => {
    const { type: dtype, id: did } = deleteTarget;
    try {
      if (dtype === "lesson") { await deleteLesson(did); }
      else if (dtype === "attachment") { await deleteAttachment(did); }
      toast.success("Deleted");
      fetchLessons();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    setDeleteTarget({ type: null, id: null, label: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Lessons ({lessons.length})</h2>
        <Button size="sm" onClick={openAddLesson}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No lessons yet</p>
      ) : (
        <div className="space-y-2">
          {lessons.sort((a, b) => a.order - b.order).map((l) => (
            <div key={l.id} className="rounded-lg border">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedLesson(expandedLesson === l.id ? null : l.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                {expandedLesson === l.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="text-muted-foreground">{typeIcon[l.type]}</span>
                <span className="font-medium flex-1">{l.title}</span>
                <Badge variant="secondary" className="text-xs">{l.type}</Badge>
                <span className="text-xs text-muted-foreground">#{l.order}</span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-xs" onClick={() => openEditLesson(l)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: "lesson", id: l.id, label: l.title })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {expandedLesson === l.id && (
                <div className="border-t bg-muted/30 px-4 py-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Attachments</p>
                    <Button variant="outline" size="xs" onClick={() => { setAttachDialog(l.id); setAttachForm({ type: "FILE", label: "", linkUrl: "", file: null }); }}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(!l.attachments || l.attachments.length === 0) ? (
                    <p className="text-xs text-muted-foreground">No attachments</p>
                  ) : (
                    l.attachments.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-sm">
                        {a.type === "LINK" ? <LinkIcon className="h-3.5 w-3.5" /> : <File className="h-3.5 w-3.5" />}
                        <span className="flex-1">{a.label}</span>
                        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: "attachment", id: a.id, label: a.label })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
            <DialogDescription>Fill in the lesson details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={lessonForm.type} onValueChange={(v) => setLessonForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Order</Label>
                <Input type="number" min={1} value={lessonForm.order} onChange={(e) => setLessonForm((f) => ({ ...f, order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={2} value={lessonForm.description} onChange={(e) => setLessonForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            {lessonForm.type === "VIDEO" && (
              <div className="space-y-1.5">
                <Label>Video URL</Label>
                <Input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input value={lessonForm.duration} onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 300 (seconds)" />
              </div>
              <div className="space-y-1.5">
                <Label>Responsible Name</Label>
                <Input value={lessonForm.responsibleName} onChange={(e) => setLessonForm((f) => ({ ...f, responsibleName: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>File</Label>
              <Input type="file" onChange={(e) => setLessonForm((f) => ({ ...f, file: e.target.files?.[0] || null }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)} disabled={lessonSaving}>Cancel</Button>
            <Button onClick={saveLesson} disabled={lessonSaving}>{lessonSaving ? "Saving..." : editingLesson ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!attachDialog} onOpenChange={() => setAttachDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
            <DialogDescription>Attach a file or link to this lesson.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={attachForm.type} onValueChange={(v) => setAttachForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILE">File</SelectItem>
                  <SelectItem value="LINK">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Label *</Label>
              <Input value={attachForm.label} onChange={(e) => setAttachForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            {attachForm.type === "LINK" ? (
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input value={attachForm.linkUrl} onChange={(e) => setAttachForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setAttachForm((f) => ({ ...f, file: e.target.files?.[0] || null }))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttachDialog(null)}>Cancel</Button>
            <Button onClick={saveAttachment}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget.type} onOpenChange={() => setDeleteTarget({ type: null, id: null, label: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget.label}"? This action cannot be undone.
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