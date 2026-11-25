<?php

namespace App\Http\Controllers;

use App\Models\Trader;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TraderController extends Controller
{
    public function index()
    {
        return Inertia::render('Traders/Index', ['traders' => Trader::withCount('vehicles')->latest()->paginate(15)]);
    }

    public function store(Request $request)
    {
        Trader::create($request->validate(['name' => ['required', 'string', 'max:150'], 'phone' => ['nullable', 'string', 'max:30'], 'email' => ['nullable', 'email', 'max:150'], 'opening_balance' => ['nullable', 'numeric']]));

        return back()->with('success', 'تمت إضافة التاجر بنجاح');
    }
}
