import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CourseTable({
  courses,
  loading,
  onNavigate,
  onEdit,
  onPublishToggle,
  onDelete,
}) {
  return (
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
                onClick={() => onNavigate(c.id)}
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
                      <DropdownMenuItem onClick={() => onEdit(c)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPublishToggle(c)}>
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
                        onClick={() => onDelete(c)}
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
  );
}
