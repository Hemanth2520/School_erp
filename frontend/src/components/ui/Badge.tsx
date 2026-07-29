import React from 'react';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive dark:text-red-400',
        outline: 'border border-border text-foreground',
        success: 'bg-green-500/10 text-green-700 dark:text-green-400',
        warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Helper to auto-pick badge variant based on status string
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    Active: 'success',
    Approved: 'success',
    Completed: 'success',
    Paid: 'success',
    Present: 'success',
    Published: 'success',
    'In Stock': 'success',
    Available: 'success',
    Returned: 'secondary',
    Inactive: 'secondary',
    'On Leave': 'warning',
    Pending: 'warning',
    Scheduled: 'info',
    Upcoming: 'info',
    Interview: 'purple',
    Issued: 'info',
    Rejected: 'destructive',
    Failed: 'destructive',
    Overdue: 'destructive',
    'All Issued': 'destructive',
    Maintenance: 'warning',
    'Low Stock': 'warning',
    Full: 'destructive',
    Draft: 'secondary',
  };
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
}
