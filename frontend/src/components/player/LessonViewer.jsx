import {
  Video,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import QuizPlayer from "./QuizPlayer";

export default function LessonViewer({ lesson, enrollmentId }) {
  if (!lesson) return null;

  const { type, videoUrl, fileUrl, quizLesson } = lesson;

  if (type === "VIDEO") {
    const getEmbedUrl = (url) => {
      if (!url) return null;
      const ytMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/
      );
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
      if (driveMatch)
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      return null;
    };

    const embedUrl = getEmbedUrl(videoUrl);
    return embedUrl ? (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allowFullScreen
          title="Video lesson"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    ) : (
      <div className="rounded-lg border border-border p-6 text-center space-y-3">
        <Video size={40} className="mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Video available at:</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          <ExternalLink size={14} />
          Open Video Link
        </a>
      </div>
    );
  }

  if (type === "IMAGE") {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 p-4">
        <img
          src={fileUrl}
          alt={lesson.title}
          className="max-h-[70vh] rounded-lg object-contain"
        />
      </div>
    );
  }

  if (type === "DOCUMENT") {
    return (
      <div className="h-[70vh] w-full overflow-hidden rounded-lg border border-border flex flex-col items-center justify-center gap-4 bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">Document Preview</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ExternalLink size={16} />
          Open Document
        </a>
      </div>
    );
  }

  if (type === "QUIZ") {
    const quiz = quizLesson?.quiz || quizLesson;
    return quiz ? (
      <QuizPlayer quiz={quiz} enrollmentId={enrollmentId} />
    ) : (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16">
        <HelpCircle size={40} className="text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Quiz data not available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Unsupported lesson type: {type}
      </p>
    </div>
  );
}
