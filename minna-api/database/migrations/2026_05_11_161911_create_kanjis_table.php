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
       Schema::create('kanjis', function (Blueprint $table) {
    $table->id();
    $table->foreignId('level_id')->constrained();
    $table->string('character'); // 字
    $table->string('meaning'); // Manosi
    $table->string('kunyomi')->nullable();
    $table->string('onyomi')->nullable();
    $table->text('examples')->nullable(); // JSON yoki text formatda misollar
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kanjis');
    }
};
