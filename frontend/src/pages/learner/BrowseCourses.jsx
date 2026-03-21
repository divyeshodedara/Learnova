import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublishedCourses } from "../../api/courses";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { Search, BookOpen, Clock, Tag } from "lucide-react";

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getPublishedCourses({ search });
      setCourses(res.data.data || []);
    } catch (err) {
      setError("Failed to load course catalog.");
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
          <p className="text-muted-foreground mt-1">Discover new skills and elevate your career.</p>
        </div>
        
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for courses..." 
            className="pl-10 h-10 rounded-full bg-background border-border shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-4 flex justify-between items-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-card/50">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground max-w-md">
            {search ? "We couldn't find any courses matching your search criteria." : "There are currently no published courses available. Please check back later."}
          </p>
          {search && (
            <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <Link key={course.id} to={`/browse/${course.id}`} className="group relative rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full hover:border-primary/50">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {course.coverImageUrl ? (
                  <img 
                    src={course.coverImageUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm border-0 font-medium whitespace-nowrap">
                    {course.price > 0 ? `$${course.price}` : "Free"}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex gap-2 mb-3 max-w-full overflow-hidden">
                  <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 bg-card text-muted-foreground whitespace-nowrap">
                    <Tag className="w-3 h-3 mr-1" />
                    {course.visibility.toLowerCase()}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {course.shortDesc || course.description || "No description available."}
                </p>
                
                <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    Self-paced
                  </div>
                  <span className="text-sm font-medium text-primary hover:underline">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
