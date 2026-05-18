<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AddNgrokHeader
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('ngrok-skip-browser-warning', 'true');
        return $response;
    }
}
