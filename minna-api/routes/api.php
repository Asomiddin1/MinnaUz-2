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
// LMS (O'QUV KURS) CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\LevelController as AdminLevelController;
use App\Http\Controllers\Api\Admin\ModuleController as AdminModuleController;
use App\Http\Controllers\Api\Admin\LessonController as AdminLessonController;

use App\Http\Controllers\Api\User\LevelController as UserLevelController;
use App\Http\Controllers\Api\User\InteractionController;

// ==========================================
// YANGI: MATERIALLAR VA QIDIRUV CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\GrammarController as AdminGrammarController;
use App\Http\Controllers\Api\Admin\KanjiController as AdminKanjiController;
use App\Http\Controllers\Api\Admin\VocabularyController as AdminVocabularyController;

use App\Http\Controllers\Api\User\MaterialController as UserMaterialController;
use App\Http\Controllers\Api\User\SearchController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTELAR (Hamma ko'ra oladi)
|--------------------------------------------------------------------------
*/
// Public Auth
Route::prefix('auth')->group(function () {
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
});

// Kurslar ro'yxati va kurs haqida ma'lumotni sotish/ko'rsatish maqsadida ochiq qoldiramiz
Route::get('/levels', [UserLevelController::class, 'index']);
Route::get('/levels/{slug}', [UserLevelController::class, 'show']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER ROUTELARI (Faqat tizimga kirganlar uchun)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/user/streaks', [UserProfileController::class, 'getStreaks']);

    // ==========================================
    // YOPILGAN MATERIALLAR (Faqat userlar ko'radi)
    // ==========================================
    Route::get('/levels/{slug}/grammars', [UserMaterialController::class, 'getGrammars']);
    Route::get('/levels/{slug}/kanjis', [UserMaterialController::class, 'getKanjis']);
    Route::get('/levels/{slug}/vocabularies', [UserMaterialController::class, 'getVocabularies']);
    Route::get('/search', [SearchController::class, 'search']);
    // ==========================================

    // User harakatlari va Test qismi
    Route::prefix('user')->group(function () {
        Route::get('/tests', [UserExamController::class, 'index']);
        Route::get('/tests/{id}', [UserExamController::class, 'show']);
        Route::post('/tests/{id}/submit', [UserExamController::class, 'submit']);
        Route::get('/results/{resultId}', [UserExamController::class, 'result']);
        Route::get('/results', [UserExamController::class, 'history']); 
        
        // Darslarga like bosish va izoh yozish
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

    // LMS Admin routelar
    Route::apiResource('levels', AdminLevelController::class);
    Route::apiResource('modules', AdminModuleController::class);
    Route::apiResource('lessons', AdminLessonController::class);

    // Yangi: Materiallarni boshqarish (CRUD)
    Route::apiResource('grammars', AdminGrammarController::class);
    Route::apiResource('kanjis', AdminKanjiController::class);
    Route::apiResource('vocabularies', AdminVocabularyController::class);
});