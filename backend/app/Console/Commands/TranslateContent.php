<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Models\Accommodation;

class TranslateContent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'translate:all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate translations for all activities and accommodations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting bulk translation...');

        $activities = Activity::all();
        $this->info("Found {$activities->count()} activities.");
        
        $bar = $this->output->createProgressBar($activities->count());
        $bar->start();

        foreach ($activities as $activity) {
            try {
                $activity->generateTranslations();
            } catch (\Exception $e) {
                $this->error("\nFailed to translate Activity ID {$activity->id}: " . $e->getMessage());
            }
            $bar->advance();
        }
        $bar->finish();
        
        $this->info("\nActivities translated.");

        $accommodations = Accommodation::all();
        $this->info("Found {$accommodations->count()} accommodations.");
        
        $bar2 = $this->output->createProgressBar($accommodations->count());
        $bar2->start();

        foreach ($accommodations as $acc) {
            try {
                $acc->generateTranslations();
            } catch (\Exception $e) {
                $this->error("\nFailed to translate Accommodation ID {$acc->id}: " . $e->getMessage());
            }
            $bar2->advance();
        }
        $bar2->finish();

        $this->info("\nBulk translation complete.");
    }
}
