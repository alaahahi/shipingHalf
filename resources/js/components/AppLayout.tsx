import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Boxes, Car, ChevronDown, CircleDollarSign, Container, FileBarChart, Gauge, Menu, Moon, PackageOpen, ReceiptText, Settings, ShoppingCart, Sun, Truck, Users, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import PageGuide from './PageGuide';
import { useLocale } from './Locale';

const primaryItems = [
    ['الرئيسية', '/', Gauge], ['المشتريات', '/purchases', PackageOpen], ['المبيعات', '/sales', ShoppingCart],
    ['السيارات', '/vehicles', Car], ['التجار', '/traders', Users], ['الحاويات', '/containers', Container],
] as const;
const moreItems = [
    ['النقل البري', '/road-shipments', Truck], ['المصاريف والغرامات', '/expenses', ReceiptText],
    ['المحاسبة', '/accounting', CircleDollarSign], ['دفتر الحسابات', '/ledger', BookOpen],
    ['التقارير', '/reports', FileBarChart], ['الإعدادات', '/settings', Settings],
] as const;
type NavItem = (typeof primaryItems)[number] | (typeof moreItems)[number];

export default function AppLayout({ children, title, description, action }: PropsWithChildren<{ title: string; description?: string; action?: React.ReactNode }>) {
    const { url, props } = usePage<{ flash?: { success?: string }; branding?: { logo_url?: string | null } }>();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    const menuRef = useRef<HTMLDivElement>(null);
    const { locale, setLocale } = useLocale();

    useEffect(() => {
        const close = (event: MouseEvent) => !menuRef.current?.contains(event.target as Node) && setMoreOpen(false);
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const toggleDark = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };
    const active = (href: string) => href === '/' ? url === '/' : url.startsWith(href);
    const navLink = ([label, href, Icon]: NavItem, mobile = false) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={clsx(
        'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition', mobile && 'w-full',
        active(href) ? 'bg-indigo-600 text-white shadow-sm dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    )}><Icon size={17}/><span>{label}</span></Link>;

    return <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-[#0b1220] dark:text-slate-100">
        <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
                <div className="flex min-w-0 items-center gap-4">
                    <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3 rounded-2xl px-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                        <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-white shadow-sm">{props.branding?.logo_url ? <img src={props.branding.logo_url} alt="شعار هاف أوتو" className="size-full object-contain"/> : <Boxes size={23}/>}</div>
                        <div className="hidden leading-tight sm:block"><div className="font-black text-slate-950 dark:text-white">هاف أوتو</div><div className="text-[11px] text-slate-500 dark:text-slate-400">إدارة السيارات والشحن</div></div>
                    </Link>
                    <div className="hidden items-center gap-1 lg:flex">
                        {primaryItems.map(item => navLink(item))}
                        <div ref={menuRef} className="relative">
                            <button onClick={() => setMoreOpen(!moreOpen)} className={clsx('inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition', moreItems.some(([, href]) => active(href)) ? 'bg-indigo-600 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}>
                                المزيد <ChevronDown size={16} className={moreOpen ? 'rotate-180 transition' : 'transition'}/>
                            </button>
                            {moreOpen && <div className="absolute left-0 top-12 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">{moreItems.map(item => navLink(item, true))}</div>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className="flex h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-indigo-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800" title={locale === 'ar' ? 'English' : 'العربية'}>{locale === 'ar' ? 'EN' : 'AR'}</button>
                    <button type="button" onClick={toggleDark} title={dark ? 'الوضع النهاري' : 'الوضع الليلي'} className="flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800">{dark ? <Sun size={20}/> : <Moon size={20}/>}</button>
                    <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-900">
                        <span className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">م</span>
                        <div className="leading-tight"><div className="text-sm font-bold">مدير النظام</div><div className="text-[11px] text-slate-500 dark:text-slate-400">الإدارة</div></div>
                    </div>
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{mobileOpen ? <X/> : <Menu/>}</button>
                </div>
            </div>
            {mobileOpen && <div className="border-t border-slate-200 bg-white p-4 lg:hidden dark:border-slate-800 dark:bg-slate-900"><div className="grid gap-2 sm:grid-cols-2">{[...primaryItems, ...moreItems].map(item => navLink(item, true))}</div></div>}
        </nav>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {props.flash?.success && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">{props.flash.success}</div>}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h1>{description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}</div>{action}</div>
            {children}
        </main>
        <PageGuide url={url}/>
    </div>;
}
