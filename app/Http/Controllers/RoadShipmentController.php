<?php

namespace App\Http\Controllers;

use App\Models\RoadShipment;
use App\Models\Vehicle;
use App\Services\CostAllocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoadShipmentController extends Controller
{
    public function index()
    {
        return Inertia::render('RoadShipments/Index', [
            'shipments' => RoadShipment::withCount('vehicles')->withSum('expenses', 'amount')->latest()->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $shipment = RoadShipment::create($request->validate([
            'reference' => ['required', 'string', 'max:60', 'unique:road_shipments'],
            'carrier_name' => ['nullable', 'string', 'max:120'], 'truck_plate' => ['nullable', 'string', 'max:40'],
            'driver_name' => ['required', 'string', 'max:120'], 'driver_phone' => ['required', 'string', 'max:40'],
            'loaded_at' => ['nullable', 'date'],
        ]));

        return redirect()->route('road-shipments.show', $shipment)->with('success', 'تم إنشاء النقلة البرية.');
    }

    public function show(RoadShipment $roadShipment)
    {
        $roadShipment->load(['vehicles.trader', 'expenses', 'allocations.vehicle']);

        return Inertia::render('RoadShipments/Show', [
            'shipment' => $roadShipment,
            'availableVehicles' => Vehicle::with('trader')->where(fn ($query) => $query->whereNull('road_shipment_id')->orWhere('road_shipment_id', $roadShipment->id))->orderBy('stock_no')->get(),
        ]);
    }

    public function attachVehicle(Request $request, RoadShipment $roadShipment)
    {
        abort_if($roadShipment->allocation_locked_at, 422, 'لا يمكن تعديل النقلة بعد اعتماد التوزيع.');
        if ($roadShipment->vehicles()->count() >= 6) {
            return back()->withErrors(['vehicle_id' => 'الناقلة تستوعب 6 سيارات كحد أقصى.']);
        }
        $data = $request->validate(['vehicle_id' => ['required', 'exists:vehicles,id']]);
        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        if ($vehicle->road_shipment_id && $vehicle->road_shipment_id !== $roadShipment->id) {
            return back()->withErrors(['vehicle_id' => 'السيارة مرتبطة بنقلة أخرى.']);
        }
        $vehicle->update(['road_shipment_id' => $roadShipment->id, 'status' => 'road_transport']);

        return back()->with('success', 'تم تحميل السيارة على الناقلة.');
    }

    public function detachVehicle(RoadShipment $roadShipment, Vehicle $vehicle)
    {
        abort_if($roadShipment->allocation_locked_at, 422, 'لا يمكن تعديل النقلة بعد اعتماد التوزيع.');
        abort_unless($vehicle->road_shipment_id === $roadShipment->id, 404);
        $vehicle->update(['road_shipment_id' => null, 'status' => 'port_arrived']);

        return back()->with('success', 'تم إخراج السيارة من الناقلة.');
    }

    public function addExpense(Request $request, RoadShipment $roadShipment)
    {
        abort_if($roadShipment->allocation_locked_at, 422, 'لا يمكن إضافة مصروف بعد اعتماد التوزيع.');
        $roadShipment->expenses()->create($request->validate([
            'category' => ['required', 'string', 'max:80'], 'description' => ['nullable', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:0.01'], 'expense_date' => ['required', 'date'], 'is_penalty' => ['nullable', 'boolean'],
        ]) + ['currency' => $roadShipment->currency]);

        return back()->with('success', 'تمت إضافة تكلفة النقلة.');
    }

    public function allocate(RoadShipment $roadShipment, CostAllocationService $service)
    {
        $service->lock($roadShipment);

        return back()->with('success', 'تم توزيع تكلفة النقل واعتمادها بنجاح.');
    }
}
