<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\NewsletterSubscriber;

class NewsletterSubscriberController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $subscriber = NewsletterSubscriber::firstOrCreate([
            'email' => $request->email
        ]);

        return response()->json(['message' => 'Successfully subscribed', 'subscriber' => $subscriber]);
    }
}
