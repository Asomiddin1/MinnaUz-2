<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;

// Ochiq yo'llar (Login/Register)
Route::prefix('auth')->group(function () {
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
});

// Himoyalangan yo'llar (Token kerak)
Route::middleware('auth:sanctum')->group(function () {
    // Profilni olish
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Foydalanuvchilar CRUDi
    Route::get('/users', [UserController::class, 'index']);          // Ro'yxat
    Route::put('/users/{user}', [UserController::class, 'update']);  // Tahrirlash (Next.js dagi Modal uchun)
    Route::delete('/users/{user}', [UserController::class, 'destroy']); // O'chirish
});