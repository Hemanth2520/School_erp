import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Award, FileText, Edit2, Trash2, Trophy, Star, Medal, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type ExamResult = {
  _id?: string;
  id?: string;
  customId?: string;
  studentId?: string;
  studentName: string;
  class: string;
  subject: string;
  examName?: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
};

type Student = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  class: string;
  section?: string;
};

type Exam = {
  name: string;
};

type SubjectItem = {
  name: string;
};

type ExamResultFormInputs = {
  selectedStudentId?: string;
  studentName: string;
  class: string;
  subject: string;
  examName: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  rank?: number;
};

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}

const DEFAULT_CLASSES = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th', '11th', '12th',
];

const DEFAULT_SECTIONS = ['A', 'B', 'C', 'Science', 'Commerce', 'Arts'];

export function ExamResults() {
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'classResults' | 'overallLeaderboard'>('classResults');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

  const { data: examResultsList = [], isLoading: loadingResults, error } = useApiList<ExamResult>('exam-results');
  const { data: studentsList = [] } = useApiList<Student>('students');
  const { data: examsList = [] } = useApiList<Exam>('exams');
  const { data: subjectsList = [] } = useApiList<SubjectItem>('subjects');

  const createResult = useApiCreate();
  const updateResult = useApiUpdate();
  const deleteResult = useApiDelete();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExamResultFormInputs>({
    defaultValues: {
      marksObtained: 85,
      totalMarks: 100,
    },
  });

  const selectedStudentId = watch('selectedStudentId');

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('selectedStudentId', val);
    if (!val) return;
    const found = studentsList.find(s => (s.customId || s._id || s.id) === val);
    if (found) {
      setValue('studentName', found.name);
      setValue('class', `${found.class} ${found.section || ''}`.trim());
    }
  };

  const handleOpenAddModal = () => {
    setEditingResult(null);
    reset({
      selectedStudentId: '',
      studentName: '',
      class: '10th A',
      subject: subjectsList[0]?.name || 'Mathematics',
      examName: examsList[0]?.name || 'Mid-Term 2026',
      marksObtained: 85,
      totalMarks: 100,
      rank: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (resItem: ExamResult) => {
    setEditingResult(resItem);
    setValue('studentName', resItem.studentName || '');
    setValue('class', resItem.class || '');
    setValue('subject', resItem.subject || '');
    setValue('examName', resItem.examName || 'Mid-Term 2026');
    setValue('marksObtained', resItem.marksObtained || 0);
    setValue('totalMarks', resItem.totalMarks || 100);
    setValue('grade', resItem.grade || '');
    setValue('rank', resItem.rank || 1);
    setIsModalOpen(true);
  };

  const handleDeleteResult = async (resItem: ExamResult) => {
    const id = resItem.customId || resItem._id || resItem.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete exam result for ${resItem.studentName}?`)) {
      try {
        await deleteResult.mutateAsync({ path: 'exam-results', id });
        toast.success(`Exam result deleted.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete exam result');
      }
    }
  };

  const onSubmit = async (data: ExamResultFormInputs) => {
    try {
      const marksObtained = Number(data.marksObtained) || 0;
      const totalMarks = Number(data.totalMarks) || 100;
      const percentage = Math.round((marksObtained / totalMarks) * 100);
      const grade = data.grade || calculateGrade(percentage);

      const payload = {
        studentName: data.studentName,
        studentId: data.selectedStudentId || undefined,
        class: data.class,
        subject: data.subject,
        examName: data.examName,
        marksObtained,
        totalMarks,
        percentage,
        grade,
        rank: Number(data.rank) || 1,
      };

      if (editingResult) {
        const id = editingResult.customId || editingResult._id || editingResult.id;
        await updateResult.mutateAsync({
          path: 'exam-results',
          id: id!,
          data: payload,
        });
        toast.success(`Result updated for ${data.studentName}!`);
      } else {
        await createResult.mutateAsync({
          path: 'exam-results',
          data: payload,
        });
        toast.success(`Result posted for ${data.studentName}!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingResult(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save exam result');
    }
  };

  // Filtering Logic (Class, Section, Exam)
  const filteredResults = examResultsList.filter(res => {
    const resClass = (res.class || '').toLowerCase();
    const matchesClass = !selectedClassFilter || resClass.includes(selectedClassFilter.toLowerCase());
    const matchesSection = !selectedSectionFilter || resClass.includes(selectedSectionFilter.toLowerCase());
    const matchesExam = !selectedExamFilter || (res.examName || '') === selectedExamFilter;
    return matchesClass && matchesSection && matchesExam;
  });

  // Overall School Leaderboard across ALL students
  const sortedOverallToppers = [...examResultsList].sort(
    (a, b) => (b.percentage || 0) - (a.percentage || 0) || (b.marksObtained || 0) - (a.marksObtained || 0)
  );

  const overallTopScorer = sortedOverallToppers[0] || null;

  const columns: ColumnDef<ExamResult>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(row.getValue('studentName') as string || 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('studentName')}</p>
            {row.original.examName && <p className="text-[10px] text-muted-foreground">{row.original.examName}</p>}
          </div>
        </div>
      ),
    },
    { accessorKey: 'class', header: 'Class & Section' },
    { accessorKey: 'subject', header: 'Subject' },
    {
      accessorKey: 'marksObtained',
      header: 'Marks',
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.getValue('marksObtained')}
          <span className="text-muted-foreground text-xs">/{row.original.totalMarks}</span>
        </span>
      ),
    },
    {
      accessorKey: 'percentage',
      header: '% Score',
      cell: ({ row }) => {
        const pct = (row.getValue('percentage') as number) || 0;
        return (
          <span className={`font-bold text-sm ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
            {pct}%
          </span>
        );
      },
    },
    {
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }) => (
        <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs">
          {row.getValue('grade') || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }) => (
        <span className="font-bold text-xs flex items-center gap-1">
          {row.getValue('rank') === 1 ? (
            <span className="text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-500" /> #1
            </span>
          ) : (
            `#${row.getValue('rank') || '—'}`
          )}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Result"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteResult(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Result"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Dynamic Metrics & Grade Distribution based on filtered set
  const totalResults = filteredResults.length;
  const avgPct = totalResults > 0 ? Math.round(filteredResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalResults) : 0;
  const topInSelection = filteredResults.length > 0 ? [...filteredResults].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0] : null;
  const passCount = filteredResults.filter(r => (r.percentage || 0) >= 33).length;
  const passRate = totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 100;

  const gradesList = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  const gradeData = gradesList.map(g => ({
    grade: g,
    count: filteredResults.filter(r => r.grade === g).length,
  }));

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingResults ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Exam Results & Leaderboard"
        description="View results by specific class & section, or check overall school ranks and highest marks."
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Post Exam Result"
        showExport
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load exam results. Please retry.
        </p>
      )}

      {/* Mode View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('classResults')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'classResults' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Filter className="h-4 w-4" /> Class & Section View
          </button>
          <button
            onClick={() => setActiveTab('overallLeaderboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'overallLeaderboard' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Trophy className="h-4 w-4 text-yellow-400" /> Overall School Leaderboard (Highest Marks)
          </button>
        </div>
      </div>

      {/* Class & Section Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Filter className="h-4 w-4 text-primary" /> Filter Options:
          </div>

          <div className="flex-1 min-w-[160px]">
            <select
              value={selectedClassFilter}
              onChange={e => setSelectedClassFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Classes</option>
              {DEFAULT_CLASSES.map(c => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <select
              value={selectedSectionFilter}
              onChange={e => setSelectedSectionFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Sections</option>
              {DEFAULT_SECTIONS.map(sec => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <select
              value={selectedExamFilter}
              onChange={e => setSelectedExamFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Exams / Terms</option>
              {examsList.map(e => (
                <option key={e.name} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedClassFilter || selectedSectionFilter || selectedExamFilter) && (
            <button
              onClick={() => {
                setSelectedClassFilter('');
                setSelectedSectionFilter('');
                setSelectedExamFilter('');
              }}
              className="text-xs text-red-500 hover:underline px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* OVERALL TOPPER HIGHLIGHT BANNER */}
      {overallTopScorer && (
        <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-primary/10 to-yellow-500/10 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    🏆 Overall School Topper
                  </span>
                  {overallTopScorer.examName && (
                    <span className="text-xs text-muted-foreground">({overallTopScorer.examName})</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  {overallTopScorer.studentName} — Class {overallTopScorer.class}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Highest Marks: <strong className="text-foreground">{overallTopScorer.marksObtained}/{overallTopScorer.totalMarks}</strong> in {overallTopScorer.subject}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-yellow-500/20 pt-3 sm:pt-0 sm:pl-6 text-center shrink-0">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Percentage</p>
                <p className="text-2xl font-extrabold text-green-600">{overallTopScorer.percentage}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Grade</p>
                <p className="text-2xl font-extrabold text-primary">{overallTopScorer.grade}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">School Rank</p>
                <p className="text-2xl font-extrabold text-yellow-600">#1</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERALL SCHOOL LEADERBOARD VIEW */}
      {activeTab === 'overallLeaderboard' && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" /> Overall Top Performing Students
              </h3>
              <p className="text-xs text-muted-foreground">Ranked by highest marks & percentage across all classes</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {sortedOverallToppers.slice(0, 3).map((topper, idx) => (
              <div
                key={topper.customId || topper._id || idx}
                className={`rounded-xl border p-5 relative overflow-hidden transition-shadow hover:shadow-md ${
                  idx === 0
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : idx === 1
                    ? 'border-slate-400/50 bg-slate-500/5'
                    : 'border-amber-600/50 bg-amber-600/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Medal
                      className={`h-6 w-6 ${
                        idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-amber-600'
                      }`}
                    />
                    <span className="font-extrabold text-sm">Rank #{idx + 1}</span>
                  </div>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {topper.grade}
                  </span>
                </div>
                <h4 className="font-bold text-base text-foreground">{topper.studentName}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Class: {topper.class}</p>
                <p className="text-xs text-muted-foreground">Subject: {topper.subject}</p>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    Score: <strong className="text-foreground">{topper.marksObtained}/{topper.totalMarks}</strong>
                  </span>
                  <span className="font-extrabold text-sm text-green-600">{topper.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards based on selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Filtered Results" value={totalResults} icon={FileText} description={selectedClassFilter ? `Class ${selectedClassFilter}` : 'all classes'} />
        <StatCard title="Class Average" value={`${avgPct}%`} icon={TrendingUp} iconColor="text-blue-500" description="for selected view" />
        <StatCard title="Highest Score" value={`${topInSelection?.percentage || 0}%`} icon={Award} iconColor="text-yellow-500" description={topInSelection?.studentName || '—'} />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={Users} iconColor="text-green-500" description="passed in selection" />
      </div>

      {/* MAIN RESULTS TABLE & DISTRIBUTION */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Results Table</h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredResults.length} record(s){' '}
                {selectedClassFilter && `for Class ${selectedClassFilter}`}{' '}
                {selectedSectionFilter && `Section ${selectedSectionFilter}`}
              </p>
            </div>
          </div>
          <DataTable columns={columns} data={filteredResults} searchKey="studentName" searchPlaceholder="Search student by name..." />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Grade Distribution</h3>
            <p className="text-xs text-muted-foreground">Grade breakdown for selected view</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={gradeData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="grade" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Post / Edit Exam Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResult(null);
        }}
        title={editingResult ? 'Edit Exam Result' : 'Post Exam Result'}
        description={editingResult ? 'Modify student marks or grade.' : 'Record examination marks and grade for a student.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingResult && (
            <div>
              <label className={labelClass}>Select Student (Optional)</label>
              <select value={selectedStudentId || ''} onChange={handleStudentSelect} className={inputClass}>
                <option value="">-- Select from enrolled students --</option>
                {studentsList.map(s => {
                  const id = s.customId || s._id || s.id;
                  return (
                    <option key={id} value={id}>
                      {s.name} ({s.class} {s.section || ''})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Student Name *</label>
            <input {...register('studentName', { required: true })} className={inputClass} placeholder="e.g. Aarav Sharma" />
            {errors.studentName && <span className="text-xs text-red-500">Student name is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Class & Section *</label>
              <input {...register('class', { required: true })} className={inputClass} placeholder="e.g. 10th A" />
              {errors.class && <span className="text-xs text-red-500">Class required</span>}
            </div>

            <div>
              <label className={labelClass}>Subject *</label>
              {subjectsList.length > 0 ? (
                <select {...register('subject', { required: true })} className={inputClass}>
                  {subjectsList.map(sub => (
                    <option key={sub.name} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input {...register('subject', { required: true })} className={inputClass} placeholder="e.g. Mathematics" />
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Exam Term / Name *</label>
            {examsList.length > 0 ? (
              <select {...register('examName', { required: true })} className={inputClass}>
                {examsList.map(e => (
                  <option key={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            ) : (
              <input {...register('examName', { required: true })} className={inputClass} placeholder="e.g. Mid-Term 2026" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marks Obtained *</label>
              <input type="number" {...register('marksObtained', { required: true })} className={inputClass} placeholder="e.g. 85" />
            </div>

            <div>
              <label className={labelClass}>Total Marks *</label>
              <input type="number" {...register('totalMarks', { required: true })} className={inputClass} placeholder="e.g. 100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Grade (Auto-calculated if blank)</label>
              <select {...register('grade')} className={inputClass}>
                <option value="">Auto Calculate</option>
                <option value="A+">A+ (Outstanding)</option>
                <option value="A">A (Excellent)</option>
                <option value="B+">B+ (Very Good)</option>
                <option value="B">B (Good)</option>
                <option value="C+">C+ (Above Average)</option>
                <option value="C">C (Average)</option>
                <option value="D">D (Pass)</option>
                <option value="F">F (Fail)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Rank</label>
              <input type="number" {...register('rank')} className={inputClass} placeholder="e.g. 1" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingResult(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createResult.isPending || updateResult.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createResult.isPending || updateResult.isPending
                ? 'Saving…'
                : editingResult
                ? 'Update Result'
                : 'Post Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
