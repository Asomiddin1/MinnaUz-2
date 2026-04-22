<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Ochiq marshrutlar (Login va Register uchun token kerak emas)
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']); // <-- Mana shu qator o'zgardi
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);

// Himoyalangan marshrutlar (Faqat tokenga ega foydalanuvchilar kira oladi)
Route::middleware('auth:sanctum')->group(function () {
    
    // Foydalanuvchi o'z ma'lumotlarini olishi uchun (Next.js doim shunga so'rov yuboradi)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Kelajakda: darslar, coinlarni ishlatish va hokazo APIlar shu yerga yoziladi
});