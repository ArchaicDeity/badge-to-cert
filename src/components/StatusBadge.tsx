import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CourseStatus } from "@/constants/enums";

interface StatusBadgeProps {
  status: CourseStatus;
  className?: string;
}

const statusConfig: Record<CourseStatus, { label: string; variant: "secondary" | "destructive"; className: string }> = {
  [CourseStatus.NOT_STARTED]: {
    label: 'Not Started',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground'
  },
  [CourseStatus.THEORY_PASS]: {
    label: 'Theory Pass',
    variant: 'secondary',
    className: 'bg-warning/10 text-warning-foreground border-warning/20'
  },
  [CourseStatus.PRACTICAL_PASS]: {
    label: 'Certified',
    variant: 'secondary',
    className: 'bg-success/10 text-success-foreground border-success/20'
  },
  [CourseStatus.NYC]: {
    label: 'Not Yet Competent',
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};