<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    public function index()
    {
        return response()->json(SiteSetting::all()->keyBy('key'));
    }

    public function update(Request $request)
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json([
            'message' => 'Paramètres mis à jour',
            'data' => SiteSetting::all()->keyBy('key')
        ]);
    }
    public function translateAll()
    {
        set_time_limit(600); // Increase timeout for long task

        $models = [
            \App\Models\Activity::all(),
            \App\Models\Accommodation::all(),
            \App\Models\BlogPost::all(),
            \App\Models\ActivityCategory::all(),
            \App\Models\PageContent::all(),
        ];

        $count = 0;
        foreach ($models as $collection) {
            foreach ($collection as $item) {
                try {
                    $item->generateTranslations();
                    $count++;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Manual Translation Error for ID {$item->id}: " . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message' => "Traduction de {$count} éléments terminée avec succès !",
            'count' => $count
        ]);
    }
}
