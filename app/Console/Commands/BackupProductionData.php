<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use RuntimeException;
use Symfony\Component\Process\Process;

class BackupProductionData extends Command
{
    protected $signature = 'system:backup {--keep=30 : Number of days to retain backups}';

    protected $description = 'Back up the production database and private container attachments';

    public function handle(): int
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $backupDirectory = storage_path('app/backups/'.$timestamp);
        File::ensureDirectoryExists($backupDirectory);

        try {
            $this->backupDatabase($backupDirectory);
            $attachments = storage_path('app/private/container-attachments');
            if (File::isDirectory($attachments)) {
                File::copyDirectory($attachments, $backupDirectory.'/container-attachments');
            }
            File::put($backupDirectory.'/backup-info.json', json_encode([
                'created_at' => now()->toIso8601String(),
                'database_connection' => config('database.default'),
                'app_url' => config('app.url'),
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            $this->removeExpiredBackups((int) $this->option('keep'));
        } catch (\Throwable $exception) {
            File::deleteDirectory($backupDirectory);
            $this->error('Backup failed: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Backup created: '.$backupDirectory);

        return self::SUCCESS;
    }

    private function backupDatabase(string $directory): void
    {
        $connection = config('database.default');
        $config = config('database.connections.'.$connection);

        if (($config['driver'] ?? null) === 'sqlite') {
            $source = (string) ($config['database'] ?? '');
            if (! str_starts_with($source, '/') && ! preg_match('/^[A-Za-z]:[\\\\\/]/', $source)) {
                $source = base_path($source);
            }
            if (! File::exists($source) || ! File::copy($source, $directory.'/database.sqlite')) {
                throw new RuntimeException('Unable to copy the SQLite database.');
            }

            return;
        }

        if (($config['driver'] ?? null) !== 'mysql') {
            throw new RuntimeException('Automatic backup currently supports SQLite and MySQL.');
        }

        $process = new Process([
            'mysqldump', '--single-transaction', '--quick', '--skip-lock-tables',
            '--host='.($config['host'] ?? '127.0.0.1'), '--port='.(string) ($config['port'] ?? 3306),
            '--user='.($config['username'] ?? ''), (string) ($config['database'] ?? ''),
        ]);
        $process->setEnv(['MYSQL_PWD' => (string) ($config['password'] ?? '')]);
        $process->setTimeout(600);
        $process->mustRun();
        File::put($directory.'/database.sql', $process->getOutput());
    }

    private function removeExpiredBackups(int $days): void
    {
        if ($days < 1) {
            return;
        }
        $cutoff = now()->subDays($days)->timestamp;
        foreach (File::directories(storage_path('app/backups')) as $directory) {
            if (File::lastModified($directory) < $cutoff) {
                File::deleteDirectory($directory);
            }
        }
    }
}
