import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, LoaderCircle, Plus, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import SpreadsheetImport from '../../components/SpreadsheetImport';
import VehicleOwnerButton from '../../components/VehicleOwnerButton';
import { Button, Card, Field, Input, Modal, Select, money } from '../../components/UI';
import { Pagination, Trader, Vehicle } from '../../types';

type VinState = { status: 'idle' | 'checking' | 'available' | 'duplicate' | 'invalid' | 'error'; message?: string; existing?: { stock_no?: string; make?: string; model?: string; year?: number } };

export default function Vehicles({ vehicles, traders, filters }: { vehicles: Pagination<Vehicle>; traders: Trader[]; filters: { search?: string } }) {
    const [open, setOpen] = useState(false);
    const [vinState, setVinState] = useState<VinState>({ status: 'idle' });
    const form = useForm({ stock_no: '', vin: '', trader_id: '', make: '', model: '', year: '', color: '', purchase_price: '0' });

    useEffect(() => {
        const vin = form.data.vin;
        if (vin.length < 11) { setVinState({ status: 'idle' }); return; }
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setVinState({ status: 'checking', message: 'جارٍ فحص رقم VIN...' });
            try {
                const response = await fetch(`/api/vehicles/vin/${encodeURIComponent(vin)}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
                const result = await response.json();
                if (result.exists) {
                    setVinState({ status: 'duplicate', message: result.message, existing: result.vehicle });
                    return;
                }
                if (!response.ok || !result.valid) {
                    setVinState({ status: 'invalid', message: result.message ?? 'رقم VIN غير صالح.' });
                    return;
                }
                setVinState({ status: 'available', message: result.message });
                if (result.vehicle) {
                    if (!form.data.make && result.vehicle.make) form.setData('make', result.vehicle.make);
                    if (!form.data.model && result.vehicle.model) form.setData('model', result.vehicle.model);
                    if (!form.data.year && result.vehicle.year) form.setData('year', String(result.vehicle.year));
                }
            } catch (error) {
                if ((error as Error).name !== 'AbortError') setVinState({ status: 'error', message: 'تعذر فحص VIN الآن. حاول مرة أخرى.' });
            }
        }, 500);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [form.data.vin]);

    const close = () => { setOpen(false); form.reset(); form.clearErrors(); setVinState({ status: 'idle' }); };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (vinState.status === 'duplicate' || vinState.status === 'checking' || vinState.status === 'invalid') return;
        form.post('/vehicles', { onSuccess: close });
    };
    const updateVin = (value: string) => form.setData('vin', value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17));

    return <AppLayout title="السيارات" description={`${vehicles.total} سيارة مسجلة`} action={<div className="flex flex-wrap gap-2"><SpreadsheetImport endpoint="/vehicles/import" title="استيراد السيارات من Excel" columns="رقم المخزون، VIN، الماركة، الموديل، السنة، اللون، التاجر، سعر الشراء"/><Button onClick={() => setOpen(true)}><span className="flex items-center gap-2"><Plus size={17}/>إضافة سيارة</span></Button></div>}>
        <Card className="overflow-hidden"><div className="border-b p-4"><form onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get('search'); router.get('/vehicles', { search: value }, { preserveState: true }); }} className="relative max-w-md"><Input name="search" defaultValue={filters.search} placeholder="بحث برقم VIN أو المخزون أو الماركة..." className="pr-10"/><Search className="absolute right-3 top-3 text-slate-400" size={18}/></form></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{['المخزون','VIN','السيارة','التاجر','الحالة','سعر الشراء','التكلفة النهائية'].map(header => <th key={header} className="p-3 text-right">{header}</th>)}</tr></thead><tbody>{vehicles.data.map(vehicle => <tr key={vehicle.id} className="border-t hover:bg-slate-50"><td className="p-3 font-black text-indigo-600 dark:text-indigo-400">{vehicle.stock_no}</td><td className="p-3 font-mono text-xs">{vehicle.vin}</td><td className="p-3"><b>{vehicle.make} {vehicle.model}</b><div className="text-xs text-slate-400">{vehicle.year} · {vehicle.color}</div></td><td className="p-3"><VehicleOwnerButton vehicle={vehicle} traders={traders}/></td><td className="p-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">مشتراة</span></td><td className="p-3">{money(vehicle.purchase_price)}</td><td className="p-3 font-black">{money(vehicle.total_cost)}</td></tr>)}{!vehicles.data.length && <tr><td colSpan={7} className="p-12 text-center text-slate-400">لا توجد نتائج</td></tr>}</tbody></table></div></Card>
        <Modal open={open} onClose={close} title="إضافة سيارة جديدة"><form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="رقم المخزون"><Input value={form.data.stock_no} onChange={event => form.setData('stock_no', event.target.value)} required/>{form.errors.stock_no && <p className="mt-1 text-xs text-red-600">{form.errors.stock_no}</p>}</Field>
            <Field label="VIN"><div className="relative"><Input value={form.data.vin} onChange={event => updateVin(event.target.value)} className="pl-10 font-mono uppercase" dir="ltr" required/>{vinState.status === 'checking' && <LoaderCircle className="absolute left-3 top-3 animate-spin text-indigo-500" size={18}/>} {vinState.status === 'available' && <CheckCircle2 className="absolute left-3 top-3 text-emerald-600" size={18}/>} {(vinState.status === 'duplicate' || vinState.status === 'invalid' || vinState.status === 'error') && <AlertTriangle className="absolute left-3 top-3 text-red-600" size={18}/>}</div><div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>{form.data.vin.length} / 17</span><span>لا تستخدم I أو O أو Q</span></div></Field>
            {vinState.status !== 'idle' && <div className={`col-span-full rounded-xl border p-3 text-sm font-bold ${vinState.status === 'available' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : vinState.status === 'checking' ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'}`}>
                {vinState.message}{vinState.existing && <div className="mt-1 text-xs font-medium">السيارة الموجودة: {vinState.existing.stock_no} — {vinState.existing.make} {vinState.existing.model} {vinState.existing.year}</div>}
            </div>}
            <Field label="الماركة"><Input value={form.data.make} onChange={event => form.setData('make', event.target.value)} required/></Field><Field label="الموديل"><Input value={form.data.model} onChange={event => form.setData('model', event.target.value)} required/></Field><Field label="السنة"><Input value={form.data.year} onChange={event => form.setData('year', event.target.value)} type="number"/></Field><Field label="اللون"><Input value={form.data.color} onChange={event => form.setData('color', event.target.value)}/></Field><Field label="التاجر"><Select value={form.data.trader_id} onChange={event => form.setData('trader_id', event.target.value)}><option value="">بدون تاجر</option>{traders.map(trader => <option key={trader.id} value={trader.id}>{trader.name}</option>)}</Select></Field><Field label="سعر الشراء"><Input value={form.data.purchase_price} onChange={event => form.setData('purchase_price', event.target.value)} type="number" step="0.01" required/></Field>
            {Object.keys(form.errors).length > 0 && <div className="col-span-full rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">يرجى مراجعة الحقول المطلوبة والقيم المكررة.</div>}
            <div className="col-span-full flex justify-end border-t pt-4"><Button type="submit" disabled={form.processing || vinState.status === 'checking' || vinState.status === 'duplicate' || vinState.status === 'invalid'}>{form.processing ? 'جارٍ الحفظ...' : 'حفظ السيارة'}</Button></div>
        </form></Modal>
    </AppLayout>;
}
