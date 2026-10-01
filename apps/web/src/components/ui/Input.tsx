import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full h-11 bg-white border border-slate-200 rounded-[10px] px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 font-sans',
            'focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-150',
            'disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full bg-white border border-slate-200 rounded-[10px] px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-sans',
          'focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-150 resize-y min-h-[90px]',
          'disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed',
          error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: Array<{ value: string; label: string }>;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, children, disabled, ...props }, ref) => {
    return (
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full h-11 bg-white border border-slate-200 rounded-[10px] px-3.5 py-2 text-sm text-slate-900 font-sans',
          'focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-150 cursor-pointer',
          'disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed',
          error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
          className
        )}
        {...props}
      >
        {children
          ? children
          : options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                {opt.label}
              </option>
            ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-700 tracking-wide font-sans">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1 font-medium font-sans">{error}</p>}
    </div>
  );
}

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export function SearchInput({ className, value, ...props }: SearchInputProps) {
  return (
    <Input
      type="search"
      leftIcon={<Search className="w-4 h-4 text-slate-400" />}
      placeholder="Search incidents, locations, departments..."
      className={cn('bg-white border-slate-200 shadow-sm focus:border-blue-500', className)}
      value={value}
      {...props}
    />
  );
}

