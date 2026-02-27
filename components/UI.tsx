import React from 'react';
import { Activity, Inbox, ClipboardCheck, CheckCircle, AlertOctagon, FileText } from 'lucide-react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Card = ({ children, className = "", onClick, disabled = false }: CardProps) => (
  <div 
    onClick={!disabled ? onClick : undefined} 
    className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all 
    ${!disabled && onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-400' : ''} 
    ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''} 
    ${className}`}
  >
    {children}
  </div>
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | (() => void) | any;
  className?: string;
  disabled?: boolean;
}

export const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, size = 'md', ...props }: ButtonProps) => {
  const baseStyle = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:text-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-slate-300 disabled:text-slate-300",
    ghost: "text-slate-500 hover:bg-slate-100 disabled:opacity-50"
  };
  return <button onClick={onClick} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled} {...props}>{children}</button>;
};

export const getStatusColor = (status: string) => {
  if (!status) return { bg: 'bg-slate-100', text: 'text-slate-600', icon: <FileText size={16}/> };
  if (status === 'INICJACJA') return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Activity size={16}/> };
  if (status.includes('DO_WERYFIKACJI')) return { bg: 'bg-orange-100', text: 'text-orange-800', icon: <Inbox size={16}/> };
  if (status === 'OCZEKUJE_NA_ZWOLNIENIE') return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ClipboardCheck size={16}/> };
  if (status === 'ZWOLNIONY_DO_PRODUKCJI') return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={16}/> };
  if (status.includes('NOK') || status.includes('DECYZJI') || status.includes('ZABLOKOWANY')) return { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertOctagon size={16}/> };
  return { bg: 'bg-slate-100', text: 'text-slate-600', icon: <FileText size={16}/> };
};

export const StatusBadge = ({ status }: { status: string }) => {
  const style = getStatusColor(status);
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
      {style.icon} {status ? status.replace(/_/g, ' ') : 'N/A'}
    </span>
  );
};