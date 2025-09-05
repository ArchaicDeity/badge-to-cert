import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ValidationPanelProps {
  errors: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ errors, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Validation Errors</DialogTitle>
      </DialogHeader>
      <ul className="list-disc space-y-1 pl-4">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-destructive">
            {error}
          </li>
        ))}
      </ul>
    </DialogContent>
  </Dialog>
);

export default ValidationPanel;

