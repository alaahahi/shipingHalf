import { Form } from '@inertiajs/react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button, Modal } from './UI';

export default function SpreadsheetImport({ endpoint, title, columns }: { endpoint: string; title: string; columns: string }) {
    const [open, setOpen] = useState(false);
    return <>
        <Button type="button" onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600"><span className="flex items-center gap-2"><FileSpreadsheet size={17}/>استيراد Excel</span></Button>
        <Modal open={open} onClose={() => setOpen(false)} title={title}>
            <Form action={endpoint} method="post" encType="multipart/form-data" onSuccess={() => setOpen(false)} className="space-y-4 p-5">{({ processing, errors }) => <>
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 dark:bg-slate-800"><b className="block">أعمدة الصف الأول:</b>{columns}<div className="mt-1 text-xs text-slate-500">يدعم XLSX وCSV حتى 10 MB. الصفوف المكررة أو غير الصالحة يتم تجاوزها.</div></div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-indigo-500 dark:border-slate-700"><Upload className="mb-3 text-indigo-600"/><b>اختر ملف Excel</b><span className="mt-1 text-xs text-slate-500">XLSX أو CSV</span><input name="file" type="file" accept=".xlsx,.csv" required className="sr-only"/></label>
                {errors.file && <div className="text-sm font-bold text-red-600">{errors.file}</div>}
                <div className="flex justify-end border-t pt-4"><Button disabled={processing}>{processing ? 'جارٍ الاستيراد...' : 'بدء الاستيراد'}</Button></div>
            </>}</Form>
        </Modal>
    </>;
}
