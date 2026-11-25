<?php

use App\Http\Controllers\ContainerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoadShipmentController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SpreadsheetImportController;
use App\Http\Controllers\TraderController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VehicleVinController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('dashboard');
Route::get('/branding/logo', [SettingsController::class, 'logo'])->name('branding.logo');
Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
Route::put('/vehicles/{vehicle}/trader', [VehicleController::class, 'updateTrader'])->name('vehicles.trader.update');
Route::post('/vehicles/import', [SpreadsheetImportController::class, 'vehicles'])->name('vehicles.import');
Route::get('/api/vehicles/vin/{vin}', VehicleVinController::class)->name('api.vehicles.vin');
Route::get('/traders', [TraderController::class, 'index'])->name('traders.index');
Route::post('/traders', [TraderController::class, 'store'])->name('traders.store');
Route::get('/containers', [ContainerController::class, 'index'])->name('containers.index');
Route::post('/containers', [ContainerController::class, 'store'])->name('containers.store');
Route::post('/containers/import', [SpreadsheetImportController::class, 'containers'])->name('containers.import');
Route::put('/containers/{container}', [ContainerController::class, 'update'])->name('containers.update');
Route::get('/containers/{container}', [ContainerController::class, 'show'])->name('containers.show');
Route::post('/containers/{container}/vehicles', [ContainerController::class, 'attachVehicle'])->name('containers.vehicles.store');
Route::delete('/containers/{container}/vehicles/{vehicle}', [ContainerController::class, 'detachVehicle'])->name('containers.vehicles.destroy');
Route::post('/containers/{container}/expenses', [ContainerController::class, 'addExpense'])->name('containers.expenses.store');
Route::post('/containers/{container}/attachments', [ContainerController::class, 'addAttachment'])->name('containers.attachments.store');
Route::get('/containers/{container}/attachments/{attachment}', [ContainerController::class, 'downloadAttachment'])->name('containers.attachments.download');
Route::post('/containers/{container}/allocate', [ContainerController::class, 'allocate'])->name('containers.allocate');

Route::get('/road-shipments', [RoadShipmentController::class, 'index'])->name('road-shipments.index');
Route::post('/road-shipments', [RoadShipmentController::class, 'store'])->name('road-shipments.store');
Route::get('/road-shipments/{roadShipment}', [RoadShipmentController::class, 'show'])->name('road-shipments.show');
Route::post('/road-shipments/{roadShipment}/vehicles', [RoadShipmentController::class, 'attachVehicle'])->name('road-shipments.vehicles.store');
Route::delete('/road-shipments/{roadShipment}/vehicles/{vehicle}', [RoadShipmentController::class, 'detachVehicle'])->name('road-shipments.vehicles.destroy');
Route::post('/road-shipments/{roadShipment}/expenses', [RoadShipmentController::class, 'addExpense'])->name('road-shipments.expenses.store');
Route::post('/road-shipments/{roadShipment}/allocate', [RoadShipmentController::class, 'allocate'])->name('road-shipments.allocate');

Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
Route::post('/settings/logo', [SettingsController::class, 'uploadLogo'])->name('settings.logo');
Route::post('/settings/migrations', [SettingsController::class, 'runMigrations'])->name('settings.migrations');

foreach (['purchases', 'sales', 'expenses', 'accounting', 'ledger', 'reports'] as $page) {
    Route::get('/'.$page, fn () => inertia('Placeholder', ['section' => $page]))->name($page.'.index');
}
