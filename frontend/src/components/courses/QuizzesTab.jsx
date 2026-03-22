import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, addQuestion, deleteQuestion, addOption, deleteOption, setRewards } from "../../api/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function QuizzesTab({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [quizDialog, setQuizDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: "", description: "" });
  const [quizSaving, setQuizSaving] = useState(false);

  const [addingQFor, setAddingQFor] = useState(null);
  const [qForm, setQForm] = useState({ text: "", order: 1 });

  const [addingOptFor, setAddingOptFor] = useState(null);
  const [optForm, setOptForm] = useState({ text: "", isCorrect: false, order: 1 });

  const [rewardsQuiz, setRewardsQuiz] = useState(null);
  const [rewardRows, setRewardRows] = useState([
    { attemptNumber: 1, points: 0 },
    { attemptNumber: 2, points: 0 },
    { attemptNumber: 3, points: 0 },
  ]);

  const [deleteTarget, setDeleteTarget] = useState({ type: null, id: null, label: "" });

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await getQuizzes(courseId);
      setQuizzes(res.data.data || res.data || []);
    } catch {}
  }, [courseId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

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
        await createQuiz(courseId, quizForm);
        toast.success("Quiz created");
      }
      setQuizDialog(false);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setQuizSaving(false); }
  };

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

  const handleDelete = async () => {
    const { type: dtype, id: did } = deleteTarget;
    try {
      if (dtype === "quiz") { await deleteQuiz(did); }
      else if (dtype === "question") { await deleteQuestion(did); }
      else if (dtype === "option") { await deleteOption(did); }
      toast.success("Deleted");
      fetchQuizzes();
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    setDeleteTarget({ type: null, id: null, label: "" });
  };

  return (
    <div className="space-y-4">
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
                  {(q.questions || []).map((question, qi) => (
                    <div key={question.id} className="rounded-md border bg-background p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium flex-1">Q{qi + 1}. {question.text}</span>
                        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: "question", id: question.id, label: question.text })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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

      <Dialog open={!!rewardsQuiz} onOpenChange={() => setRewardsQuiz(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quiz Rewards</DialogTitle>
            <DialogDescription>Set points for each attempt of "{rewardsQuiz?.title}".</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {rewardRows.map((r, i) => (
              <div key={r.attemptNumber} className="flex items-center gap-3">
                <Label className="w-24 text-sm">Attempt {r.attemptNumber}</Label>
                <Input
                  type="number"
                  min={0}
                  value={r.points}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRewardRows((rows) => rows.map((rr, ri) => ri === i ? { ...rr, points: v } : rr));
                  }}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardsQuiz(null)}>Cancel</Button>
            <Button onClick={saveRewards}>Save Rewards</Button>
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
