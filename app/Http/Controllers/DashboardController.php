<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\Trader;
use App\Models\Vehicle;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'vehicles' => Vehicle::count(),
                'containers' => Container::whereNotIn('status', ['closed'])->count(),
                'traders' => Trader::count(),
                'inventoryCost' => Vehicle::all()->sum(fn ($vehicle) => (float) $vehicle->total_cost),
            ],
            'recentVehicles' => Vehicle::with('trader')->latest()->limit(6)->get(),
        ]);
    }
}
