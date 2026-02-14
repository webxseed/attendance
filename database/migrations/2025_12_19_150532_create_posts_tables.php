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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('headline');
            $table->text('topic')->nullable();
            $table->timestamps();
        });

        Schema::create('post_carousels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            $table->text('content'); // Paragraph content
            $table->string('image_path')->nullable();
            $table->integer('position')->default(1);
            $table->text('image_prompt')->nullable(); // Store the prompt used for image generation
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_carousels');
        Schema::dropIfExists('posts');
    }
};
