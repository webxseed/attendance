<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Step 1: Send OTP code to phone number.
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $phone = $request->phone;

        // Check that a user with this phone exists
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            return response()->json(['message' => 'رقم الهاتف غير مسجّل في النظام'], 404);
        }

        // Delete any previous OTPs for this phone
        OtpCode::where('phone', $phone)->delete();

        // Generate a 4-digit code
        $code = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        OtpCode::create([
            'phone'      => $phone,
            'code'       => $code,
            'expires_at' => now()->addMinutes(5),
        ]);

        // Send SMS
        $message = "رمز التحقق الخاص بك: {$code}";
        $this->sendSms($message, $phone);

        Log::info("OTP for {$phone}: {$code}");

        return response()->json([
            'message' => 'تم إرسال رمز التحقق',
            // Only expose the code in non-production for easy testing
            ...(!app()->isProduction() ? ['code' => $code] : []),
        ]);
    }

    /**
     * Step 2: Verify OTP and issue Sanctum token.
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code'  => 'required|string',
        ]);

        $otp = OtpCode::where('phone', $request->phone)
            ->where('code', $request->code)
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'رمز التحقق غير صحيح'], 401);
        }

        if ($otp->isExpired()) {
            $otp->delete();
            return response()->json(['message' => 'انتهت صلاحية رمز التحقق'], 401);
        }

        // OTP is valid – delete it and authenticate
        $otp->delete();

        $user = User::where('phone', $request->phone)->firstOrFail();
        $token = $user->createToken('auth-token', [$user->role])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user->load('teacher'),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('teacher'));
    }

    private function sendSms($message, $phone)
    {
        $sender = 'MAWWAL';
        $url = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';
        $postData = [
            "Data" => [
                "Message" => $message,
                "Recipients" => [
                    [
                        "Phone" => $phone
                    ]
                ],
                "Settings" => [
                    "Sender" => $sender
                ]
            ]
        ];

        $headers = [
            'Content-Type: application/json',
            'Authorization: Basic ZWxpbWlzaHJha2k6YzA3MDI5YWItN2VkZi00Y2UxLThhMWQtMDUzZmE0YjY2YjQw' // replace 'Your Base Credentials' with your actual credentials
        ];

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);

        if ($response === false) {
            Log::error('SMS Error: ' . curl_error($ch));
        }

        curl_close($ch);

        return $response;
    }
}
