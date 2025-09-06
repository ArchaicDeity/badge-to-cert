import { Badge } from '@/components/ui/badge';

interface StatusChipProps {
  status: string;
  version: number | string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, version }) => {
  return (
    <Badge variant="outline" className="text-xs">
      {status} v{version}
    </Badge>
  );
};

export default StatusChip;
