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
        Schema::create('vocabularies', function (Blueprint $table) {
            $table->id();
            // Qaysi darajaga (N5, N4) tegishli ekanligi
            $table->foreignId('level_id')->constrained()->cascadeOnDelete(); 
            
            $table->string('word'); // Yaponcha so'z (masalan: 食べる yoki たべる)
            $table->string('reading')->nullable(); // O'qilishi (Agar word kanjida bo'lsa, bu yerda hiraganasi turadi)
            $table->string('meaning'); // O'zbekcha ma'nosi (masalan: yemoq)
            $table->string('type')->nullable(); // So'z turkumi (masalan: fe'l, ot, sifat)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabularies');
    }
};
