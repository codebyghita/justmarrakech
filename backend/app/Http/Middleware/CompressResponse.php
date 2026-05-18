<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CompressResponse
{
    // Extensions to compress
    private const COMPRESSIBLE = ['text/html', 'application/javascript', 'text/css', 'application/json', 'text/plain'];

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Add ngrok bypass header on everything
        $response->headers->set('ngrok-skip-browser-warning', 'true');

        // Add cache headers for static assets
        $path = $request->path();
        if (preg_match('/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i', $path)) {
            $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        // Gzip compression if client supports it
        $acceptEncoding = $request->header('Accept-Encoding', '');
        if (str_contains($acceptEncoding, 'gzip')) {
            $contentType = $response->headers->get('Content-Type', '');
            $shouldCompress = false;
            foreach (self::COMPRESSIBLE as $type) {
                if (str_contains($contentType, $type)) {
                    $shouldCompress = true;
                    break;
                }
            }

            if ($shouldCompress) {
                $content = $response->getContent();
                if (strlen($content) > 1024) { // Only compress if > 1KB
                    $compressed = gzencode($content, 6);
                    if ($compressed !== false && strlen($compressed) < strlen($content)) {
                        $response->setContent($compressed);
                        $response->headers->set('Content-Encoding', 'gzip');
                        $response->headers->set('Content-Length', strlen($compressed));
                        $response->headers->remove('Transfer-Encoding');
                    }
                }
            }
        }

        return $response;
    }
}
