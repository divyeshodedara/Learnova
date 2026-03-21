import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCourses, deleteCourse, createCourse } from "../../api/courses";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { BookOpen, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

export default function CourseList({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Form State for Quick Create
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getCourses({ search });
      setCourses(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setFormData({ title: "", description: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await createCourse(formData);
      setIsModalOpen(false);
      // Navigate to the newly created course editor
      navigate(`/courses/${res.data.data.id}/edit`);
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.errors && Array.isArray(respData.errors)) {
        setError(respData.errors.map(e => e.message).join(", "));
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to create course");
      }
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course? All lessons and enrollments will be lost.")) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
          <p className="text-sm text-muted-foreground">Manage your curriculum, track performance, and publish new content.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <BookOpen className="h-8 w-8 opacity-20" />
                    <p>No courses found. Start by creating one.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{course.title}</span>
                      <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {course.shortDesc || "No short description"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? 'success' : 'secondary'}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {course.visibility.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {course.price > 0 ? `$${course.price}` : "Free"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${course.id}/edit`)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => !submitting && setIsModalOpen(false)} 
          title="Create New Course"
        >
          <form onSubmit={handleCreateCourse} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title</label>
              <Input 
                required 
                placeholder="e.g. Advanced React Patterns"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short Description (Optional)</label>
              <Input 
                placeholder="A brief overview of what this course covers"
                value={formData.shortDesc} 
                onChange={e => setFormData({ ...formData, shortDesc: e.target.value })} 
                disabled={submitting}
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !formData.title.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Continue
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
