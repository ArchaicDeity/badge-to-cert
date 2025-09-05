import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface Course {
  id: string;
  title: string;
  code: string;
  status: string;
  version: string;
  updatedAt: string;
}

const Courses = () => {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const term = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term)
    );
  }, [courses, search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Input
          placeholder="Search by title or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.status}</TableCell>
                <TableCell>{course.version}</TableCell>
                <TableCell>
                  {new Date(course.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Publish
                    </Button>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Courses;
