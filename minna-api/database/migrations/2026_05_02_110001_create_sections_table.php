<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->string('name'); // Moji-Goi, Choukai, ...
            $table->string('type'); // vocabulary, grammar_reading, listening, language_knowledge_reading
            $table->integer('order')->default(0); // tartib raqami
            $table->integer('time_limit')->nullable()->default(0); // daqiqalarda, ixtiyoriy
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};