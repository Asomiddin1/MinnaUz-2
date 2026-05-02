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
       Schema::create('exam_results', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('test_id')->constrained()->onDelete('cascade');
    $table->unsignedInteger('total_questions');
    $table->unsignedInteger('correct_count');
    $table->unsignedInteger('wrong_count');
    $table->unsignedInteger('unanswered_count');
    $table->unsignedInteger('score');
    $table->boolean('passed');
    $table->unsignedInteger('time_spent')->default(0);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
