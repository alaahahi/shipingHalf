<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        Artisan::call('migrate:status', ['--no-ansi' => true]);

        return Inertia::render('Settings/Index', [
            'migrationStatus' => Artisan::output(),
            'errorLog' => $this->tail(storage_path('logs/laravel.log'), 250),
            'logoUrl' => $this->logoUrl(),
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $file = $request->validate(['logo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:3072']])['logo'];
        foreach (Storage::disk('local')->files('branding') as $oldFile) {
            Storage::disk('local')->delete($oldFile);
        }
        $file->storeAs('branding', 'logo.'.$file->extension());

        return back()->with('success', 'تم تحديث شعار النظام.');
    }

    public function runMigrations(Request $request)
    {
        $backupExit = Artisan::call('system:backup');
        abort_if($backupExit !== 0, 500, 'فشل إنشاء النسخة الاحتياطية. لم يتم تشغيل migrations.');
        $migrationExit = Artisan::call('migrate', ['--force' => true]);
        abort_if($migrationExit !== 0, 500, 'فشل تشغيل migrations.');

        return back()->with('success', 'تم إنشاء Backup وتشغيل migrations بنجاح.');
    }

    public function logo()
    {
        $path = $this->logoPath();
        abort_unless($path, 404);

        return response()->file(Storage::disk('local')->path($path), ['Cache-Control' => 'public, max-age=3600']);
    }

    private function logoPath(): ?string
    {
        return collect(Storage::disk('local')->files('branding'))->first(fn ($path) => str_starts_with(basename($path), 'logo.'));
    }

    private function logoUrl(): ?string
    {
        return $this->logoPath() ? route('branding.logo').'?v='.File::lastModified(Storage::disk('local')->path($this->logoPath())) : null;
    }

    private function tail(string $path, int $lines): string
    {
        if (! File::exists($path)) {
            return 'لا يوجد سجل أخطاء حتى الآن.';
        }
        $content = File::get($path);
        $rows = preg_split('/\R/', $content) ?: [];

        return implode(PHP_EOL, array_slice($rows, -$lines));
    }
}
