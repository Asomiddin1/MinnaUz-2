<?php

namespace App\Http\Controllers\Api\Auth;

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

            $user = User::where('email', $googleUser->getEmail())->first();
            $role = in_array($googleUser->getEmail(), $allowedAdmins) ? 'admin' : 'user';

            // CREATE USER
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(uniqid()),
                    'role' => $role,
                    'coins' => 0,
                    'streak' => 0,
                    'is_premium' => false,
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

            // STREAK LOGIC
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

            // ==============================
            // DEVICE LIMIT LOGIC 🔥
            // ==============================
            $limit = $user->deviceLimit(); // 2 free / 5 premium

            $currentTokens = $user->tokens()->count();

            if ($currentTokens >= $limit) {
                $user->tokens()
                    ->orderBy('created_at', 'asc')
                    ->first()
                    ->delete();
            }

            $device = substr($request->header('User-Agent'), 0, 100) ?? 'unknown-device';

            $token = $user->createToken($device)->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => $user,
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

        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => explode('@', $request->email)[0],
                'password' => Hash::make(uniqid()),
                'role' => 'user',
                'coins' => 0,
                'streak' => 0,
                'is_premium' => false,
            ]
        );

        $user->otp_code = $otpCode;
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        Mail::to($user->email)->send(new SendOtpMail($otpCode));

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
            'email' => 'required|email',
            'otp_code' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || (string)$user->otp_code !== (string)$request->otp_code) {
            return response()->json([
                'success' => false,
                'message' => 'Kod noto‘g‘ri'
            ], 401);
        }

        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->save();

        // ==============================
        // DEVICE LIMIT LOGIC 🔥
        // ==============================
        $limit = $user->deviceLimit();

        $currentTokens = $user->tokens()->count();

        if ($currentTokens >= $limit) {
            $user->tokens()
                ->orderBy('created_at', 'asc')
                ->first()
                ->delete();
        }

        $device = substr($request->header('User-Agent'), 0, 100) ?? 'unknown-device';

        $token = $user->createToken($device)->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'access_token' => $token,
        ]);
    }
}