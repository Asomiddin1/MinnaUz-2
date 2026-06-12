<?php

namespace App\Http\Controllers\Api\User;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LoginHistory; 
use Illuminate\Http\Request;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $users = $query->latest()->paginate(10);

        return response()->json([
            'data' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'coins' => $user->coins,
                    'streak' => $user->streak,
                    'avatar' => $user->avatar,
                    'is_premium' => $user->is_premium,
                    'device_limit' => $user->deviceLimit(),
                ];
            }),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    // =========================
    // UPDATE USER (SAFE)
    // =========================
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|string|in:user,admin,teacher',
            'coins' => 'sometimes|integer|min:0',
            'streak' => 'sometimes|integer|min:0',
            'is_premium' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'coins' => $user->coins,
                'streak' => $user->streak,
                'avatar' => $user->avatar, 
                'is_premium' => $user->is_premium,
                'device_limit' => $user->deviceLimit(),
            ]
        ]);
    }

    // =========================
    // DELETE USER
    // =========================
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted'
        ]);
    }
    

    public function getStreaks(Request $request)
    {
        // 1. Frontenddan kelayotgan yil va oyni olamiz (jo'natilmasa joriy yil/oy ishlatiladi)
        $year = $request->query('year', Carbon::now()->year);
        $month = $request->query('month', Carbon::now()->month);

        // 2. Tizimga kirgan foydalanuvchini aniqlaymiz
        $userId = auth()->id(); 

        // 3. LoginHistory bazasidan shu yil va oyga tegishli sanalarni tortib olamiz
        $dates = LoginHistory::where('user_id', $userId)
            ->whereYear('login_date', $year)
            ->whereMonth('login_date', $month)
            ->pluck('login_date')
            ->toArray(); // Kutilayotgan natija: ["2026-04-20", "2026-04-21"]

        // 4. Frontend kutingan formatda qaytaramiz
        // Frontend "response.data.map" qilgani uchun, "data" kaliti ichida berish to'g'ri bo'ladi.
        return response()->json([
            'data' => $dates
        ]);
    }

    // =========================
    // DEVICE MANAGER (SANCTUM)
    // =========================

    // 1. Faol qurilmalar (tokenlar) ro'yxatini olish
    public function getDevices(Request $request)
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $devices = $user->tokens->map(function ($token) use ($currentTokenId) {
            return [
                'id' => $token->id,
                // Token yaratilayotganda nomi User-Agent bilan saqlangan deb faraz qilamiz
                'name' => $token->name, 
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
                'is_current' => $token->id === $currentTokenId,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    // 2. Aniq bitta qurilmadan (tokendan) chiqish
    public function logoutDevice(Request $request, $tokenId)
    {
        // Faqat o'ziga tegishli tokenni o'chiradi
        $request->user()->tokens()->where('id', $tokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Qurilmadan muvaffaqiyatli chiqildi'
        ]);
    }

    // 3. Hozirgi qurilmadan tashqari boshqa barcha qurilmalardan chiqish
    public function logoutOtherDevices(Request $request)
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;

        // Joriy tokendan tashqari barcha tokenlarni o'chirish
        $request->user()->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Boshqa barcha qurilmalardan chiqildi'
        ]);
    }
    
}