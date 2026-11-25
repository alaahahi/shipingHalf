import { Check, ChevronLeft, ChevronRight, CircleHelp, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type Step = { title: string; text: string; tip?: string };

const guides: Record<string, Step[]> = {
    dashboard: [
        { title: 'مرحباً بك في هاف أوتو', text: 'هذه الصفحة تعطيك ملخصاً سريعاً عن السيارات والحاويات والتجار وتكلفة المخزون.' },
        { title: 'بطاقات الملخص', text: 'الأرقام في الأعلى تتحدث تلقائياً عند إضافة السيارات والحاويات والمصاريف.' },
        { title: 'آخر السيارات', text: 'من الجدول السفلي يمكنك متابعة أحدث السيارات المسجلة وتكلفتها الحالية.' },
    ],
    vehicles: [
        { title: 'إدارة السيارات', text: 'هنا تجد كل السيارات مع VIN والتاجر وسعر الشراء والتكلفة النهائية.' },
        { title: 'إضافة سيارة', text: 'اضغط «إضافة سيارة» وأدخل رقم المخزون وVIN والماركة والموديل وسعر الشراء.', tip: 'يجب ألا يتكرر رقم VIN أو رقم المخزون.' },
        { title: 'البحث السريع', text: 'ابحث باستخدام VIN أو رقم المخزون أو اسم الماركة.' },
    ],
    traders: [
        { title: 'إدارة التجار', text: 'هذه الصفحة تجمع التجار وعدد سيارات كل تاجر ورصيده الافتتاحي.' },
        { title: 'إضافة تاجر', text: 'اضغط «إضافة تاجر»، ثم أدخل الاسم والهاتف. البريد الإلكتروني اختياري.' },
        { title: 'ربط السيارات', text: 'عند إضافة أو تعديل سيارة اختر التاجر، وستظهر السيارة تلقائياً ضمن حسابه.' },
    ],
    containers: [
        { title: 'إدارة الحاويات', text: 'أنشئ الحاوية أولاً باستخدام رقم الحاوية وBL وARF ووكيل الشحن.' },
        { title: 'فتح الحاوية', text: 'اضغط «فتح» لإضافة السيارات والمصاريف ومراجعة التوزيع.' },
        { title: 'حد الحمولة', text: 'كل حاوية تقبل من سيارة واحدة إلى أربع سيارات فقط.' },
    ],
    container: [
        { title: 'الخطوة 1: إضافة السيارات', text: 'اختر السيارات من القائمة وأضفها إلى الحاوية. يمكن أن تكون لتاجر واحد أو لتجار مختلفين.' },
        { title: 'الخطوة 2: تسجيل المصاريف', text: 'أضف أجور الوكيل وMIP وDemurrage والمخزن والعمولة والجمارك.' },
        { title: 'الخطوة 3: مراجعة الحصص', text: 'يعرض النظام حصة تقريبية لكل سيارة فوراً قبل الاعتماد.' },
        { title: 'الخطوة 4: اعتماد التوزيع', text: 'بعد التأكد اضغط «اعتماد التوزيع». سيحفظ النظام الحصص ويقفل الحاوية.', tip: 'بعد الاعتماد لا يمكن تغيير السيارات أو المصاريف حفاظاً على صحة الحسابات.' },
    ],
    roadShipments: [
        { title: 'النقل البري', text: 'أنشئ نقلة جديدة وأدخل اسم السائق ورقم الهاتف والناقلة واللوحة.' },
        { title: 'فتح النقلة', text: 'بعد الإنشاء افتح النقلة لتحميل السيارات وإضافة الأجرة والغرامات.' },
        { title: 'حد الحمولة', text: 'كل ناقلة تقبل من سيارة واحدة إلى ست سيارات فقط.' },
    ],
    roadShipment: [
        { title: 'الخطوة 1: تحميل السيارات', text: 'اختر السيارات المحملة على الناقلة، بحد أقصى ست سيارات.' },
        { title: 'الخطوة 2: إضافة التكاليف', text: 'سجل أجرة النقل والغرامة المشتركة وأي مصروف إضافي.' },
        { title: 'الخطوة 3: مراجعة الحصة', text: 'راجع حصة كل سيارة من المجموع قبل الاعتماد.' },
        { title: 'الخطوة 4: اعتماد النقلة', text: 'اضغط «اعتماد التوزيع» لقفل النقلة وإضافة التكلفة إلى السيارات.' },
    ],
};

function pageKey(url: string): string | null {
    const path = url.split('?')[0];
    if (path === '/') return 'dashboard';
    if (path === '/vehicles') return 'vehicles';
    if (path === '/traders') return 'traders';
    if (path === '/containers') return 'containers';
    if (/^\/containers\/\d+$/.test(path)) return 'container';
    if (path === '/road-shipments') return 'roadShipments';
    if (/^\/road-shipments\/\d+$/.test(path)) return 'roadShipment';
    return null;
}

export default function PageGuide({ url }: { url: string }) {
    const key = useMemo(() => pageKey(url), [url]);
    const steps = key ? guides[key] : undefined;
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    if (!key || !steps) return null;
    const finish = () => setOpen(false);
    const restart = () => { setStep(0); setOpen(true); };
    const current = steps[step];

    return <>
        <button type="button" onClick={restart} className="fixed bottom-5 left-5 z-30 flex size-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:scale-105 hover:bg-indigo-700" title="شرح هذه الصفحة" aria-label="شرح هذه الصفحة"><CircleHelp size={24}/></button>
        {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div>
                <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 font-black text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{step + 1}</div><button onClick={finish} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="إغلاق"><X size={20}/></button></div>
                    <div className="mt-5 text-xs font-bold text-indigo-600 dark:text-indigo-400">الخطوة {step + 1} من {steps.length}</div>
                    <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">{current.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{current.text}</p>
                    {current.tip && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">ملاحظة: {current.tip}</div>}
                    <div className="mt-7 flex items-center justify-between gap-3">
                        <button onClick={finish} className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">تخطي الشرح</button>
                        <div className="flex gap-2">{step > 0 && <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-slate-700"><ChevronRight size={17}/>السابق</button>}{step < steps.length - 1 ? <button onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">التالي <ChevronLeft size={17}/></button> : <button onClick={finish} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Check size={17}/>فهمت</button>}</div>
                    </div>
                </div>
            </div>
        </div>}
    </>;
}
