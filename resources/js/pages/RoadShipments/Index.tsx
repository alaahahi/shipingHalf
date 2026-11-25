import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { Button, Card, Field, Input, Modal, money } from '../../components/UI';
import { Pagination } from '../../types';

type Shipment = { id:number; reference:string; carrier_name?:string; truck_plate?:string; driver_name:string; driver_phone:string; status:string; vehicles_count:number; expenses_sum_amount?:string; allocation_locked_at?:string };
export default function RoadShipments({ shipments }: { shipments: Pagination<Shipment> }) {
    const [open, setOpen] = useState(false);
    return <AppLayout title="النقل البري" description="إدارة الناقلات والسائقين وتوزيع التكلفة على 1–6 سيارات" action={<Button onClick={() => setOpen(true)}><span className="flex items-center gap-2"><Plus size={17}/>نقلة جديدة</span></Button>}>
        <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{['المرجع','الناقلة','السائق','الهاتف','السيارات','التكلفة','الحالة',''].map((x,i)=><th key={i} className="p-3 text-right">{x}</th>)}</tr></thead><tbody>{shipments.data.map(shipment => <tr key={shipment.id} className="border-t"><td className="p-3 font-black text-indigo-600 dark:text-indigo-400">{shipment.reference}</td><td className="p-3">{shipment.carrier_name ?? '—'}<div className="text-xs text-slate-400">{shipment.truck_plate}</div></td><td className="p-3">{shipment.driver_name}</td><td className="p-3" dir="ltr">{shipment.driver_phone}</td><td className="p-3"><b>{shipment.vehicles_count}</b> / 6</td><td className="p-3">{money(shipment.expenses_sum_amount ?? 0)}</td><td className="p-3">{shipment.allocation_locked_at ? 'معتمدة' : 'مسودة'}</td><td className="p-3"><Link href={`/road-shipments/${shipment.id}`} className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">فتح <ArrowLeft size={15}/></Link></td></tr>)}{!shipments.data.length && <tr><td colSpan={8} className="p-12 text-center text-slate-400">لا توجد نقلات بعد</td></tr>}</tbody></table></div></Card>
        <Modal open={open} onClose={() => setOpen(false)} title="إنشاء نقلة برية"><Form action="/road-shipments" method="post" className="grid gap-4 p-5 sm:grid-cols-2">{({ processing }) => <><Field label="رقم/مرجع النقلة"><Input name="reference" required/></Field><Field label="اسم الناقلة"><Input name="carrier_name"/></Field><Field label="رقم اللوحة"><Input name="truck_plate"/></Field><Field label="اسم السائق"><Input name="driver_name" required/></Field><Field label="رقم هاتف السائق"><Input name="driver_phone" required/></Field><Field label="تاريخ التحميل"><Input name="loaded_at" type="date"/></Field><div className="col-span-full flex justify-end border-t pt-4"><Button disabled={processing}>إنشاء النقلة</Button></div></>}</Form></Modal>
    </AppLayout>;
}
