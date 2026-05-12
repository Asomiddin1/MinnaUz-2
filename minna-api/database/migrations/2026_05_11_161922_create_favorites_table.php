<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            // Kim saqladi?
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Qaysi darsni saqladi?
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            
            $table->timestamps();

            // MANTIQIY HIMOYA: Bitta user bitta darsni faqat 1 marta saqlay olishi uchun
            $table->unique(['user_id', 'lesson_id']); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
