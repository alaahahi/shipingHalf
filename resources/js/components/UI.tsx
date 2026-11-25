import { PropsWithChildren } from 'react';
import { X } from 'lucide-react';
export const Button = ({ children, ...props }: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => <button {...props} className={`rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${props.className ?? ''}`}>{children}</button>;
export const Card = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 ${className}`}>{children}</div>;
function todayInBaghdad(): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Baghdad', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
}

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
    const automaticDate = props.type === 'date' && props.value === undefined && props.defaultValue === undefined
        ? todayInBaghdad()
        : props.defaultValue;
    return <input {...props} defaultValue={automaticDate} className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-900 ${props.className ?? ''}`}/>;
};
export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white ${props.className ?? ''}`}/>;
export const Field = ({ label, children }: PropsWithChildren<{ label: string }>) => <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>{children}</label>;
export function Modal({ open, onClose, title, children }: PropsWithChildren<{ open: boolean; onClose: () => void; title: string }>) { if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><Card className="max-h-[90vh] w-full max-w-2xl overflow-auto"><div><div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700"><h2 className="text-lg font-black">{title}</h2><button onClick={onClose}><X/></button></div>{children}</div></Card></div>; }
export const money = (value: string | number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2,
}).format(Number(value || 0));
export const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};
export const formatPhone = (value?: string | null) => value ? value.replace(/[\s().-]+/g, '') : '—';
