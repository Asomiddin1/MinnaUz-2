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
       Schema::create('grammars', function (Blueprint $table) {
            $table->id();
            // Agar "levels" jadvalingiz bo'lsa, bog'laymiz
            $table->foreignId('level_id')->constrained()->onDelete('cascade'); 
            $table->string('title'); // Masalan: ~てもいいです
            $table->string('meaning')->nullable(); // Ma'nosi: ...sa ham bo'ladi
            $table->text('description')->nullable(); // Qisqacha tushuntirish
            $table->json('examples')->nullable(); // Namunalar (JSON)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grammars');
    }
};
