<?php

namespace App\Http\Controllers;

use App\Models\Trader;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $vehicles = Vehicle::with('trader')->when($request->search, fn ($q, $search) => $q->where(fn ($q) => $q->where('vin', 'like', "%{$search}%")->orWhere('stock_no', 'like', "%{$search}%")->orWhere('make', 'like', "%{$search}%")))->latest()->paginate(15)->withQueryString();

        return Inertia::render('Vehicles/Index', ['vehicles' => $vehicles, 'traders' => Trader::orderBy('name')->get(['id', 'name']), 'filters' => $request->only('search')]);
    }

    public function store(Request $request)
    {
        $request->merge([
            'vin' => strtoupper(trim((string) $request->vin)),
            'stock_no' => trim((string) $request->stock_no),
        ]);
        $data = $request->validate([
            'stock_no' => ['required', 'string', 'max:50', 'unique:vehicles'], 'vin' => ['required', 'string', 'min:11', 'max:17', 'regex:/^[A-HJ-NPR-Z0-9]+$/', 'unique:vehicles'],
            'trader_id' => ['nullable', 'exists:traders,id'], 'make' => ['required', 'string', 'max:80'], 'model' => ['required', 'string', 'max:80'],
            'year' => ['nullable', 'integer', 'between:1900,2100'], 'color' => ['nullable', 'string', 'max:50'], 'purchase_price' => ['required', 'numeric', 'min:0'],
        ]);
        $data['trader_id'] ??= Trader::firstOrCreate(['name' => 'غير محدد'], ['opening_balance' => 0])->id;
        Vehicle::create($data);

        return back()->with('success', 'تمت إضافة السيارة بنجاح');
    }

    public function updateTrader(Request $request, Vehicle $vehicle)
    {
        $vehicle->update($request->validate(['trader_id' => ['required', 'exists:traders,id']]));

        return back()->with('success', 'تم تعديل صاحب السيارة.');
    }
}
