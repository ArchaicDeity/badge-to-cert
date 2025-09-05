import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type LearnerStatus = 'NOT_STARTED' | 'THEORY_PASS' | 'PRACTICAL_PASS' | 'NYC';

interface StatusBadgeProps {
  status: LearnerStatus;
  className?: string;
}

const statusConfig = {
  NOT_STARTED: {
    label: 'Not Started',
    variant: 'secondary' as const,
    className: 'bg-muted text-muted-foreground'
  },
  THEORY_PASS: {
    label: 'Theory Pass',
    variant: 'secondary' as const,
    className: 'bg-warning/10 text-warning-foreground border-warning/20'
  },
  PRACTICAL_PASS: {
    label: 'Certified',
    variant: 'secondary' as const,
    className: 'bg-success/10 text-success-foreground border-success/20'
  },
  NYC: {
    label: 'Not Yet Competent',
    variant: 'destructive' as const,
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