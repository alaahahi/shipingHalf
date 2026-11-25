<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class VehicleVinController extends Controller
{
    public function __invoke(string $vin): JsonResponse
    {
        $vin = strtoupper(trim($vin));
        if (! preg_match('/^[A-HJ-NPR-Z0-9]{11,17}$/', $vin)) {
            return response()->json([
                'exists' => false,
                'valid' => false,
                'message' => 'رقم VIN غير مكتمل أو يحتوي أحرفاً غير مسموحة.',
                'vehicle' => null,
            ], 422);
        }

        $existing = Vehicle::withTrashed()->whereRaw('UPPER(vin) = ?', [$vin])->first();
        if ($existing) {
            return response()->json([
                'exists' => true,
                'valid' => true,
                'message' => 'رقم VIN مستخدم مسبقاً.',
                'vehicle' => [
                    'id' => $existing->id,
                    'stock_no' => $existing->stock_no,
                    'make' => $existing->make,
                    'model' => $existing->model,
                    'year' => $existing->year,
                    'archived' => $existing->trashed(),
                ],
            ]);
        }

        try {
            $response = Http::acceptJson()->timeout(8)->retry(1, 150)->get(
                "https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{$vin}",
                ['format' => 'json'],
            );
            $decoded = $response->successful() ? ($response->json('Results.0') ?? []) : [];
            $make = trim((string) (($decoded['Make'] ?? '') ?: ($decoded['Manufacturer'] ?? '')));
            $model = trim((string) ($decoded['Model'] ?? ''));
            $year = filter_var($decoded['ModelYear'] ?? null, FILTER_VALIDATE_INT) ?: null;

            return response()->json([
                'exists' => false,
                'valid' => true,
                'message' => $make || $model ? 'رقم VIN متاح وتم جلب معلومات السيارة.' : 'رقم VIN متاح، لكن لم توجد معلومات تلقائية.',
                'vehicle' => [
                    'make' => $make,
                    'model' => $model,
                    'year' => $year,
                    'body_class' => $decoded['BodyClass'] ?? null,
                    'vehicle_type' => $decoded['VehicleType'] ?? null,
                ],
            ]);
        } catch (\Throwable) {
            return response()->json([
                'exists' => false,
                'valid' => true,
                'message' => 'رقم VIN متاح. تعذر جلب معلومات السيارة حالياً ويمكن إدخالها يدوياً.',
                'vehicle' => null,
            ]);
        }
    }
}
