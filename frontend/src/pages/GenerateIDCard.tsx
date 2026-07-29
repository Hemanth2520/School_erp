import { useState, useRef } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Download, Printer, UserCheck, IdCard, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList } from '../hooks/useApi';

type Student = {
  _id?: string;
  id?: string;
  customId?: string;
  rollNo?: string;
  name: string;
  class: string;
  section?: string;
  dob?: string;
  bloodGroup?: string;
  phone?: string;
  photo?: string;
};

type StaffMember = {
  _id?: string;
  id?: string;
  customId?: string;
  employeeId?: string;
  name: string;
  designation?: string;
  department?: string;
  phone?: string;
  joinDate?: string;
};

export function GenerateIDCard() {
  const [cardCategory, setCardCategory] = useState<'student' | 'staff'>('student');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [cardType, setCardType] = useState('Standard ID Card');

  const cardRef = useRef<HTMLDivElement>(null);

  const { data: studentsList = [], isLoading: loadingStudents } = useApiList<Student>('students');
  const { data: staffList = [], isLoading: loadingStaff } = useApiList<StaffMember>('staff');

  const selectedStudent = cardCategory === 'student'
    ? studentsList.find(s => (s.customId || s._id || s.id) === selectedPersonId) || studentsList[0]
    : null;

  const selectedStaff = cardCategory === 'staff'
    ? staffList.find(s => (s.customId || s._id || s.id) === selectedPersonId) || staffList[0]
    : null;

  const activePerson = cardCategory === 'student' ? selectedStudent : selectedStaff;

  const handlePrint = () => {
    toast.success('Opening print dialog...');
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success(`Exporting ID Card PDF for ${activePerson?.name || 'card'}...`);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ID';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const isLoading = loadingStudents || loadingStaff;

  return (
    <div className={isLoading ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader title="Generate ID Card" description="Generate and preview student and staff identity cards with real database records." showExport={false} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls Panel */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <IdCard className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">ID Card Settings</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Card Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCardCategory('student');
                  setSelectedPersonId('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  cardCategory === 'student'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input text-muted-foreground hover:bg-accent'
                }`}
              >
                Student ID Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardCategory('staff');
                  setSelectedPersonId('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  cardCategory === 'staff'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input text-muted-foreground hover:bg-accent'
                }`}
              >
                Staff / Teacher ID
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Select {cardCategory === 'student' ? 'Student' : 'Staff Member'}
            </label>
            <select
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">
                {cardCategory === 'student'
                  ? `-- Select Student (${studentsList.length} records) --`
                  : `-- Select Staff Member (${staffList.length} records) --`}
              </option>

              {cardCategory === 'student'
                ? studentsList.map(s => {
                    const id = s.customId || s._id || s.id;
                    return (
                      <option key={id} value={id}>
                        {s.name} — Class {s.class} {s.section || ''} ({s.rollNo ? `Roll: ${s.rollNo}` : 'No Roll'})
                      </option>
                    );
                  })
                : staffList.map(st => {
                    const id = st.customId || st._id || st.id;
                    return (
                      <option key={id} value={id}>
                        {st.name} — {st.designation || st.department || 'Staff'}
                      </option>
                    );
                  })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Card Format</label>
            <select
              value={cardType}
              onChange={e => setCardType(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option>Standard ID Card</option>
              <option>Library Access Card</option>
              <option>Transport Bus Pass</option>
              <option>Campus Gate Pass</option>
            </select>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> High Resolution Render
            </span>
            <span>Academic Year 2026-27</span>
          </div>
        </div>

        {/* Live ID Card Preview Panel */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Live Card Preview</h3>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {cardType}
            </span>
          </div>

          {!activePerson ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              <IdCard className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
              No records found. Please add {cardCategory === 'student' ? 'students' : 'staff'} in the directory.
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-5">
              {/* ID CARD GRAPHIC CONTAINER */}
              <div
                ref={cardRef}
                className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-border bg-white dark:bg-slate-900 transition-all transform hover:scale-[1.01]"
              >
                {/* School Header Banner */}
                <div className="bg-gradient-to-r from-primary via-indigo-600 to-primary px-5 py-4 text-center text-white relative">
                  <p className="font-extrabold text-base tracking-wide uppercase">Sunrise International School</p>
                  <p className="text-white/80 text-[10px] tracking-wider font-medium mt-0.5">
                    Affiliated to CBSE | School Code: 411001
                  </p>
                  <div className="absolute top-2 right-3 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Card Main Body */}
                <div className="p-5 flex gap-4 items-center">
                  <div className="relative shrink-0">
                    <div className="h-20 w-16 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-2xl shadow-inner">
                      {getInitials(activePerson.name)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                      ✓
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                      {activePerson.name}
                    </h4>

                    {cardCategory === 'student' && selectedStudent && (
                      <>
                        <p className="text-xs font-semibold text-primary">
                          Class: {selectedStudent.class} {selectedStudent.section || ''}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Roll No: <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.rollNo || '—'}</strong>
                        </p>
                        {selectedStudent.dob && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            DOB: {new Date(selectedStudent.dob).toISOString().split('T')[0]}
                          </p>
                        )}
                        {selectedStudent.bloodGroup && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Blood Group: <span className="font-bold text-red-500">{selectedStudent.bloodGroup}</span>
                          </p>
                        )}
                      </>
                    )}

                    {cardCategory === 'staff' && selectedStaff && (
                      <>
                        <p className="text-xs font-semibold text-primary">
                          Role: {selectedStaff.designation || 'Faculty Member'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Dept: <strong className="text-slate-800 dark:text-slate-200">{selectedStaff.department || 'Academics'}</strong>
                        </p>
                        {selectedStaff.employeeId && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Emp ID: <strong className="font-mono">{selectedStaff.employeeId}</strong>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Bar with Barcode */}
                <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">
                      {cardCategory === 'student' ? 'Student ID' : 'Staff ID'}
                    </p>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {activePerson.customId || activePerson._id || activePerson.id || 'STU-2026-001'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold">Valid Until</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Mar 2027</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print ID Card
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Download className="h-4 w-4" /> Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
