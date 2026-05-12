<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==========================================
// MAVJUD CONTROLLERLAR
// ==========================================
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\User\UserController as UserProfileController;
use App\Http\Controllers\Api\User\ExamController as UserExamController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\TestController as AdminTestController;
use App\Http\Controllers\Api\Admin\QuestionController as AdminQuestionController;

// ==========================================
// YANGI LMS (O'QUV KURS) CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\LevelController as AdminLevelController;
use App\Http\Controllers\Api\Admin\ModuleController as AdminModuleController;
use App\Http\Controllers\Api\Admin\LessonController as AdminLessonController;

use App\Http\Controllers\Api\User\LevelController as UserLevelController;
use App\Http\Controllers\Api\User\InteractionController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTELAR
|--------------------------------------------------------------------------
*/
// Public Auth
Route::prefix('auth')->group(function () {
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
});

// Public LMS Data (Next.js serverdan authsiz erkin o'qishi uchun)
Route::get('/levels', [UserLevelController::class, 'index']);
Route::get('/levels/{slug}', [UserLevelController::class, 'show']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER ROUTELARI (Tizimga kirganlar)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/user/streaks', [UserProfileController::class, 'getStreaks']);

    // User harakatlari va Test qismi
    Route::prefix('user')->group(function () {
        Route::get('/tests', [UserExamController::class, 'index']);
        Route::get('/tests/{id}', [UserExamController::class, 'show']);
        Route::post('/tests/{id}/submit', [UserExamController::class, 'submit']);
        Route::get('/results/{resultId}', [UserExamController::class, 'result']);
        Route::get('/results', [UserExamController::class, 'history']); 
        
        // Yangi: Darslarga like bosish va izoh yozish
        Route::post('/lessons/{lesson}/like', [InteractionController::class, 'toggleLike']);
        Route::post('/lessons/{lesson}/comments', [InteractionController::class, 'addComment']);
    });
});

/*
|--------------------------------------------------------------------------
| ADMIN ONLY ROUTELARI (Faqat Admin uchun)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Mavjud admin routelar
    Route::apiResource('users', AdminUserController::class)->except(['store']);
    Route::post('/users/{id}/toggle-premium', [AdminUserController::class, 'togglePremium']);
    Route::apiResource('tests', AdminTestController::class);
    Route::get('/tests/{testId}/questions', [AdminTestController::class, 'getQuestions']);
    Route::apiResource('questions', AdminQuestionController::class);

    // Yangi: LMS Admin routelar (Kurslar, Modullar va Darslarni boshqarish)
    Route::apiResource('levels', AdminLevelController::class);
    Route::apiResource('modules', AdminModuleController::class);
    Route::apiResource('lessons', AdminLessonController::class);
});