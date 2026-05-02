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
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Test nomi (masalan: 2024 Mock Test)
            $table->enum('level', ['N1', 'N2', 'N3', 'N4', 'N5']); // JLPT darajasi
            $table->boolean('is_premium')->default(false); // Premium yoki tekin
            
            // Frontend (Next.js) bilan bir xil nomlangan ustunlar:
            $table->integer('time')->default(105); // Test uchun ajratilgan vaqt (minutda)
            $table->integer('pass_score')->default(80); // O'tish balli (foizda yoki ballda)
            
            $table->string('audio_url')->nullable(); // Test audiosi uchun yo'l
            $table->text('description')->nullable(); // Qisqacha ma'lumot
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};