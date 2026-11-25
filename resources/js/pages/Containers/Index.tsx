import { Form, InfiniteScroll, Link } from '@inertiajs/react';
import { ArrowLeft, Container as ContainerIcon, LayoutGrid, List, LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import SpreadsheetImport from '../../components/SpreadsheetImport';
import { Button, Card, Field, Input, Modal, money } from '../../components/UI';
import { Pagination } from '../../types';

type ContainerRow = { id:number; sequence_no?:number; shipment_date?:string; container_no:string; bill_of_lading?:string; arf_date?:string; shipping_agent?:string; paid_amount?:string; vehicles_count:number; expenses_sum_amount?:string; allocation_locked_at?:string };

const ExcelFields = () => <>
    <Field label="التاريخ / TARİH"><Input name="shipment_date" type="date"/></Field>
    <Field label="الوكيل / ACENTA"><Input name="shipping_agent"/></Field>
    <Field label="رقم BL"><Input name="bill_of_lading"/></Field>
    <Field label="رقم الحاوية"><Input name="container_no" required/></Field>
    <Field label="تاريخ ARF"><Input name="arf_date" type="date"/></Field><div className="hidden sm:block"/>
    <Field label="أجور الوكيل / ACENTA"><Input name="agent_fee" type="number" step="0.01" min="0" defaultValue="0"/></Field>
    <Field label="MIP"><Input name="mip" type="number" step="0.01" min="0" defaultValue="0"/></Field>
    <Field label="Demurrage"><Input name="demurrage" type="number" step="0.01" min="0" defaultValue="0"/></Field>
    <Field label="المخزن / DEPO"><Input name="depot" type="number" step="0.01" min="0" defaultValue="0"/></Field>
    <Field label="العمولة / KOMİSYON"><Input name="commission" type="number" step="0.01" min="0" defaultValue="0"/></Field>
    <Field label="مصروف الجمارك"><Input name="customs" type="number" step="0.01" min="0" defaultValue="0"/></Field>
    <Field label="المدفوع / ÖDENEN"><Input name="paid_amount" type="number" step="0.01" min="0" defaultValue="0"/></Field>
</>;

export default function Containers({ containers }: { containers: Pagination<ContainerRow> }) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'grid'|'list'>(() => (localStorage.getItem('containers:view') as 'grid'|'list') || 'list');
    const changeView = (next:'grid'|'list') => { setView(next); localStorage.setItem('containers:view', next); };
    return <AppLayout title="الحاويات" description="بنفس حقول ملف Excel مع توزيع المصاريف على 1–4 سيارات" action={<div className="flex flex-wrap gap-2"><SpreadsheetImport endpoint="/containers/import" title="استيراد الحاويات من Excel" columns="التاريخ، الوكيل، BL، رقم الحاوية، تاريخ ARF، أجور الوكيل، MIP، Demurrage، المخزن، العمولة، الجمارك، المدفوع"/><div className="flex rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"><button onClick={()=>changeView('grid')} title="بطاقات" className={`rounded-lg p-2 ${view==='grid'?'bg-indigo-600 text-white':'text-slate-500'}`}><LayoutGrid size={18}/></button><button onClick={()=>changeView('list')} title="قائمة" className={`rounded-lg p-2 ${view==='list'?'bg-indigo-600 text-white':'text-slate-500'}`}><List size={18}/></button></div><Button onClick={()=>setOpen(true)}><span className="flex items-center gap-2"><Plus size={17}/>إضافة حاوية</span></Button></div>}>
        <InfiniteScroll data="containers" onlyNext preserveUrl={false} buffer={300} loading={<div className="flex items-center justify-center gap-2 py-6 text-sm font-bold text-indigo-600"><LoaderCircle className="animate-spin" size={20}/>جارٍ تحميل المزيد...</div>}>
        {view === 'list' ? <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1200px] text-center text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{['تسلسل','التاريخ','الوكيل','BL','رقم الحاوية','تاريخ ARF','السيارات','المصاريف','المدفوع','المتبقي',''].map((h,i)=><th key={i} className="p-3 text-center">{h}</th>)}</tr></thead><tbody>{containers.data.map(c=>{const total=Number(c.expenses_sum_amount??0), paid=Number(c.paid_amount??0); return <tr key={c.id} className="border-t"><td className="p-3">{c.sequence_no??'—'}</td><td className="p-3">{c.shipment_date??'—'}</td><td className="p-3">{c.shipping_agent??'—'}</td><td className="p-3">{c.bill_of_lading??'—'}</td><td className="p-3 font-black text-indigo-600 dark:text-indigo-400">{c.container_no}</td><td className="p-3">{c.arf_date??'—'}</td><td className="p-3">{c.vehicles_count} / 4</td><td className="p-3">{money(total)}</td><td className="p-3 text-emerald-600">{money(paid)}</td><td className="p-3 font-black text-amber-600">{money(total-paid)}</td><td className="p-3"><Link href={`/containers/${c.id}`} className="flex items-center justify-center gap-1 font-bold text-indigo-600">فتح <ArrowLeft size={15}/></Link></td></tr>})}</tbody></table></div></Card> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{containers.data.map(c=>{const total=Number(c.expenses_sum_amount??0), paid=Number(c.paid_amount??0); return <Card key={c.id} className="p-5"><div className="flex items-start justify-between"><div className="flex gap-3"><div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><ContainerIcon size={25}/></div><div><h2 className="font-black">{c.container_no}</h2><p className="text-xs text-slate-500">{c.shipping_agent??'بدون وكيل'}</p></div></div><span className="text-xs font-bold text-slate-500">#{c.sequence_no??'—'}</span></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span className="text-xs text-slate-500">المصاريف</span><b className="block">{money(total)}</b></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><span className="text-xs text-slate-500">المتبقي</span><b className="block text-amber-600">{money(total-paid)}</b></div><div><span className="text-xs text-slate-500">BL</span><b className="block">{c.bill_of_lading??'—'}</b></div><div><span className="text-xs text-slate-500">تاريخ ARF</span><b className="block">{c.arf_date??'—'}</b></div></div><Link href={`/containers/${c.id}`} className="mt-5 flex justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-bold text-indigo-700 dark:border-indigo-800 dark:text-indigo-300">فتح الحاوية <ArrowLeft size={16}/></Link></Card>})}{!containers.data.length&&<Card className="col-span-full p-12 text-center text-slate-400"><ContainerIcon className="mx-auto mb-3" size={40}/>لا توجد حاويات</Card>}</div>}
        </InfiniteScroll>
        <Modal open={open} onClose={()=>setOpen(false)} title="إضافة حاوية — نفس تنسيق Excel"><Form action="/containers" method="post" onSuccess={()=>setOpen(false)} className="grid gap-4 p-5 sm:grid-cols-2">{({processing})=><><ExcelFields/><div className="col-span-full flex justify-end border-t pt-4"><Button disabled={processing}>حفظ الحاوية</Button></div></>}</Form></Modal>
    </AppLayout>;
}
