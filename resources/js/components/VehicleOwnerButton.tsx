import { Form } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Trader, Vehicle } from '../types';
import { Button, Field, Modal, Select } from './UI';

export default function VehicleOwnerButton({ vehicle, traders }: { vehicle: Vehicle; traders: Trader[] }) {
    const [open, setOpen] = useState(false);
    return <>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline dark:text-indigo-400">{vehicle.trader?.name ?? 'غير محدد'}<Pencil size={13}/></button>
        <Modal open={open} onClose={() => setOpen(false)} title="تعديل صاحب السيارة">
            <Form action={`/vehicles/${vehicle.id}/trader`} method="put" onSuccess={() => setOpen(false)} className="space-y-4 p-5">{({ processing }) => <>
                <Field label="التاجر / صاحب السيارة"><Select name="trader_id" defaultValue={vehicle.trader?.id} required>{traders.map(trader => <option key={trader.id} value={trader.id}>{trader.name}</option>)}</Select></Field>
                <div className="flex justify-end border-t pt-4"><Button disabled={processing}>حفظ صاحب السيارة</Button></div>
            </>}</Form>
        </Modal>
    </>;
}
