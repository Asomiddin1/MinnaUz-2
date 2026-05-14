<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('vocabularies', function (Blueprint $table) {
            // "type" ustunidan keyin "examples" ustunini qo'shish
            $table->json('examples')->nullable()->after('type'); 
        });
    }

    public function down()
    {
        Schema::table('vocabularies', function (Blueprint $table) {
            $table->dropColumn('examples'); // Orqaga qaytarganda ustunni o'chiradi
        });
    }
};