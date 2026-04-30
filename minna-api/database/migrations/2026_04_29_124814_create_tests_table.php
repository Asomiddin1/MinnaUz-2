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
            $table->string('title'); 
            $table->string('level'); 
            $table->string('type');  
            $table->string('audio_url')->nullable();
            $table->boolean('is_premium')->default(false); 

            // 👇 SHU IKKITA QATOR QO'SHILDI 👇
            $table->integer('time')->default(105); // Test vaqti (daqiqa)
            $table->integer('pass_score')->default(50); // O'tish balli (foizda)

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
