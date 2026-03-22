import { Video, FileText, Image as ImageIcon, HelpCircle } from "lucide-react";

export default function LessonTypeIcon({ type, size = 16 }) {
  const icons = {
    VIDEO: <Video size={size} />,
    DOCUMENT: <FileText size={size} />,
    IMAGE: <ImageIcon size={size} />,
    QUIZ: <HelpCircle size={size} />,
  };
  return icons[type] || <FileText size={size} />;
}
