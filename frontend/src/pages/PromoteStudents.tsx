import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { ArrowRight, CheckCircle, GraduationCap, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiUpdate } from '../hooks/useApi';

type Student = {
  _id?: string;
  id?: string;
  customId?: string;
  rollNo?: string;
  name: string;
  class: string;
  section?: string;
  status: string;
};

type ClassItem = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  sections?: string | string[];
};

const DEFAULT_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th', '11th', '12th',
];

export function PromoteStudents() {
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPromoting, setIsPromoting] = useState(false);

  const { data: studentsList = [], isLoading: loadingStudents, error: studentsError } = useApiList<Student>('students');
  const { data: classesList = [], isLoading: loadingClasses } = useApiList<ClassItem>('classes');

  const updateStudent = useApiUpdate();

  // Combine default classes, fetched API classes, and classes present in student data
  const fetchedClassNames = classesList.map(c => c.name);
  const studentClassNames = studentsList.map(s => s.class).filter(Boolean);
  const allClasses = Array.from(new Set([...DEFAULT_CLASSES, ...fetchedClassNames, ...studentClassNames]));

  const filtered = studentsList.filter(s => !fromClass || s.class === fromClass);

  const getStudentId = (s: Student) => s.customId || s._id || s.id || '';

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      const allIds = filtered.map(getStudentId).filter(Boolean);
      setSelected(new Set(allIds));
    }
  };

  const toggle = (id: string) => {
    const copy = new Set(selected);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelected(copy);
  };

  const handlePromote = async () => {
    if (!toClass) {
      toast.error('Please select target class');
      return;
    }
    if (selected.size === 0) {
      toast.error('Please select at least one student');
      return;
    }
    if (fromClass && fromClass === toClass) {
      toast.error('Target class must be different from source class');
      return;
    }

    setIsPromoting(true);
    let successCount = 0;

    try {
      const selectedStudents = filtered.filter(s => {
        const id = getStudentId(s);
        return id && selected.has(id);
      });

      await Promise.all(
        selectedStudents.map(async (student) => {
          const id = getStudentId(student);
          if (id) {
            await updateStudent.mutateAsync({
              path: 'students',
              id,
              data: { class: toClass },
            });
            successCount++;
          }
        })
      );

      toast.success(`Successfully promoted ${successCount} student(s) to Class ${toClass}!`);
      setSelected(new Set());
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to promote some students');
    } finally {
      setIsPromoting(false);
    }
  };

  const isLoading = loadingStudents || loadingClasses;

  return (
    <div className={isLoading ? 'opacity-50 transition-opacity' : ''}>
      <PageHeader title="Promote Students" description="Promote enrolled students from one academic class to the next." showExport={false} />

      {studentsError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load student data from server. Please retry.
        </p>
      )}

      {/* Class Selection Controls */}
      <div className="rounded-xl border border-border bg-card p-5 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1 text-foreground">From Class</label>
            <select
              value={fromClass}
              onChange={e => {
                setFromClass(e.target.value);
                setSelected(new Set());
              }}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Classes ({studentsList.length} students)</option>
              {allClasses.map(className => {
                const count = studentsList.filter(s => s.class === className).length;
                return (
                  <option key={className} value={className}>
                    Class {className} {count > 0 ? `(${count} students)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center justify-center h-10 px-2">
            <ArrowRight className="h-5 w-5 text-primary shrink-0" />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium mb-1 text-foreground">To Class (Target Promotion)</label>
            <select
              value={toClass}
              onChange={e => setToClass(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
            >
              <option value="">Select target class to promote to...</option>
              {allClasses.map(className => (
                <option key={className} value={className}>
                  Class {className}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={isPromoting || selected.size === 0 || !toClass}
            onClick={handlePromote}
            className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <CheckCircle className="h-4 w-4" />
            {isPromoting ? 'Promoting…' : `Promote ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>
      </div>

      {/* Student Table / Selection List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">
              Students {fromClass ? `in Class ${fromClass}` : ''} ({filtered.length})
            </p>
          </div>
          {filtered.length > 0 && (
            <button onClick={toggleAll} className="text-xs text-primary font-medium hover:underline">
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            No students found {fromClass ? `in Class ${fromClass}` : ''}.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map(student => {
              const id = getStudentId(student);
              const isSelected = selected.has(id);

              return (
                <div
                  key={id || student.name}
                  className={`flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => id && toggle(id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => id && toggle(id)}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {(student.name || 'ST').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Roll No: {student.rollNo || '—'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md text-foreground">
                      Class {student.class} {student.section || ''}
                    </span>
                  </div>
                  <StatusBadge status={student.status || 'Active'} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

