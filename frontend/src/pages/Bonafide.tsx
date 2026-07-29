import { PageHeader } from '../components/ui/PageHeader';
import { students } from '../data/mockData';
import { Download, Printer, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export function Bonafide() {
  return (
    <div>
      <PageHeader title="Bonafide Certificate" description="Generate bonafide certificates for students." showExport={false} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Certificate Details</h3>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Student Name *</label>
            <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} — Class {s.class}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Purpose *</label>
            <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>Bank Account Opening</option>
              <option>Passport Application</option>
              <option>Scholarship Application</option>
              <option>Visa Application</option>
              <option>Other Purpose</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Date of Issue</label>
            <input type="date" defaultValue="2024-06-10" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={() => toast.success('Bonafide Certificate generated!')} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            <FileText className="h-4 w-4" /> Generate Certificate
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Preview</h3>
          <div className="border border-border rounded-lg p-6 font-serif text-sm space-y-4 bg-white dark:bg-gray-900 max-w-sm mx-auto">
            <div className="text-center border-b border-gray-300 pb-4">
              <p className="font-bold text-base">SUNRISE INTERNATIONAL SCHOOL</p>
              <p className="text-xs text-gray-500">Affiliated to CBSE | School No. 12345</p>
              <p className="text-xs text-gray-500">123 Education Road, Pune - 411001</p>
            </div>
            <p className="font-bold text-center uppercase tracking-wider text-sm underline">Bonafide Certificate</p>
            <p className="leading-relaxed text-xs text-gray-700 dark:text-gray-300">
              This is to certify that <strong>Aarav Sharma</strong>, son/daughter of <strong>Ramesh Sharma</strong>, is a bonafide student of this school studying in <strong>Class 10th, Section A</strong> for the academic year <strong>2024–25</strong>.
            </p>
            <p className="leading-relaxed text-xs text-gray-700 dark:text-gray-300">
              This certificate is issued for the purpose of <strong>Bank Account Opening</strong> as per parent's request.
            </p>
            <div className="flex justify-between mt-8 text-xs">
              <div>
                <p>Date: 10/06/2024</p>
              </div>
              <div className="text-right">
                <p className="mt-6">___________________</p>
                <p>Principal's Signature</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            <button onClick={() => toast.success('Printing...')} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button onClick={() => toast.success('Downloaded!')} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent transition-colors">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
