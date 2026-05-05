<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Mail\SendOtpMail;
use Carbon\Carbon;

class AuthController extends Controller
{
    // ==========================================
    // ME
    // ==========================================
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user()
        ]);
    }

    // ==========================================
    // 1. GOOGLE LOGIN
    // ==========================================
    public function googleLogin(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->userFromToken($request->token);

            $allowedAdmins = explode(',', env('ADMIN_EMAILS', ''));
            $role = in_array($googleUser->getEmail(), $allowedAdmins) ? 'admin' : 'user';

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'google_id'         => $googleUser->getId(),
                    'avatar'            => $googleUser->getAvatar(),
                    'password'          => Hash::make(uniqid()),
                    'role'              => $role,
                    'coins'             => 0,
                    'streak'            => 0,
                    'is_premium'        => false,
                    'email_verified_at' => Carbon::now(),
                ]);
            } else {
                $user->google_id = $googleUser->getId();

                $emailPrefix = explode('@', $user->email)[0];
                if (empty($user->name) || $user->name === $emailPrefix) {
                    $user->name = $googleUser->getName();
                }

                if (empty($user->avatar)) {
                    $user->avatar = $googleUser->getAvatar();
                }

                $user->email_verified_at = Carbon::now();

                if ($role === 'admin' && $user->role !== 'admin') {
                    $user->role = 'admin';
                }
            }

            // Streak mantig'i
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

            // Device limit
            $limit = $user->deviceLimit();
            if ($user->tokens()->count() >= $limit) {
                $user->tokens()->orderBy('created_at', 'asc')->first()->delete();
            }

            $device = substr($request->header('User-Agent'), 0, 100) ?? 'unknown-device';
            $token = $user->createToken($device)->plainTextToken;

            return response()->json([
                'success'      => true,
                'user'         => $user,
                'access_token' => $token,
            ]);

        } catch (\Exception $e) {
            Log::error("Google Login xatosi: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Xatolik: ' . $e->getMessage()
            ], 401);
        }
    }

    // ==========================================
    // 2. SEND OTP
    // ==========================================
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $otpCode = rand(100000, 999999);

        // ✅ Faqat Cache ga saqlaymiz — bazaga HECH NARSA YOZILMAYDI
        Cache::put('otp_' . $request->email, $otpCode, now()->addMinutes(10));

        Mail::to($request->email)->send(new SendOtpMail($otpCode));

        return response()->json([
            'success' => true,
            'message' => "Kod emailga yuborildi",
        ]);
    }

    // ==========================================
    // 3. VERIFY OTP
    // ==========================================
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'otp_code' => 'required',
        ]);

        $cachedOtp = Cache::get('otp_' . $request->email);

        // ✅ OTP yo'q yoki noto'g'ri — bazaga hech narsa yozilmaydi
        if (!$cachedOtp || (string)$cachedOtp !== (string)$request->otp_code) {
            return response()->json([
                'success' => false,
                'message' => "Kod noto'g'ri yoki muddati tugagan"
            ], 401);
        }

        // ✅ OTP to'g'ri — keshdan o'chiramiz
        Cache::forget('otp_' . $request->email);

        // ✅ Faqat shu yerda user yaratiladi
        $allowedAdmins = explode(',', env('ADMIN_EMAILS', ''));
        $role = in_array($request->email, $allowedAdmins) ? 'admin' : 'user';

        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name'       => explode('@', $request->email)[0],
                'password'   => Hash::make(uniqid()),
                'role'       => $role,
                'coins'      => 0,
                'streak'     => 0,
                'is_premium' => false,
            ]
        );

        $user->email_verified_at = now();

        // Streak mantig'i
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

        // Device limit
        $limit = $user->deviceLimit();
        if ($user->tokens()->count() >= $limit) {
            $user->tokens()->orderBy('created_at', 'asc')->first()->delete();
        }

        $device = substr($request->header('User-Agent'), 0, 100) ?? 'unknown-device';
        $token = $user->createToken($device)->plainTextToken;

        return response()->json([
            'success'      => true,
            'user'         => $user,
            'access_token' => $token,
        ]);
    }
}