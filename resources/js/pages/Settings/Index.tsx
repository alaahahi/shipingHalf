import { Form, router } from '@inertiajs/react';
import { DatabaseBackup, FileWarning, ImageUp, Play, Upload } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Button, Card } from '../../components/UI';

type Props = { migrationStatus?: string; errorLog?: string; logoUrl?: string | null };

export default function Settings({ migrationStatus, errorLog, logoUrl }: Props) {
    const runMigrations = () => {
        if (confirm('سيتم إنشاء Backup أولاً ثم تشغيل migrations. هل تريد المتابعة؟')) router.post('/settings/migrations');
    };

    return <AppLayout title="الإعدادات" description="الشعار وصيانة قاعدة البيانات وسجل الأخطاء">
        <div className="grid gap-5 xl:grid-cols-2">
            <Card className="p-5"><div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><ImageUp/></div><div><h2 className="font-black">شعار النظام</h2><p className="text-sm text-slate-500">PNG أو JPG أو WEBP، بحد أقصى 3 MB.</p></div></div>{logoUrl && <div className="mt-5 flex h-28 items-center justify-center rounded-2xl bg-slate-100 p-4 dark:bg-slate-800"><img src={logoUrl} className="max-h-full max-w-full object-contain"/></div>}<Form action="/settings/logo" method="post" encType="multipart/form-data" className="mt-5 flex flex-wrap items-center gap-3">{({ processing, errors }) => <><label className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-slate-700"><span className="flex items-center gap-2"><Upload size={17}/>اختيار الشعار</span><input name="logo" type="file" accept="image/png,image/jpeg,image/webp" required className="sr-only"/></label><Button disabled={processing}>رفع الشعار</Button>{errors.logo && <p className="w-full text-sm font-bold text-red-600">{errors.logo}</p>}</>}</Form></Card>
            <Card className="p-5"><div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><DatabaseBackup/></div><div><h2 className="font-black">تحديث قاعدة البيانات</h2><p className="text-sm leading-6 text-slate-500">ينشئ نسخة احتياطية تلقائياً ثم يشغّل migrations الجديدة فقط، دون حذف البيانات.</p></div></div><Button onClick={runMigrations} className="mt-5"><span className="flex items-center gap-2"><Play size={17}/>Backup وتشغيل Migrations</span></Button><pre className="mt-5 max-h-64 overflow-auto rounded-2xl bg-slate-950 p-4 text-left text-xs leading-6 text-slate-200" dir="ltr">{migrationStatus}</pre></Card>
        </div>
        <Card className="mt-5 overflow-hidden"><div className="flex items-center gap-3 border-b p-5 dark:border-slate-700"><div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-700"><FileWarning size={20}/></div><div><h2 className="font-black">سجل أخطاء Laravel</h2><p className="text-xs text-slate-500">آخر 250 سطراً من laravel.log</p></div></div><pre className="max-h-[520px] overflow-auto bg-slate-950 p-5 text-left text-xs leading-6 text-slate-200" dir="ltr">{errorLog}</pre></Card>
    </AppLayout>;
}
