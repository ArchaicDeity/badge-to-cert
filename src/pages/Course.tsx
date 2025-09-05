import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ValidationPanel from "@/components/ValidationPanel";

interface Course {
  id: string;
  status: string;
  version: number;
}

const CoursePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course>({
    id: id || "1",
    status: "DRAFT",
    version: 1,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/courses/${course.id}/publish`, { method: "POST" });
      if (res.ok) {
        setCourse((prev) => ({ ...prev, status: "PUBLISHED", version: prev.version + 1 }));
        toast({ title: "Course published" });
      } else {
        const data = await res.json().catch(() => ({}));
        const rawErrors = (data.errors ?? []) as Array<{ message?: string } | string>;
        const parsed = rawErrors.map((e) =>
          typeof e === "string" ? e : e.message ?? JSON.stringify(e)
        );
        setErrors(parsed.length ? parsed : ["Unable to publish course."]);
        setOpen(true);
      }
    } catch {
      setErrors(["Network error"]);
      setOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <p>Status: {course.status}</p>
        <p>Version: {course.version}</p>
      </div>
      <Button onClick={handlePublish}>Publish</Button>
      <ValidationPanel errors={errors} open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default CoursePage;

