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
        Schema::create('article_stats', function (Blueprint $table) {
        $table->id();
        $table->foreignId('article_id')->constrained()->cascadeOnDelete();
        $table->string('level'); // N5, N4, etc.
        $table->integer('percent');
        $table->string('color'); // bg-[#3B704E]
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_stats');
    }
};
