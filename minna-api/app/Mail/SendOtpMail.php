<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otpCode;

    public function __construct($otpCode)
    {
        $this->otpCode = $otpCode;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Platformaga kirish uchun tasdiqlash kodi',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
            <div style='font-family: Arial, sans-serif; padding: 20px;'>
                <h2>Assalomu alaykum!</h2>
                <p>Platformamizga xush kelibsiz. Hisobingizni tasdiqlash uchun quyidagi kodni kiriting:</p>
                <h1 style='color: #4F46E5; letter-spacing: 5px;'>{$this->otpCode}</h1>
                <p style='color: #666;'>Ushbu kod 10 daqiqa davomida amal qiladi. Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
            </div>"
        );
    }
}