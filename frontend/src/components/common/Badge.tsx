import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  colorClass: string;
  dot?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, colorClass, dot, className }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      colorClass,
      className
    )}
  >
    {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} aria-hidden="true" />}
    {label}
  </span>
);
