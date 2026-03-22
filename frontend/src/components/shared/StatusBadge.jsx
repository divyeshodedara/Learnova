import { Badge } from "@/components/ui/badge";

const statusConfig = {
  COMPLETED: { variant: "default", className: "bg-foreground text-background" },
  IN_PROGRESS: { variant: "secondary", className: "bg-muted text-foreground" },
  YET_TO_START: { variant: "secondary", className: "bg-muted text-muted-foreground" },
  PUBLISHED: { variant: "default", className: "bg-foreground text-background" },
  DRAFT: { variant: "outline", className: "text-muted-foreground" },
  SUCCESS: { variant: "default", className: "bg-foreground text-background" },
  PENDING: { variant: "secondary", className: "bg-muted text-muted-foreground" },
  FAILED: { variant: "destructive" },
  OPEN: { variant: "outline" },
  ON_PAYMENT: { variant: "default", className: "bg-foreground text-background" },
  ON_INVITATION: { variant: "outline", className: "border-muted-foreground text-muted-foreground" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { variant: "secondary" };

  return (
    <Badge variant={config.variant} className={config.className}>
      {status?.replace(/_/g, " ")}
    </Badge>
  );
}
