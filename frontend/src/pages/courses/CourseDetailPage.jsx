import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Pencil, Trash2, GripVertical, Paperclip,
  FileText, Video, Image, HelpCircle, Link as LinkIcon, ChevronDown, ChevronRight,
} from "lucide-react";
import { getCourseById, updateCourse } from "../../api/courses";
import { getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment } from "../../api/lessons";
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion, addOption, updateOption, deleteOption, setRewards } from "../../api/quiz";
import { getInvitations, sendInvitation } from "../../api/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── LESSONS TAB ─────────────────────────────────────────────────────────────
function LessonsTab({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [attachDialog, setAttachDialog] = useState(null);
  const [attachSubmitting, setAttachSubmitting] = useState(false);

  const emptyForm = { title: "", type: "VIDEO", order: "", description: "", videoUrl: "", duration: "", allowDownload: false, file: null, responsibleName: "" };
  const [form, setForm] = useState(emptyForm);
  const emptyAttach = { type: "FILE", label: "", linkUrl: "", file: null };
  const [attachForm, setAttachForm] = useState(emptyAttach);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLessons(courseId);
      setLessons(res.data.data || res.data || []);
    } catch { toast.error("Failed to load lessons"); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, order: String(lessons.length + 1) }); setDialogOpen(true); };
  const openEdit = (l) => {
    setEditing(l);
    setForm({ title: l.title || "", type: l.type || "VIDEO", order: l.order?.toString() || "", description: l.description || "", videoUrl: l.videoUrl || "", duration: l.duration?.toString() || "", allowDownload: !!l.allowDownload, file: null, responsibleName: l.responsibleName || "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("type", form.type);
      if (form.order) fd.append("order", form.order);
      if (form.description) fd.append("description", form.description);
      if (form.type === "VIDEO" && form.videoUrl) fd.append("videoUrl", form.videoUrl);
      if (form.duration) fd.append("duration", form.duration);
      fd.append("allowDownload", form.allowDownload);
      if (form.file) fd.append("file", form.file);
      if (form.responsibleName) fd.append("responsibleName", form.responsibleName);
      if (editing) {
        await updateLesson(editing.id, fd);
        toast.success("Lesson updated");
      } else {
        await createLesson(courseId, fd);
        toast.success("Lesson created");
      }
      setDialogOpen(false);
      fetchLessons();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lesson?")) return;
    try { await deleteLesson(id); toast.success("Lesson deleted"); fetchLessons(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleAttachSubmit = async (e) => {
    e.preventDefault();
    if (!attachForm.label.trim()) { toast.error("Label is required"); return; }
    setAttachSubmitting(true);
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
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setAttachSubmitting(false); }
  };

  const handleDeleteAttach = async (id) => {
    try { await deleteAttachment(id); toast.success("Attachment deleted"); fetchLessons(); }
    catch { toast.error("Failed"); }
  };

  const typeIcon = (type) => {
    switch (type) {
      case "VIDEO": return <Video className="h-4 w-4" />;
      case "DOCUMENT": return <FileText className="h-4 w-4" />;
      case "IMAGE": return <Image className="h-4 w-4" />;
      case "QUIZ": return <HelpCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Lessons ({lessons.length})</h3>
        <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-3.5 w-3.5" /> Add Lesson</Button>
      </div>
      <div className="space-y-1">
        {lessons.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No lessons yet</p>}
        {lessons.sort((a, b) => (a.order || 0) - (b.order || 0)).map((lesson) => (
          <div key={lesson.id} className="border rounded-lg">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              {typeIcon(lesson.type)}
              <button className="flex items-center gap-1 flex-1 text-left text-sm font-medium" onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}>
                {expandedId === lesson.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                {lesson.title}
              </button>
              <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
              <span className="text-xs text-muted-foreground">#{lesson.order}</span>
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(lesson)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(lesson.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
            {expandedId === lesson.id && (
              <div className="border-t px-3 py-2 space-y-2 bg-muted/30">
                {lesson.description && <p className="text-sm text-muted-foreground">{lesson.description}</p>}
                {lesson.videoUrl && <p className="text-sm"><span className="font-medium">Video:</span> <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-primary underline">{lesson.videoUrl}</a></p>}
                {lesson.duration && <p className="text-sm"><span className="font-medium">Duration:</span> {lesson.duration}s</p>}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium">Attachments ({lesson.attachments?.length || 0})</span>
                  <Button variant="outline" size="xs" onClick={() => { setAttachDialog(lesson.id); setAttachForm(emptyAttach); }}>
                    <Paperclip className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {lesson.attachments?.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm pl-2">
                    {a.type === "LINK" ? <LinkIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    <span className="flex-1">{a.label}</span>
                    {a.linkUrl && <a href={a.linkUrl} target="_blank" rel="noreferrer" className="text-primary underline text-xs">Open</a>}
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteAttach(a.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lesson Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="DOCUMENT">Document</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Order</label>
                <Input type="number" min="1" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {form.type === "VIDEO" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Video URL</label>
                <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Duration (seconds)</label>
                <Input type="number" min="0" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Responsible</label>
                <Input value={form.responsibleName} onChange={(e) => setForm({ ...form, responsibleName: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.allowDownload} onCheckedChange={(v) => setForm({ ...form, allowDownload: v })} />
              <label className="text-sm">Allow Download</label>
            </div>
            {(form.type === "DOCUMENT" || form.type === "IMAGE") && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">File</label>
                <Input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attachment Dialog */}
      <Dialog open={!!attachDialog} onOpenChange={(o) => !o && setAttachDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Attachment</DialogTitle></DialogHeader>
          <form onSubmit={handleAttachSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <Select value={attachForm.type} onValueChange={(v) => setAttachForm({ ...attachForm, type: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FILE">File</SelectItem>
                  <SelectItem value="LINK">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Label *</label>
              <Input value={attachForm.label} onChange={(e) => setAttachForm({ ...attachForm, label: e.target.value })} required />
            </div>
            {attachForm.type === "LINK" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">URL</label>
                <Input value={attachForm.linkUrl} onChange={(e) => setAttachForm({ ...attachForm, linkUrl: e.target.value })} placeholder="https://..." />
              </div>
            )}
            {attachForm.type === "FILE" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">File</label>
                <Input type="file" onChange={(e) => setAttachForm({ ...attachForm, file: e.target.files[0] })} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAttachDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={attachSubmitting}>{attachSubmitting ? "Adding..." : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── QUIZZES TAB ─────────────────────────────────────────────────────────────
function QuizzesTab({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [quizDialog, setQuizDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const [qDialog, setQDialog] = useState(null); // quizId to add question
  const [qForm, setQForm] = useState({ text: "", order: "" });

  const [oDialog, setODialog] = useState(null); // questionId to add option
  const [oForm, setOForm] = useState({ text: "", isCorrect: false, order: "" });

  const [rewardsQuiz, setRewardsQuiz] = useState(null);
  const [rewards, setRewards] = useState([{ attemptNumber: 1, points: 0 }, { attemptNumber: 2, points: 0 }, { attemptNumber: 3, points: 0 }]);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getQuizzes(courseId);
      setQuizzes(res.data.data || res.data || []);
    } catch { toast.error("Failed to load quizzes"); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, quizForm);
        toast.success("Quiz updated");
      } else {
        await createQuiz(courseId, quizForm);
        toast.success("Quiz created");
      }
      setQuizDialog(false);
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm("Delete this quiz?")) return;
    try { await deleteQuiz(id); toast.success("Quiz deleted"); fetchQuizzes(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await addQuestion(qDialog, qForm);
      toast.success("Question added");
      setQDialog(null);
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDeleteQuestion = async (id) => {
    try { await deleteQuestion(id); toast.success("Question deleted"); fetchQuizzes(); }
    catch { toast.error("Failed"); }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    try {
      await addOption(oDialog, { ...oForm, order: oForm.order ? Number(oForm.order) : undefined });
      toast.success("Option added");
      setODialog(null);
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDeleteOption = async (id) => {
    try { await deleteOption(id); toast.success("Option deleted"); fetchQuizzes(); }
    catch { toast.error("Failed"); }
  };

  const handleSaveRewards = async () => {
    try {
      await setRewards(rewardsQuiz.id, rewards.filter((r) => r.points > 0));
      toast.success("Rewards saved");
      setRewardsQuiz(null);
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Quizzes ({quizzes.length})</h3>
        <Button size="sm" onClick={() => { setEditingQuiz(null); setQuizForm({ title: "", description: "" }); setQuizDialog(true); }}><Plus className="mr-1 h-3.5 w-3.5" /> Add Quiz</Button>
      </div>
      {quizzes.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No quizzes yet</p>}
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="border rounded-lg">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button className="flex items-center gap-1 flex-1 text-left text-sm font-medium" onClick={() => setExpandedId(expandedId === quiz.id ? null : quiz.id)}>
              {expandedId === quiz.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              {quiz.title}
            </button>
            <Button variant="outline" size="xs" onClick={() => { setRewardsQuiz(quiz); setRewards(quiz.rewards?.length ? quiz.rewards.map((r) => ({ attemptNumber: r.attemptNumber, points: r.points })) : [{ attemptNumber: 1, points: 0 }, { attemptNumber: 2, points: 0 }, { attemptNumber: 3, points: 0 }]); }}>Rewards</Button>
            <Button variant="ghost" size="icon-xs" onClick={() => { setEditingQuiz(quiz); setQuizForm({ title: quiz.title, description: quiz.description || "" }); setQuizDialog(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteQuiz(quiz.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          </div>
          {expandedId === quiz.id && (
            <div className="border-t px-3 py-2 space-y-3 bg-muted/30">
              {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Questions ({quiz.questions?.length || 0})</span>
                <Button variant="outline" size="xs" onClick={() => { setQDialog(quiz.id); setQForm({ text: "", order: String((quiz.questions?.length || 0) + 1) }); }}><Plus className="mr-1 h-3 w-3" /> Question</Button>
              </div>
              {quiz.questions?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((q) => (
                <div key={q.id} className="border rounded-md p-2 space-y-1.5 bg-background">
                  <div className="flex items-center gap-2">
                    <span className="text-sm flex-1"><span className="font-medium">Q{q.order}:</span> {q.text}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteQuestion(q.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                  <div className="pl-4 space-y-1">
                    {q.options?.sort((a, b) => (a.order || 0) - (b.order || 0)).map((o) => (
                      <div key={o.id} className="flex items-center gap-2 text-sm">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-xs ${o.isCorrect ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {o.isCorrect ? "✓" : ""}
                        </span>
                        <span className="flex-1">{o.text}</span>
                        <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteOption(o.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="xs" className="mt-1" onClick={() => { setODialog(q.id); setOForm({ text: "", isCorrect: false, order: String((q.options?.length || 0) + 1) }); }}><Plus className="mr-1 h-3 w-3" /> Option</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Quiz Dialog */}
      <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{editingQuiz ? "Edit Quiz" : "Add Quiz"}</DialogTitle></DialogHeader>
          <form onSubmit={handleQuizSubmit} className="space-y-3">
            <div className="space-y-1.5"><label className="text-sm font-medium">Title *</label><Input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQuizDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingQuiz ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={!!qDialog} onOpenChange={(o) => !o && setQDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
          <form onSubmit={handleAddQuestion} className="space-y-3">
            <div className="space-y-1.5"><label className="text-sm font-medium">Text *</label><Input value={qForm.text} onChange={(e) => setQForm({ ...qForm, text: e.target.value })} required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Order</label><Input type="number" min="1" value={qForm.order} onChange={(e) => setQForm({ ...qForm, order: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQDialog(null)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Option Dialog */}
      <Dialog open={!!oDialog} onOpenChange={(o) => !o && setODialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Option</DialogTitle></DialogHeader>
          <form onSubmit={handleAddOption} className="space-y-3">
            <div className="space-y-1.5"><label className="text-sm font-medium">Text *</label><Input value={oForm.text} onChange={(e) => setOForm({ ...oForm, text: e.target.value })} required /></div>
            <div className="flex items-center gap-2">
              <Switch checked={oForm.isCorrect} onCheckedChange={(v) => setOForm({ ...oForm, isCorrect: v })} />
              <label className="text-sm">Correct Answer</label>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Order</label><Input type="number" min="1" value={oForm.order} onChange={(e) => setOForm({ ...oForm, order: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setODialog(null)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rewards Dialog */}
      <Dialog open={!!rewardsQuiz} onOpenChange={(o) => !o && setRewardsQuiz(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Set Rewards</DialogTitle><DialogDescription>Configure points per attempt for "{rewardsQuiz?.title}"</DialogDescription></DialogHeader>
          <Table>
            <TableHeader><TableRow><TableHead>Attempt</TableHead><TableHead>Points</TableHead></TableRow></TableHeader>
            <TableBody>
              {rewards.map((r, i) => (
                <TableRow key={r.attemptNumber}>
                  <TableCell>Attempt {r.attemptNumber}</TableCell>
                  <TableCell><Input type="number" min="0" value={r.points} onChange={(e) => { const next = [...rewards]; next[i] = { ...r, points: Number(e.target.value) }; setRewards(next); }} className="w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardsQuiz(null)}>Cancel</Button>
            <Button onClick={handleSaveRewards}>Save Rewards</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── INVITATIONS TAB ─────────────────────────────────────────────────────────
function InvitationsTab({ courseId }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInvitations(courseId);
      setInvitations(res.data.data || res.data || []);
    } catch { toast.error("Failed to load invitations"); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await sendInvitation(courseId, { email: email.trim() });
      toast.success("Invitation sent");
      setEmail("");
      fetchInvitations();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSending(false); }
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className="max-w-sm" required />
        <Button type="submit" disabled={sending}>{sending ? "Sending..." : "Send Invite"}</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Sent Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No invitations sent</TableCell></TableRow>
          ) : (
            invitations.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.email}</TableCell>
                <TableCell className="text-muted-foreground">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}</TableCell>
                <TableCell>
                  {inv.acceptedAt ? (
                    <Badge variant="default">Accepted {new Date(inv.acceptedAt).toLocaleDateString()}</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCourseById(id);
      setCourse(res.data.data || res.data);
    } catch { toast.error("Failed to load course"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) return <p className="text-center text-muted-foreground py-12">Course not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/courses"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground">{course.shortDesc || course.description?.slice(0, 100)}</p>
        </div>
        <Badge variant={course.isPublished ? "default" : "outline"}>{course.isPublished ? "Published" : "Draft"}</Badge>
      </div>

      {/* Course Info Card */}
      <div className="border rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-xs text-muted-foreground">Visibility</span>
          <p className="text-sm font-medium">{course.visibility === "EVERYONE" ? "Everyone" : "Signed In"}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Access Rule</span>
          <p className="text-sm font-medium">{course.accessRule === "OPEN" ? "Open" : course.accessRule === "ON_INVITATION" ? "Invitation" : "Payment"}</p>
        </div>
        {course.price != null && (
          <div>
            <span className="text-xs text-muted-foreground">Price</span>
            <p className="text-sm font-medium">${course.price}</p>
          </div>
        )}
        {course.websiteUrl && (
          <div>
            <span className="text-xs text-muted-foreground">Website</span>
            <p className="text-sm font-medium truncate"><a href={course.websiteUrl} target="_blank" rel="noreferrer" className="text-primary underline">{course.websiteUrl}</a></p>
          </div>
        )}
        {course.tags?.length > 0 && (
          <div className="col-span-full">
            <span className="text-xs text-muted-foreground">Tags</span>
            <div className="flex flex-wrap gap-1 mt-1">{course.tags.map((t) => <Badge key={t.id || t} variant="secondary">{t.name || t}</Badge>)}</div>
          </div>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          {course.accessRule === "ON_INVITATION" && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
        </TabsList>
        <TabsContent value="lessons" className="pt-4">
          <LessonsTab courseId={id} />
        </TabsContent>
        <TabsContent value="quizzes" className="pt-4">
          <QuizzesTab courseId={id} />
        </TabsContent>
        {course.accessRule === "ON_INVITATION" && (
          <TabsContent value="invitations" className="pt-4">
            <InvitationsTab courseId={id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
