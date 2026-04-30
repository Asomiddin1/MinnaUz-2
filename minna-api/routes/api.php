<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JlptController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\QuestionController;
use App\Http\Controllers\Api\Admin\TestController; // 👈 1. YANGI QO'SHILDI

/*
|--------------------------------------------------------------------------
| PUBLIC (auth)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
});

/*
|--------------------------------------------------------------------------
| AUTHENTICATED (USER + ADMIN)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // 👤 user info
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // 🎧 JLPT (hamma user)
    Route::get('/jlpt/questions', [JlptController::class, 'getQuestions']);
    Route::get('/jlpt/listening', [JlptController::class, 'getListening']);
    Route::post('/jlpt/submit', [JlptController::class, 'submit']);

    // 📊 user features
    Route::get('/user/streaks', [UserController::class, 'getStreaks']);
});

/*
|--------------------------------------------------------------------------
| ADMIN ONLY
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {

    // 👥 users management
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // ❗ QUESTIONS (TO‘G‘RILANGAN)
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::get('/questions/{id}', [QuestionController::class, 'show']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);

    // 📝 TESTS
    Route::get('/tests', [TestController::class, 'index']); // Testlarni ko'rish
    Route::post('/tests', [TestController::class, 'store']); // Test qo'shish
    Route::get('/tests/{id}', [TestController::class, 'show']); // getTestById uchun
    Route::get('/tests/{testId}/questions', [TestController::class, 'getQuestions']); // getQuestionsByTestId uchun
    Route::put('/tests/{id}', [TestController::class, 'update']);
    Route::delete('/tests/{id}', [TestController::class, 'destroy']);
    
});