<?php

namespace App\Http\Controllers;

use App\Models\Container;
use App\Models\Trader;
use App\Models\Vehicle;
use App\Services\SpreadsheetReader;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SpreadsheetImportController extends Controller
{
    public function containers(Request $request, SpreadsheetReader $reader)
    {
        $file = $request->validate(['file' => ['required', 'file', 'mimes:xlsx,csv', 'max:10240']])['file'];
        [$headers, $rows] = $this->table($reader->rows($file->getRealPath(), $file->getClientOriginalExtension()));
        $imported = 0;
        DB::transaction(function () use ($headers, $rows, &$imported) {
            foreach ($rows as $row) {
                $data = $this->map($headers, $row);
                $number = $this->value($data, ['رقمالحاوية', 'containernumber', 'containerno', 'container', 'konteyner']);
                if (! $number) {
                    continue;
                }
                $container = Container::updateOrCreate(['container_no' => $number], [
                    'sequence_no' => $this->nullableNumber($this->value($data, ['تسلسل', 'sequence', 'sira', 'no'])) ?? ((int) Container::max('sequence_no') + 1),
                    'shipment_date' => $this->date($this->value($data, ['التاريخ', 'date', 'tarih'])),
                    'shipping_agent' => $this->value($data, ['الوكيل', 'shippingagent', 'acenta']),
                    'bill_of_lading' => $this->value($data, ['رقمbl', 'blno', 'bl', 'billoflading']),
                    'arf_date' => $this->date($this->value($data, ['تاريخarf', 'arfdate', 'arfno', 'arf'])),
                    'paid_amount' => $this->number($this->value($data, ['المدفوع', 'paid', 'odenen'])),
                ]);
                foreach (['agent' => ['أجورالوكيل', 'agentfee', 'acenta2', 'acentaucreti'], 'mip' => ['mip'], 'demurrage' => ['demurrage', 'demuraj'], 'depot' => ['المخزن', 'depot', 'depo'], 'commission' => ['العمولة', 'commission', 'komisyon'], 'customs' => ['مصروفالجمارك', 'customs', 'gumrukmasraf']] as $category => $aliases) {
                    $amount = $this->number($this->value($data, $aliases));
                    if ($amount > 0) {
                        $container->expenses()->updateOrCreate(['category' => $category, 'description' => 'Excel import'], ['amount' => $amount, 'expense_date' => $container->shipment_date ?? now(), 'currency' => $container->currency]);
                    }
                }
                $imported++;
            }
        });

        return back()->with('success', "تم استيراد {$imported} حاوية من Excel.");
    }

    public function vehicles(Request $request, SpreadsheetReader $reader)
    {
        $file = $request->validate(['file' => ['required', 'file', 'mimes:xlsx,csv', 'max:10240']])['file'];
        [$headers, $rows] = $this->table($reader->rows($file->getRealPath(), $file->getClientOriginalExtension()));
        $unknown = Trader::firstOrCreate(['name' => 'غير محدد'], ['opening_balance' => 0]);
        $imported = 0;
        $skipped = 0;
        foreach ($rows as $row) {
            $data = $this->map($headers, $row);
            $vin = strtoupper(preg_replace('/[^A-HJ-NPR-Z0-9]/', '', $this->value($data, ['vin', 'رقمالشاصي']) ?? ''));
            $stock = $this->value($data, ['رقمالمخزون', 'stocknumber', 'stock', 'lot']);
            if (! $stock || strlen($vin) < 11 || Vehicle::withTrashed()->where(fn ($query) => $query->where('vin', $vin)->orWhere('stock_no', $stock))->exists()) {
                $skipped++;

                continue;
            }
            $traderName = $this->value($data, ['التاجر', 'trader', 'owner', 'المالك']);
            $trader = $traderName ? Trader::firstOrCreate(['name' => $traderName], ['opening_balance' => 0]) : $unknown;
            Vehicle::create([
                'stock_no' => $stock, 'vin' => $vin, 'trader_id' => $trader->id,
                'make' => $this->value($data, ['الماركة', 'make', 'brand']) ?: 'غير محدد',
                'model' => $this->value($data, ['الموديل', 'model']) ?: 'غير محدد',
                'year' => $this->nullableNumber($this->value($data, ['السنة', 'year'])),
                'color' => $this->value($data, ['اللون', 'color']),
                'purchase_price' => $this->number($this->value($data, ['سعرالشراء', 'purchaseprice', 'price'])),
            ]);
            $imported++;
        }

        return back()->with('success', "تم استيراد {$imported} سيارة، وتجاوز {$skipped} صف غير صالح أو مكرر.");
    }

    private function table(array $rows): array
    {
        $headers = [];
        $seen = [];
        foreach (array_shift($rows) ?? [] as $header) {
            $normalized = $this->normalize((string) $header);
            $seen[$normalized] = ($seen[$normalized] ?? 0) + 1;
            $headers[] = $normalized.($seen[$normalized] > 1 ? $seen[$normalized] : '');
        }

        return [$headers, $rows];
    }

    private function map(array $headers, array $row): array
    {
        $result = [];
        foreach ($headers as $index => $header) {
            $result[$header] = trim((string) ($row[$index] ?? ''));
        }

        return $result;
    }

    private function normalize(string $value): string
    {
        return Str::of($value)->lower()->replace([' ', '_', '-', '/', '.', 'ı', 'i̇', 'ö', 'ü', 'ş', 'ç', 'ğ'], ['', '', '', '', '', 'i', 'i', 'o', 'u', 's', 'c', 'g'])->toString();
    }

    private function value(array $data, array $aliases): ?string
    {
        foreach ($aliases as $alias) {
            $value = $data[$this->normalize($alias)] ?? null;
            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    private function number(?string $value): float
    {
        return (float) preg_replace('/[^0-9.\-]/', '', str_replace(',', '.', $value ?? '0'));
    }

    private function nullableNumber(?string $value): ?int
    {
        return $value !== null && $value !== '' ? (int) $this->number($value) : null;
    }

    private function date(?string $value): ?string
    {
        if (! $value) {
            return null;
        }
        if (preg_match('/^(\d{4})(\d{2})(\d{2})/', $value, $match)) {
            return Carbon::create((int) $match[1], (int) $match[2], (int) $match[3])->toDateString();
        }
        if (is_numeric($value)) {
            return Carbon::create(1899, 12, 30)->addDays((int) $value)->toDateString();
        }
        try {
            return Carbon::parse(str_replace('/', '-', $value))->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
