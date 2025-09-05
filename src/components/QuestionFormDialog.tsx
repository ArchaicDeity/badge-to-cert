import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Question } from '@/lib/mockData';

const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('MCQ'),
    body: z.string().min(1, 'Question is required'),
    choices: z.array(z.string().min(1, 'Choice is required')).min(2, 'At least two choices'),
    correctIndex: z.number().int().refine((val, ctx) => val >= 0 && val < ctx.parent.choices.length, {
      message: 'Select a valid correct answer'
    })
  }),
  z.object({
    type: z.literal('TF'),
    body: z.string().min(1, 'Question is required'),
    correctIndex: z.number().int().min(0).max(1)
  })
]);

type QuestionFormValues = z.infer<typeof schema>;

const defaultValues: QuestionFormValues = {
  type: 'MCQ',
  body: '',
  choices: ['', ''],
  correctIndex: 0
};

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question;
}

export function QuestionFormDialog({ open, onOpenChange, question }: QuestionFormDialogProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: question ? { ...question } : defaultValues
  });

  const type = form.watch('type');
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'choices' as const });

  useEffect(() => {
    if (type === 'TF') {
      form.setValue('choices', ['True', 'False']);
      if (form.getValues('correctIndex') > 1) {
        form.setValue('correctIndex', 0);
      }
    } else if (type === 'MCQ' && form.getValues('choices').length < 2) {
      form.setValue('choices', ['', '']);
    }
  }, [type, form]);

  const handleSubmit = async (values: QuestionFormValues, addAnother = false) => {
    const payload = values.type === 'TF' ? { ...values, choices: ['True', 'False'] } : values;
    const url = question ? `/api/questions/${question.id}` : '/api/questions';
    const method = question ? 'PATCH' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (addAnother) {
      form.reset(defaultValues);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add Question'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => handleSubmit(data, false))} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice</SelectItem>
                      <SelectItem value="TF">True / False</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'MCQ' && (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`choices.${index}` as const}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} placeholder={`Choice ${index + 1}`} />
                        </FormControl>
                        {fields.length > 2 && (
                          <Button type="button" variant="outline" onClick={() => remove(index)}>
                            Remove
                          </Button>
                        )}
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="button" variant="secondary" onClick={() => append('')}>
                  Add Choice
                </Button>
                <FormField
                  control={form.control}
                  name="correctIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct choice" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((_, idx) => (
                            <SelectItem key={idx} value={String(idx)}>
                              Choice {idx + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {type === 'TF' && (
              <FormField
                control={form.control}
                name="correctIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <RadioGroup onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="true" />
                        <Label htmlFor="true">True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="false" />
                        <Label htmlFor="false">False</Label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit((data) => handleSubmit(data, true))}
              >
                Save & Add Another
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
