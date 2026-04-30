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
      Schema::create('questions', function (Blueprint $table) {
    $table->id();
    // 👇 MANA BU SUTUN QO'SHILISHI SHART!
    $table->foreignId('test_id')->constrained()->onDelete('cascade'); 
    
    $table->string('type'); 
    $table->string('level'); 

    $table->text('question');
    $table->json('options');
    $table->string('answer');

    $table->text('text')->nullable();
    $table->string('audio_url')->nullable();
    $table->integer('time')->nullable(); 

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
