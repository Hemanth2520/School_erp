import type { ReactNode } from 'react';
import { Download, Upload, Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showExport?: boolean;
  showImport?: boolean;
  importEnabled?: boolean;
  exportEnabled?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  addEnabled?: boolean;
}

export function PageHeader({ title, description, actions, showExport = true, showImport = false, importEnabled = false, exportEnabled = false, onAdd, addLabel = 'Add New', addEnabled = false }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {showImport && (
          <button disabled={!importEnabled} title={importEnabled ? undefined : 'Import is not available for this page yet'} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <Upload className="h-4 w-4" /> Import
          </button>
        )}
        {showExport && (
          <button disabled={!exportEnabled} title={exportEnabled ? undefined : 'Export is not available for this page yet'} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <Download className="h-4 w-4" /> Export
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            disabled={!addEnabled}
            title={addEnabled ? undefined : 'This form is not available yet'}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {addLabel}
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
