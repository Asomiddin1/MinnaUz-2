<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\User\UserController as UserProfileController;
use App\Http\Controllers\Api\User\ExamController as UserExamController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\TestController as AdminTestController;
use App\Http\Controllers\Api\Admin\QuestionController as AdminQuestionController;

// Public Auth
Route::prefix('auth')->group(function () {
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
});

// Authenticated User
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/user/streaks', [UserProfileController::class, 'getStreaks']);

    // JLPT Test yechish qismi
    Route::prefix('user')->group(function () {
        Route::get('/tests', [UserExamController::class, 'index']);
        Route::get('/tests/{id}', [UserExamController::class, 'show']);
        Route::post('/tests/{id}/submit', [UserExamController::class, 'submit']);
        Route::get('/results/{resultId}', [UserExamController::class, 'result']);
        Route::get('/results', [UserExamController::class, 'history']); // to‘g‘rilandi
    });
});

// Admin only
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('users', AdminUserController::class)->except(['store']);
    Route::post('/users/{id}/toggle-premium', [AdminUserController::class, 'togglePremium']);
    Route::apiResource('tests', AdminTestController::class);
    Route::get('/tests/{testId}/questions', [AdminTestController::class, 'getQuestions']);
    Route::apiResource('questions', AdminQuestionController::class);
});