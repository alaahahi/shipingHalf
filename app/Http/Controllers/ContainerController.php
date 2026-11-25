<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\ContainerAttachment;
use App\Models\Vehicle;
use App\Services\CostAllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ContainerController extends Controller
{
    public function index()
    {
        return Inertia::render('Containers/Index', [
            'containers' => Inertia::scroll(fn () => Container::withCount('vehicles')->withSum('expenses', 'amount')->latest()->paginate(50)),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateExcelRow($request);
        DB::transaction(function () use ($data) {
            $container = Container::create([
                'sequence_no' => $data['sequence_no'] ?? ((int) Container::max('sequence_no') + 1),
                'container_no' => $data['container_no'], 'bill_of_lading' => $data['bill_of_lading'] ?? null,
                'arf_date' => $data['arf_date'] ?? null, 'shipping_agent' => $data['shipping_agent'] ?? null,
                'shipment_date' => $data['shipment_date'] ?? null, 'paid_amount' => $data['paid_amount'] ?? 0,
            ]);
            $this->syncExcelExpenses($container, $data);
        });

        return back()->with('success', 'تمت إضافة الحاوية بنجاح');
    }

    public function update(Request $request, Container $container)
    {
        abort_if($container->allocation_locked_at, 422, 'لا يمكن تعديل الحاوية بعد اعتماد التوزيع.');
        $data = $this->validateExcelRow($request, $container);
        DB::transaction(function () use ($container, $data) {
            $container->update([
                'sequence_no' => $data['sequence_no'], 'container_no' => $data['container_no'],
                'bill_of_lading' => $data['bill_of_lading'] ?? null, 'arf_date' => $data['arf_date'] ?? null,
                'shipping_agent' => $data['shipping_agent'] ?? null, 'shipment_date' => $data['shipment_date'] ?? null,
                'paid_amount' => $data['paid_amount'] ?? 0,
            ]);
            $this->syncExcelExpenses($container, $data);
        });

        return back()->with('success', 'تم تحديث معلومات الحاوية.');
    }

    public function show(Container $container)
    {
        $container->load(['vehicles.trader', 'expenses', 'allocations.vehicle', 'attachments' => fn ($query) => $query->latest()]);

        return Inertia::render('Containers/Show', [
            'container' => $container,
            'availableVehicles' => Vehicle::with('trader')->where(fn ($query) => $query->whereNull('container_id')->orWhere('container_id', $container->id))->orderBy('stock_no')->get(),
        ]);
    }

    public function attachVehicle(Request $request, Container $container)
    {
        abort_if($container->allocation_locked_at, 422, 'لا يمكن تعديل الحاوية بعد اعتماد التوزيع.');
        if ($container->vehicles()->count() >= 4) {
            return back()->withErrors(['vehicle_id' => 'الحاوية تستوعب 4 سيارات كحد أقصى.']);
        }
        $data = $request->validate(['vehicle_id' => ['required', 'exists:vehicles,id']]);
        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        if ($vehicle->container_id && $vehicle->container_id !== $container->id) {
            return back()->withErrors(['vehicle_id' => 'السيارة مرتبطة بحاوية أخرى.']);
        }
        $vehicle->update(['container_id' => $container->id, 'status' => 'in_container']);

        return back()->with('success', 'تمت إضافة السيارة إلى الحاوية.');
    }

    public function detachVehicle(Container $container, Vehicle $vehicle)
    {
        abort_if($container->allocation_locked_at, 422, 'لا يمكن تعديل الحاوية بعد اعتماد التوزيع.');
        abort_unless($vehicle->container_id === $container->id, 404);
        $vehicle->update(['container_id' => null, 'status' => 'purchased']);

        return back()->with('success', 'تم إخراج السيارة من الحاوية.');
    }

    public function addExpense(Request $request, Container $container)
    {
        abort_if($container->allocation_locked_at, 422, 'لا يمكن إضافة مصروف بعد اعتماد التوزيع.');
        $container->expenses()->create($request->validate([
            'category' => ['required', 'string', 'max:80'], 'description' => ['nullable', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:0.01'], 'expense_date' => ['required', 'date'],
        ]) + ['currency' => $container->currency]);

        return back()->with('success', 'تمت إضافة مصروف الحاوية.');
    }

    public function addAttachment(Request $request, Container $container)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);
        $file = $data['file'];
        $container->attachments()->create([
            'original_name' => $file->getClientOriginalName(),
            'path' => $file->store('container-attachments/'.$container->id),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
        ]);

        return back()->with('success', 'تم إرفاق الملف بالحاوية.');
    }

    public function downloadAttachment(Container $container, ContainerAttachment $attachment)
    {
        abort_unless($attachment->container_id === $container->id, 404);
        abort_unless(Storage::disk('local')->exists($attachment->path), 404);

        return Storage::disk('local')->download($attachment->path, $attachment->original_name);
    }

    public function allocate(Container $container, CostAllocationService $service)
    {
        $service->lock($container);

        return back()->with('success', 'تم توزيع المصاريف واعتمادها بنجاح.');
    }

    private function validateExcelRow(Request $request, ?Container $container = null): array
    {
        $uniqueContainer = 'unique:containers,container_no'.($container ? ','.$container->id : '');
        $uniqueSequence = 'unique:containers,sequence_no'.($container ? ','.$container->id : '');

        return $request->validate([
            'sequence_no' => [$container ? 'required' : 'nullable', 'integer', 'min:1', $uniqueSequence],
            'shipment_date' => ['nullable', 'date'], 'shipping_agent' => ['nullable', 'string', 'max:100'],
            'bill_of_lading' => ['nullable', 'string', 'max:80'], 'container_no' => ['required', 'string', 'max:50', $uniqueContainer],
            'arf_date' => ['nullable', 'date'], 'agent_fee' => ['nullable', 'numeric', 'min:0'],
            'mip' => ['nullable', 'numeric', 'min:0'], 'demurrage' => ['nullable', 'numeric', 'min:0'],
            'depot' => ['nullable', 'numeric', 'min:0'], 'commission' => ['nullable', 'numeric', 'min:0'],
            'customs' => ['nullable', 'numeric', 'min:0'], 'paid_amount' => ['nullable', 'numeric', 'min:0'],
        ]);
    }

    private function syncExcelExpenses(Container $container, array $data): void
    {
        $labels = [
            'agent' => 'agent_fee', 'mip' => 'mip', 'demurrage' => 'demurrage',
            'depot' => 'depot', 'commission' => 'commission', 'customs' => 'customs',
        ];
        $container->expenses()->whereIn('category', array_keys($labels))->delete();
        foreach ($labels as $category => $field) {
            $amount = (float) ($data[$field] ?? 0);
            if ($amount > 0) {
                $container->expenses()->create([
                    'category' => $category, 'amount' => $amount, 'currency' => $container->currency ?: 'USD',
                    'expense_date' => $data['shipment_date'] ?? now()->toDateString(), 'payment_status' => 'unpaid',
                ]);
            }
        }
    }
}
