import { Form } from '@inertiajs/react';
import { FileImage, FileText, Paperclip } from 'lucide-react';
import { Button, Card, formatDate } from './UI';

type Attachment = { id: number; original_name: string; mime_type: string; size: number; created_at: string };

export default function ContainerAttachments({ containerId, attachments }: { containerId: number; attachments: Attachment[] }) {
    return <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5 dark:border-slate-700">
            <div><h2 className="font-black">مرفقات الحاوية</h2><p className="text-xs text-slate-500">صور أو ملفات PDF، بحد أقصى 10 MB للملف</p></div>
            <Form action={`/containers/${containerId}/attachments`} method="post" encType="multipart/form-data" resetOnSuccess className="flex flex-wrap items-center gap-2">{({ processing, errors }) => <>
                <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"><span className="flex items-center gap-2"><Paperclip size={17}/>اختيار ملف</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="sr-only"/></label>
                <Button disabled={processing}>{processing ? 'جارٍ الرفع...' : 'إرفاق'}</Button>
                {errors.file && <div className="w-full text-xs font-bold text-red-600">{errors.file}</div>}
            </>}</Form>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {attachments.map(file => <a key={file.id} href={`/containers/${containerId}/attachments/${file.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:bg-slate-800"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{file.mime_type === 'application/pdf' ? <FileText size={20}/> : <FileImage size={20}/>}</span><span className="min-w-0"><b className="block truncate text-sm">{file.original_name}</b><span className="text-xs text-slate-500">{formatDate(file.created_at)} · {(file.size / 1024 / 1024).toFixed(2)} MB</span></span></a>)}
            {!attachments.length && <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">لا توجد مرفقات بعد</div>}
        </div>
    </Card>;
}
