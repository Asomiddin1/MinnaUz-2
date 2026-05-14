<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('video_lessons', function (Blueprint $table) {
            $table->id();
            // Video ma'lumotlari
            $table->string('category'); // "Yaponiyada hayot", "Anime tili" va hk.
            $table->string('title');
            $table->string('thumbnail')->nullable();
            $table->text('description')->nullable();
            $table->string('youtube_id')->nullable(); // Agar youtube'dan bo'lsa
            
            // Statistika
            $table->integer('views')->default(0); // Ko'rishlar soni
            
            // Transkriptsiya (Vaxti va Matni bilan) - JSON ko'rinishida saqlaymiz
            $table->json('transcript')->nullable(); 

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('video_lessons');
    }
};