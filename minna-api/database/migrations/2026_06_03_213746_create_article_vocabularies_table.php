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
       Schema::create('article_vocabularies', function (Blueprint $table) {
        $table->id();
        $table->foreignId('article_id')->constrained()->cascadeOnDelete();
        $table->string('kanji');
        $table->string('furigana')->nullable();
        $table->string('meaning');
        $table->string('type'); // Noun, Verb
        $table->string('level'); // N5
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_vocabularies');
    }
};
