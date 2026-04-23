<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="MinnaUz API",
 *     version="1.0.0",
 *     description="MinnaUz Laravel API documentation"
 * )
 */
class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //
    }
}