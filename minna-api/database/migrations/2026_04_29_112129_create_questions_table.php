<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->integer('mondai_number');
            $table->integer('question_number'); // <-- bu ustun yo'q edi, endi bor
            $table->string('type'); // kanji_reading, vocabulary, grammar, reading, listening, star...
            $table->text('question_text');
            $table->text('passage')->nullable();
            $table->text('audio_path')->nullable();
            $table->text('image_path')->nullable();
            $table->json('options'); // JSON ustuni (massiv saqlash uchun)
            $table->string('correct_answer');
            $table->integer('points')->default(2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};