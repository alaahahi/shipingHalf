<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [...parent::share($request), 'branding' => [
            'logo_url' => function () {
                $logo = collect(Storage::disk('local')->files('branding'))->first(fn ($path) => str_starts_with(basename($path), 'logo.'));

                return $logo ? route('branding.logo').'?v='.filemtime(Storage::disk('local')->path($logo)) : null;
            },
        ], 'flash' => [
            'success' => fn () => $request->session()->get('success'),
        ]];
    }
}
