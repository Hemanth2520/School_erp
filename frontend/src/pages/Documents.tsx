import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { certificateTemplates } from '../data/mockData';
import { ExternalLink, Printer, FileBadge, Sparkles, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList } from '../hooks/useApi';

import transferPdf from '../documents/Transfer_Certificate_Sample.pdf';
import bonafidePdf from '../documents/Bonafide_Certificate_Sample.pdf';
import characterPdf from '../documents/Character_Certificate_Sample.pdf';
import meritPdf from '../documents/Merit_Certificate_Sample.pdf';

type Student = {
  _id?: string;
  id?: string;
  customId?: string;
  name: string;
  class: string;
  section?: string;
};

const pdfMap: Record<string, string> = {
  CT001: transferPdf,
  CT002: bonafidePdf,
  CT003: characterPdf,
  CT004: meritPdf,
};

export function Documents() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { data: studentsList = [] } = useApiList<Student>('students');

  const selectedStudent = studentsList.find(s => (s.customId || s._id || s.id) === selectedStudentId) || studentsList[0];

  const handleGeneratePDF = (templateId: string, templateName: string) => {
    const pdfUrl = pdfMap[templateId] || bonafidePdf;
    window.open(pdfUrl, '_blank');
    toast.success(`Opening ${templateName} PDF in a new tab...`);
  };

  const handlePrintDocument = (templateName: string) => {
    const sName = selectedStudent?.name || 'Aarav Sharma';
    const sClass = selectedStudent ? `${selectedStudent.class} ${selectedStudent.section || ''}` : '10th A';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${templateName} - ${sName}</title>
            <style>
              @page { size: A4 portrait; margin: 20mm; }
              body {
                font-family: 'Times New Roman', Times, serif;
                padding: 40px;
                border: 8px double #1e3a8a;
                margin: 0;
                color: #1e293b;
                background-color: #fff;
              }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { font-size: 28px; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
              .header p { font-size: 12px; color: #64748b; margin: 5px 0 0 0; }
              .title-box { text-align: center; margin: 30px 0; }
              .title-box h2 {
                font-size: 22px;
                display: inline-block;
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #0f172a;
              }
              .content { font-size: 16px; line-height: 2; text-align: justify; margin: 40px 20px; }
              .content strong { color: #0f172a; font-size: 17px; }
              .footer { margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 14px; font-weight: bold; }
              .seal-box {
                border: 2px dashed #94a3b8;
                width: 90px;
                height: 90px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #94a3b8;
                text-transform: uppercase;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SUNRISE INTERNATIONAL SCHOOL</h1>
              <p>Affiliated to CBSE Board | School Code: 411001 | Pune, Maharashtra</p>
            </div>
            
            <div class="title-box">
              <h2>${templateName}</h2>
            </div>

            <div class="content">
              This is to officially certify that <strong>${sName}</strong>, 
              enrolled in Class <strong>${sClass}</strong>, is a registered student of 
              Sunrise International School. During their academic tenure, their conduct, 
              academic performance, and discipline have been commendable.
            </div>

            <div style="margin-top: 50px;">
              <div class="seal-box">Official Seal</div>
            </div>

            <div class="footer">
              <div>
                <p>Issue Date: ${new Date().toLocaleDateString()}</p>
                <p>Place: Pune</p>
              </div>
              <div style="text-align: right;">
                <p style="margin-bottom: 40px;">________________________</p>
                <p>Principal Signature & Stamp</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate Documents Generator"
        description="Generate, view in new tab, and print official student certificates."
        showExport={false}
      />

      {/* Student Selection Header */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Select Student for Certificate</h3>
        </div>
        <div className="max-w-md">
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className={inputClass}
          >
            <option value="">
              -- Select Student from Directory ({studentsList.length} enrolled) --
            </option>
            {studentsList.map(s => {
              const id = s.customId || s._id || s.id;
              return (
                <option key={id} value={id}>
                  {s.name} — Class {s.class} {s.section || ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Certificate Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Certificate Templates</h2>
            <p className="text-xs text-muted-foreground">Select a template to view PDF in new tab or print</p>
          </div>
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> PDF Templates Connected
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {certificateTemplates.map(ct => (
            <div key={ct.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileBadge className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{ct.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{ct.description}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/50">
                <button
                  onClick={() => handleGeneratePDF(ct.id, ct.name)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium py-2 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Generate & View PDF (New Tab)
                </button>
                <button
                  onClick={() => handlePrintDocument(ct.name)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-background text-xs font-medium py-1.5 hover:bg-accent transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Document PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
