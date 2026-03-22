import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  Send,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { getCourseById, updateCourse, getInvitations, sendInvitation } from "../../api/courses";
import { getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment } from "../../api/lessons";
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion, addOption, updateOption, deleteOption, setRewards } from "../../api/quiz";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ─── type icon helper ─── */
const typeIcon = {
  VIDEO: <Video className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
  IMAGE: <ImageIcon className="h-4 w-4" />,
  QUIZ: <HelpCircle className="h-4 w-4" />,
};

/* ─────────────────────────────────────── */
export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── course ── */
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── lessons ── */
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "", type: "VIDEO", order: 1, description: "", videoUrl: "",
    duration: "", allowDownload: false, file: null, responsibleName: "",
  });
  const [lessonSaving, setLessonSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, label: "" });

  /* ── attachment ── */
  const [attachDialog, setAttachDialog] = useState(null); // lessonId
  const [attachForm, setAttachForm] = useState({ type: "FILE", label: "", linkUrl: "", file: null });

  /* ── quizzes ── */
  const [quizzes, setQuizzes] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [quizDialog, setQuizDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: "", description: "" });
  const [quizSaving, setQuizSaving] = useState(false);

  /* question inline add */
  const [addingQFor, setAddingQFor] = useState(null); // quizId
  const [qForm, setQForm] = useState({ text: "", order: 1 });

  /* option inline add */
  const [addingOptFor, setAddingOptFor] = useState(null); // questionId
  const [optForm, setOptForm] = useState({ text: "", isCorrect: false, order: 1 });

  /* rewards */
  const [rewardsQuiz, setRewardsQuiz] = useState(null);
  const [rewardRows, setRewardRows] = useState([
    { attemptNumber: 1, points: 0 },
    { attemptNumber: 2, points: 0 },
    { attemptNumber: 3, points: 0 },
  ]);

  /* ── invitations ── */
  const [invitations, setInvitations] = useState([]);
  const [invEmail, setInvEmail] = useState("");
  const [invSending, setInvSending] = useState(false);

  /* ─── fetch all ─── */
  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCourseById(id);
      setCourse(res.data.data || res.data);
    } catch {
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await getLessons(id);
      setLessons(res.data.data || res.data || []);
    } catch {}
  }, [id]);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await getQuizzes(id);
      setQuizzes(res.data.data || res.data || []);
    } catch {}
  }, [id]);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await getInvitations(id);
      setInvitations(res.data.data || res.data || []);
    } catch {}
  }, [id]);

  useEffect(() => {
    fetchCourse();
    fetchLessons();
    fetchQuizzes();
    fetchInvitations();
  }, [fetchCourse, fetchLessons, fetchQuizzes, fetchInvitations]);

  /* ─── LESSON CRUD ─── */
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
        await createLesson(id, fd);
        toast.success("Lesson created");
      }
      setLessonDialog(false);
      fetchLessons();
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally { setLessonSaving(false); }
  };

  /* ─── ATTACHMENT CRUD ─── */
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

  /* ─── QUIZ CRUD ─── */
  const openAddQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({ title: "", description: "" });
    setQuizDialog(true);
  };
  const openEditQuiz = (q) => {
    setEditingQuiz(q);
    setQuizForm({ title: q.title || "", description: q.description || "" });
    setQuizDialog(true);
  };
  const saveQuiz = async () => {
    if (!quizForm.title.trim()) { toast.error("Title is required"); return; }
    setQuizSaving(true);
    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, quizForm);
        toast.success("Quiz updated");
      } else {
        await createQuiz(id, quizForm);
        toast.success("Quiz created");
      }
      setQuizDialog(false);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setQuizSaving(false); }
  };

  /* ─── QUESTION ─── */
  const submitQuestion = async (quizId) => {
    if (!qForm.text.trim()) return;
    try {
      await addQuestion(quizId, qForm);
      toast.success("Question added");
      setAddingQFor(null);
      setQForm({ text: "", order: 1 });
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  /* ─── OPTION ─── */
  const submitOption = async (questionId) => {
    if (!optForm.text.trim()) return;
    try {
      await addOption(questionId, optForm);
      toast.success("Option added");
      setAddingOptFor(null);
      setOptForm({ text: "", isCorrect: false, order: 1 });
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  /* ─── REWARDS ─── */
  const openRewards = (quiz) => {
    setRewardsQuiz(quiz);
    const existing = quiz.rewards || [];
    setRewardRows([1, 2, 3].map((n) => {
      const found = existing.find((r) => r.attemptNumber === n);
      return { attemptNumber: n, points: found?.points || 0 };
    }));
  };
  const saveRewards = async () => {
    try {
      await setRewards(rewardsQuiz.id, rewardRows);
      toast.success("Rewards saved");
      setRewardsQuiz(null);
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  /* ─── INVITATION ─── */
  const handleSendInvite = async () => {
    if (!invEmail.trim()) return;
    setInvSending(true);
    try {
      await sendInvitation(id, invEmail);
      toast.success("Invitation sent");
      setInvEmail("");
      fetchInvitations();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setInvSending(false); }
  };

  /* ─── generic delete handler ─── */
  const handleDelete = async () => {
    const { type: dtype, id: did } = deleteTarget;
    try {
      if (dtype === "lesson") { await deleteLesson(did); fetchLessons(); }
      else if (dtype === "attachment") { await deleteAttachment(did); fetchLessons(); }
      else if (dtype === "quiz") { await deleteQuiz(did); fetchQuizzes(); }
      else if (dtype === "question") { await deleteQuestion(did); fetchQuizzes(); }
      else if (dtype === "option") { await deleteOption(did); fetchQuizzes(); }
      toast.success("Deleted");
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    setDeleteTarget({ type: null, id: null, label: "" });
  };

  /* ─── RENDER ─── */
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!course) return <p className="text-muted-foreground">Course not found.</p>;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/courses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground text-sm">
            {course.description?.slice(0, 120)}
          </p>
        </div>
        <Badge variant={course.isPublished ? "default" : "outline"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>

      {/* info row */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Visibility: <strong className="text-foreground">{course.visibility}</strong></span>
        <span>Access: <strong className="text-foreground">{course.accessRule?.replace(/_/g, " ")}</strong></span>
        {course.price != null && <span>Price: <strong className="text-foreground">${course.price}</strong></span>}
      </div>

      <Separator />

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          {course.accessRule === "ON_INVITATION" && (
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          )}
        </TabsList>

        {/* ═══════ LESSONS TAB ═══════ */}
        <TabsContent value="lessons" className="mt-4 space-y-4">
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
                  {/* lesson row */}
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

                  {/* expanded: attachments */}
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
        </TabsContent>

        {/* ═══════ QUIZZES TAB ═══════ */}
        <TabsContent value="quizzes" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Quizzes ({quizzes.length})</h2>
            <Button size="sm" onClick={openAddQuiz}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quizzes yet</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div key={q.id} className="rounded-lg border">
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedQuiz(expandedQuiz === q.id ? null : q.id)}
                  >
                    {expandedQuiz === q.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium flex-1">{q.title}</span>
                    <span className="text-xs text-muted-foreground">{q.questions?.length || 0} questions</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-xs" onClick={() => openRewards(q)} title="Set Rewards">
                        <Trophy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => openEditQuiz(q)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: "quiz", id: q.id, label: q.title })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedQuiz === q.id && (
                    <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
                      {/* questions */}
                      {(q.questions || []).map((question, qi) => (
                        <div key={question.id} className="rounded-md border bg-background p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium flex-1">Q{qi + 1}. {question.text}</span>
                            <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: "question", id: question.id, label: question.text })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          {/* options */}
                          <div className="pl-4 space-y-1">
                            {(question.options || []).map((opt) => (
                              <div key={opt.id} className="flex items-center gap-2 text-sm">
                                <span className={`h-2 w-2 rounded-full ${opt.isCorrect ? "bg-foreground" : "bg-muted-foreground/30"}`} />
                                <span className={opt.isCorrect ? "font-medium" : "text-muted-foreground"}>{opt.text}</span>
                                <Button variant="ghost" size="icon-xs" className="ml-auto" onClick={() => setDeleteTarget({ type: "option", id: opt.id, label: opt.text })}>
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            ))}
                            {/* add option inline */}
                            {addingOptFor === question.id ? (
                              <div className="flex gap-2 items-center mt-1">
                                <Input value={optForm.text} onChange={(e) => setOptForm((f) => ({ ...f, text: e.target.value }))} placeholder="Option text" className="h-7 text-xs flex-1" />
                                <Input type="number" value={optForm.order} onChange={(e) => setOptForm((f) => ({ ...f, order: Number(e.target.value) }))} className="h-7 text-xs w-16" placeholder="#" />
                                <label className="flex items-center gap-1 text-xs">
                                  <input type="checkbox" checked={optForm.isCorrect} onChange={(e) => setOptForm((f) => ({ ...f, isCorrect: e.target.checked }))} /> Correct
                                </label>
                                <Button size="xs" onClick={() => submitOption(question.id)}>Add</Button>
                                <Button size="xs" variant="ghost" onClick={() => setAddingOptFor(null)}>✕</Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="xs" className="mt-1 text-xs" onClick={() => { setAddingOptFor(question.id); setOptForm({ text: "", isCorrect: false, order: (question.options?.length || 0) + 1 }); }}>
                                <Plus className="h-3 w-3 mr-1" /> Add Option
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* add question */}
                      {addingQFor === q.id ? (
                        <div className="flex gap-2 items-center">
                          <Input value={qForm.text} onChange={(e) => setQForm((f) => ({ ...f, text: e.target.value }))} placeholder="Question text" className="h-8 text-sm flex-1" />
                          <Input type="number" value={qForm.order} onChange={(e) => setQForm((f) => ({ ...f, order: Number(e.target.value) }))} className="h-8 text-sm w-16" placeholder="#" />
                          <Button size="sm" onClick={() => submitQuestion(q.id)}>Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => setAddingQFor(null)}>✕</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => { setAddingQFor(q.id); setQForm({ text: "", order: (q.questions?.length || 0) + 1 }); }}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══════ INVITATIONS TAB ═══════ */}
        {course.accessRule === "ON_INVITATION" && (
          <TabsContent value="invitations" className="mt-4 space-y-4">
            <h2 className="text-lg font-semibold">Invitations</h2>
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Email address"
                type="email"
                value={invEmail}
                onChange={(e) => setInvEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
              />
              <Button onClick={handleSendInvite} disabled={invSending}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {invSending ? "Sending..." : "Send Invite"}
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No invitations sent yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
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
          </TabsContent>
        )}
      </Tabs>

      {/* ═══════ DIALOGS ═══════ */}

      {/* Lesson Dialog */}
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
            <div className="flex items-center gap-2">
              <Switch checked={lessonForm.allowDownload} onCheckedChange={(v) => setLessonForm((f) => ({ ...f, allowDownload: v }))} />
              <Label>Allow Download</Label>
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

      {/* Attachment Dialog */}
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

      {/* Quiz Dialog */}
      <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? "Edit Quiz" : "Add Quiz"}</DialogTitle>
            <DialogDescription>Enter quiz details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={quizForm.title} onChange={(e) => setQuizForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" rows={2} value={quizForm.description} onChange={(e) => setQuizForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizDialog(false)} disabled={quizSaving}>Cancel</Button>
            <Button onClick={saveQuiz} disabled={quizSaving}>{quizSaving ? "Saving..." : editingQuiz ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rewards Dialog */}
      <Dialog open={!!rewardsQuiz} onOpenChange={() => setRewardsQuiz(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Rewards</DialogTitle>
            <DialogDescription>Set max points per attempt for "{rewardsQuiz?.title}". Actual points earned = max pts × score %.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">Example: If max is 50 pts and learner scores 80%, they earn 40 pts.</p>
            {rewardRows.map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <Label className="w-24">Attempt {row.attemptNumber}</Label>
                <Input type="number" min={0} value={row.points} onChange={(e) => setRewardRows((r) => r.map((rr, ii) => ii === i ? { ...rr, points: Number(e.target.value) } : rr))} className="flex-1" />
                <span className="text-xs text-muted-foreground">max pts</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardsQuiz(null)}>Cancel</Button>
            <Button onClick={saveRewards}>Save Rewards</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget.type} onOpenChange={() => setDeleteTarget({ type: null, id: null, label: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget.label}"? This cannot be undone.
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
