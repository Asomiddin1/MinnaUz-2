<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // ==========================================
    // 1. GOOGLE ORQALI KIRISH (Ismni yangilash, Avatar va Token tozalash)
    // ==========================================
    public function googleLogin(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->token);

            // Typo to'g'rilandi: $$ o'rniga bitta $ 
            $allowedAdmins = explode(',', env('ADMIN_EMAILS', ''));

            $user = User::where('email', $googleUser->getEmail())->first();
            $role = in_array($googleUser->getEmail(), $allowedAdmins) ? 'admin' : 'user';

            if (!$user) {
                // Agar umuman bazada yo'q bo'lsa (Birinchi marta Google orqali kirdi)
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(uniqid()),
                    'role' => $role,
                    'coins' => 0,
                    'streak' => 0,
                    'email_verified_at' => Carbon::now(),
                ]);
            } else {
                // Foydalanuvchi bazada bor bo'lsa (Oldin OTP yoki Google bilan kirgan)
                $user->google_id = $googleUser->getId();
                
                // MANTIQIY TEKSHIRUV:
                // Emailning '@' dan oldingi qismini ajratib olamiz (OTP ro'yxatdan o'tkazgan taxminiy ism)
                $emailPrefix = explode('@', $user->email)[0];
                
                // Agar foydalanuvchi ismi bo'sh bo'lsa Yoki ism OTP yaratgan "email-ism" ga teng bo'lsa,
                // demak u hali haqiqiy ismini kiritmagan. Shundagina Google ismiga almashtiramiz.
                if (empty($user->name) || $user->name === $emailPrefix) {
                    $user->name = $googleUser->getName(); 
                }
                
                // Agar foydalanuvchida umuman rasm (avatar) bo'lmasa, Google rasmini qo'yamiz.
                // Bu degani: agar u o'z profiliga boshqa rasm yuklagan bo'lsa, Google uni ustidan yozib yubormaydi (eslab qoladi).
                if (empty($user->avatar)) {
                    $user->avatar = $googleUser->getAvatar();
                }
                
                $user->email_verified_at = Carbon::now();
                
                if ($role === 'admin' && $user->role !== 'admin') {
                    $user->role = 'admin';
                }
            }

            // Streak hisoblash
            $now = Carbon::now();
            if ($user->last_login_at) {
                if ($user->last_login_at->isYesterday()) {
                    $user->streak += 1;
                } elseif (!$user->last_login_at->isToday()) {
                    $user->streak = 1;
                }
            } else {
                $user->streak = 1;
            }

            $user->last_login_at = $now;
            $user->save(); 

            // Barcha eski tokenlarni o'chirib yuboramiz (Bazani toza saqlash uchun)
            $user->tokens()->delete();

            // Yagona yangi token yaratamiz
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => $user,
                'access_token' => $token,
            ]);

        } catch (\Exception $e) {
            Log::error("Google Login xatosi: " . $e->getMessage());
            
            return response()->json([
                'success' => false, 
                'message' => 'Token yaroqsiz yoki xatolik yuz berdi: ' . $e->getMessage()
            ], 401);
        }
    }

    // ==========================================
    // 2. EMAIL ORQALI KOD YUBORISH
    // ==========================================
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $otpCode = rand(100000, 999999); 

        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => explode('@', $request->email)[0],
                'password' => Hash::make(uniqid()), 
                'role' => 'user', 
                'coins' => 0,
                'streak' => 0,
            ]
        );

        $user->otp_code = $otpCode;
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        Mail::to($user->email)->send(new SendOtpMail($otpCode));

        return response()->json([
            'success' => true,
            'message' => "Emailingizga tasdiqlash kodi jo'natildi",
        ]);
    }

    // ==========================================
    // 3. KODNI TASDIQLASH VA TOKEN BERISH
    // ==========================================
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp_code' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        Log::info("Verify urinishi:", [
            'sent_code' => $request->otp_code,
            'db_code' => $user ? $user->otp_code : 'user_not_found'
        ]);

        if (!$user || (string)$user->otp_code !== (string)$request->otp_code) {
            return response()->json(['success' => false, 'message' => 'Kod xato'], 401);
        }

        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->save();

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'access_token' => $token,
        ]);
    }
}