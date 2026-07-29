import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  iconColor?: string;
  description?: string;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-primary', description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconColor === 'text-primary' ? 'bg-primary/10' : 'bg-muted')}>
          <Icon className={cn('h-4.5 w-4.5', iconColor)} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {(change || description) && (
          <p className="text-xs text-muted-foreground mt-1">
            {change && (
              <span className={cn('font-medium mr-1', changeType === 'positive' ? 'text-green-500' : changeType === 'negative' ? 'text-red-500' : '')}>
                {change}
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
