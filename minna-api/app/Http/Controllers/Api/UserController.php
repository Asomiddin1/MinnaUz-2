<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
{
    $query = User::query();

    // Agar so'rovda 'search' bo'lsa, ism yoki email bo'yicha izlash
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
    }

    // Eng oxirgi qo'shilganlarni birinchi chiqarish va sahifalash
    return UserResource::collection($query->latest()->paginate(10));
}

    // Foydalanuvchini yangilash (Role, Coins, Name va h.k.)
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|string|in:user,admin,teacher',
            'coins' => 'sometimes|integer|min:0',
            'streak' => 'sometimes|integer|min:0',
        ]);

        $user->update($validated);

        return new UserResource($user);
    }

    // Foydalanuvchini o'chirish (agar kerak bo'lsa)
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Foydalanuvchi o‘chirildi']);
    }
}