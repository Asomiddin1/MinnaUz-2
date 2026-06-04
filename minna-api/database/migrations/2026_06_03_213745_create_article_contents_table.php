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
        Schema::create('article_contents', function (Blueprint $table) {
        $table->id();
        $table->foreignId('article_id')->constrained()->cascadeOnDelete();
        $table->integer('paragraph_index')->default(1); // <-- Xatboshini ajratish uchun
        $table->integer('sentence_index')->default(1);  // <-- Gapni ajratish uchun
        $table->integer('sort_order'); 
        $table->string('word');
        $table->string('furigana')->nullable();
        $table->string('translation')->nullable();
        $table->string('grammar')->nullable();
        $table->string('level')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_contents');
    }
};
