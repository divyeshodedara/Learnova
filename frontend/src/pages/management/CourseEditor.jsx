import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseById, updateCourse, togglePublish } from "../../api/courses";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { ArrowLeft, Save, Globe, Lock, Loader2, LayoutList, Settings, Image as ImageIcon } from "lucide-react";

export default function CourseEditor({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic, curriculum, settings
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    description: "",
    coverImageUrl: "",
    price: 0,
    visibility: "EVERYONE",
    accessRule: "OPEN",
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await getCourseById(id);
      const data = res.data.data;
      setCourse(data);
      setFormData({
        title: data.title || "",
        shortDesc: data.shortDesc || "",
        description: data.description || "",
        coverImageUrl: data.coverImageUrl || "",
        price: data.price || 0,
        visibility: data.visibility || "EVERYONE",
        accessRule: data.accessRule || "OPEN",
      });
    } catch (err) {
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
      };
      if (!payload.coverImageUrl) delete payload.coverImageUrl;
      if (!payload.description) delete payload.description;
      if (!payload.shortDesc) delete payload.shortDesc;

      await updateCourse(id, payload);
      setSuccess("Course updated successfully.");
      fetchCourse();
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.errors && Array.isArray(respData.errors)) {
        setError(respData.errors.map(e => e.message).join(", "));
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to update course.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      if (!course.isPublished && !course.websiteUrl) {
         // Ask for a websiteUrl if publishing for the first time
         const url = window.prompt("Enter an optional website URL for this course (or leave blank and press OK):");
         if (url === null) return; // cancelled
         await togglePublish(id, { isPublished: true, websiteUrl: url || "" });
      } else {
         await togglePublish(id, { isPublished: !course.isPublished });
      }
      fetchCourse();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change publish status.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-[300px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/courses")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[500px]">
              {course.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={course.isPublished ? "outline" : "default"} 
            onClick={handlePublishToggle}
          >
            {course.isPublished ? "Unpublish" : "Publish Course"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm rounded-md bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'basic' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('basic')}
        >
          <Settings className="h-4 w-4" /> Basic Info
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'curriculum' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <LayoutList className="h-4 w-4" /> Curriculum
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Lock className="h-4 w-4" /> Access & Pricing
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "basic" && (
          <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title</label>
              <Input 
                required 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Short Description</label>
              <Input 
                value={formData.shortDesc} 
                onChange={e => setFormData({ ...formData, shortDesc: e.target.value })} 
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">Appears on the course card. Max 200 characters.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Description</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the course..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image URL</label>
              <div className="flex gap-2">
                <Input 
                  type="url"
                  placeholder="https://..."
                  value={formData.coverImageUrl} 
                  onChange={e => setFormData({ ...formData, coverImageUrl: e.target.value })} 
                />
              </div>
              {formData.coverImageUrl && (
                <div className="mt-4 rounded-md overflow-hidden border border-border bg-muted aspect-video w-full max-w-sm flex items-center justify-center">
                  <img src={formData.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
          </form>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Course Curriculum</h2>
              <Button onClick={() => navigate(`/courses/${id}/curriculum`)} size="sm">
                Open Curriculum Builder
              </Button>
            </div>
            
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
              {course.lessons && course.lessons.length > 0 ? (
                <div className="divide-y divide-border">
                  {course.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-sm font-medium mr-4 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground capitalize flex items-center gap-2">
                          {lesson.type.toLowerCase()} 
                          {lesson.isFreePreview && <Badge variant="outline" className="text-[10px] py-0 h-4">Free Preview</Badge>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <LayoutList className="h-10 w-10 opacity-20 mb-4" />
                  <p>No lessons or quizzes yet.</p>
                  <Button variant="link" onClick={() => navigate(`/courses/${id}/curriculum`)}>
                    Build Curriculum
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" /> Visibility
                </label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.visibility}
                  onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                >
                  <option value="EVERYONE">Public (Discoverable by everyone)</option>
                  <option value="SIGNED_IN">Signed In Users Only</option>
                </select>
                <p className="text-xs text-muted-foreground">Who can see this course in the catalog.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" /> Access Rule
                </label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.accessRule}
                  onChange={e => setFormData({ ...formData, accessRule: e.target.value })}
                >
                  <option value="OPEN">Open (Free Enrollment)</option>
                  <option value="ON_INVITATION">Invitation Only</option>
                  <option value="ON_PAYMENT">Paid (Requires Purchase)</option>
                </select>
                <p className="text-xs text-muted-foreground">How learners can enroll.</p>
              </div>
            </div>

            {formData.accessRule === "ON_PAYMENT" && (
              <div className="space-y-2 border border-border p-4 rounded-md bg-muted/30 mt-6">
                <label className="text-sm font-medium">Pricing (USD)</label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: e.target.value })} 
                />
                <p className="text-xs text-muted-foreground">Set the price for this course. Ensure your payment gateway is configured.</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
