<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('login_histories', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->date('login_date'); // YYYY-MM-DD formatida saqlaymiz (kalendar uchun eng qulayi)
        $table->timestamps();

        // Bitta user bir kunda 10 marta kirsa ham, bazada faqat 1 ta yozuv bo'lishi uchun unique qilamiz
        $table->unique(['user_id', 'login_date']); 
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_histories');
    }
};
