<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        // 1. Foydalanuvchi tizimga kirganligini tekshirish
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // 2. Foydalanuvchi roli so'ralgan rolga (masalan, 'admin') mos kelishini tekshirish
        if ($request->user()->role !== $role) {
            return response()->json(['message' => 'Sizda bu sahifaga kirish huquqi yo\'q (Forbidden)'], 403);
        }

        return $next($request);
    }
}