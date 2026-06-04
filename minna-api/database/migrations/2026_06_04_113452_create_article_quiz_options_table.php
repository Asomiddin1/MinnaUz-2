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
      Schema::create('article_quiz_options', function (Blueprint $table) {
        $table->id();
        $table->foreignId('article_quiz_id')->constrained()->cascadeOnDelete();
        $table->string('option_text'); // Variant matni (A, B, C, D)
        $table->boolean('is_correct')->default(false); // To'g'ri javobmi?
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_quiz_options');
    }
};
