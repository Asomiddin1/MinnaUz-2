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
       Schema::create('levels', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique(); // n5, n4, hira-kata
    $table->string('title');
    $table->json('tags')->nullable(); // ["N5 Kanji", "Listening"]
    $table->string('video_count')->nullable();
    $table->integer('lesson_count')->default(0);
    $table->text('description')->nullable(); // Kurs haqida ma'lumot
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('levels');
    }
};
