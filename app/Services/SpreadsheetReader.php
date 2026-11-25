<?php

namespace App\Services;

use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

class SpreadsheetReader
{
    public function rows(string $path, string $extension): array
    {
        return strtolower($extension) === 'csv' ? $this->csv($path) : $this->xlsx($path);
    }

    private function csv(string $path): array
    {
        $handle = fopen($path, 'r');
        if (! $handle) {
            throw new RuntimeException('تعذر قراءة الملف.');
        }
        $first = fgets($handle);
        rewind($handle);
        $delimiter = substr_count((string) $first, ';') > substr_count((string) $first, ',') ? ';' : ',';
        $rows = [];
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = array_map(fn ($value) => trim((string) $value), $row);
        }
        fclose($handle);

        return $rows;
    }

    private function xlsx(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            throw new RuntimeException('ملف Excel غير صالح.');
        }
        $shared = [];
        if (($xml = $zip->getFromName('xl/sharedStrings.xml')) !== false) {
            $strings = new SimpleXMLElement($xml);
            foreach ($strings->si as $item) {
                $parts = [];
                foreach ($item->xpath('.//*[local-name()="t"]') ?: [] as $text) {
                    $parts[] = (string) $text;
                }
                $shared[] = implode('', $parts);
            }
        }
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();
        if ($sheetXml === false) {
            throw new RuntimeException('لم يتم العثور على ورقة البيانات الأولى.');
        }
        $sheet = new SimpleXMLElement($sheetXml);
        $rows = [];
        foreach ($sheet->sheetData->row as $row) {
            $values = [];
            foreach ($row->c as $cell) {
                $reference = (string) $cell['r'];
                preg_match('/^[A-Z]+/', $reference, $match);
                $column = $this->columnIndex($match[0] ?? 'A');
                $type = (string) $cell['t'];
                $value = $type === 'inlineStr' ? (string) $cell->is->t : (string) $cell->v;
                if ($type === 's') {
                    $value = $shared[(int) $value] ?? '';
                }
                $values[$column] = trim($value);
            }
            if ($values) {
                $max = max(array_keys($values));
                $rows[] = array_map(fn ($index) => $values[$index] ?? '', range(0, $max));
            }
        }

        return $rows;
    }

    private function columnIndex(string $letters): int
    {
        $index = 0;
        foreach (str_split($letters) as $letter) {
            $index = $index * 26 + ord($letter) - 64;
        }

        return $index - 1;
    }
}
