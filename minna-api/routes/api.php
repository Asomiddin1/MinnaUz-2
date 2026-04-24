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

    // Profilni olish (FIXED VERSION)
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'avatar' => $request->user()->avatar,
                'role' => $request->user()->role,
                'coins' => $request->user()->coins,
                'streak' => $request->user()->streak,
                'is_premium' => $request->user()->is_premium,
                'device_limit' => $request->user()->deviceLimit(),
            ]
        ]);
    });

    // Users CRUD
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});