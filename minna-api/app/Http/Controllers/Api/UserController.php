<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // =========================
    // USERS LIST
    // =========================
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
                'avatar' => $user->avatar, // 🔥 YO‘QOLMAYDI
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
}