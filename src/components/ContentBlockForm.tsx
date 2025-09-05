import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const contentSchema = z.discriminatedUnion("contentType", [
  z.object({
    contentType: z.literal("pdf"),
    pdf: z
      .any()
      .refine((files) => files && files.length === 1, "PDF file is required"),
    duration: z.coerce.number().min(1, "Duration is required"),
  }),
  z.object({
    contentType: z.literal("html"),
    html: z.string().min(1, "HTML content is required"),
    duration: z.coerce.number().min(1, "Duration is required"),
  }),
  z.object({
    contentType: z.literal("link"),
    link: z.string().url("Valid URL is required"),
    duration: z.coerce.number().min(1, "Duration is required"),
  }),
]);

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentBlockFormProps {
  block?: { id?: string; type: string };
}

export function ContentBlockForm({ block }: ContentBlockFormProps) {
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      contentType: "pdf",
      duration: 1,
    } as unknown as ContentFormValues,
  });

  if (block?.type !== "CONTENT") return null;

  const pdfFiles = form.watch("pdf");

  async function onSubmit(values: ContentFormValues) {
    const method = block?.id ? "PATCH" : "POST";
    const formData = new FormData();
    formData.append("contentType", values.contentType);
    formData.append("duration", String(values.duration));

    if (values.contentType === "pdf") {
      formData.append("file", values.pdf[0]);
    } else if (values.contentType === "html") {
      formData.append("html", values.html);
    } else if (values.contentType === "link") {
      formData.append("link", values.link);
    }

    await fetch("/api/content", {
      method,
      body: formData,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("contentType") === "pdf" && (
          <FormField
            control={form.control}
            name="pdf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PDF Upload</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                {pdfFiles && pdfFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {pdfFiles[0].name} ({Math.round(pdfFiles[0].size / 1024)} KB)
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("contentType") === "html" && (
          <FormField
            control={form.control}
            name="html"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HTML Content</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[200px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("contentType") === "link" && (
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}

export default ContentBlockForm;

