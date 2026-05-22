<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grammars', function (Blueprint $table) {
            $table->json('title')->change();
            $table->json('meaning')->nullable()->change();
            $table->json('description')->nullable()->change();
            $table->json('examples')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('grammars', function (Blueprint $table) {
            $table->string('title')->change();
            $table->text('meaning')->nullable()->change();
            $table->text('description')->nullable()->change();
            $table->text('examples')->nullable()->change();
        });
    }
};