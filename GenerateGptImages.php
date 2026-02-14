<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Modules\Posts\Entities\GptPost;

class GenerateGptImages extends Command
{
    protected $signature = 'coffee:generate-images {--id= : Specific post ID to generate image for} {--all : Generate for all posts without images}';
    protected $description = 'Generate images for GPT posts using DALL-E 3';

    public function handle()
    {
        $apiKey = config('services.openai.key');


        if (!$apiKey) {
            $this->error('OPENAI_API_KEY is not configured');
            return 1;
        }

        if ($this->option('id')) {
            $post = GptPost::find($this->option('id'));
            if (!$post) {
                $this->error('Post not found');
                return 1;
            }
            return $this->generateForPost($post, $apiKey);
        }

        if ($this->option('all')) {
            $posts = GptPost::whereNull('image')->orWhere('image', '')->get();
            $this->info("Found {$posts->count()} posts without images");

            foreach ($posts as $index => $post) {
                if ($index > 0) {
                    $this->info("Waiting 2 seconds...");
                    sleep(2);
                }
                $this->generateForPost($post, $apiKey);
            }
            return 0;
        }

        // Default: generate for first post without image
        $post = GptPost::whereNull('image')->orWhere('image', '')->first();
        if (!$post) {
            $this->info('All posts already have images');
            return 0;
        }
        return $this->generateForPost($post, $apiKey);
    }

    protected function generateForPost(GptPost $post, $apiKey)
    {
        $this->info("Generating image for post #{$post->id}: {$post->label}");

        $imageDescription = $post->meta_tags['image_description'] ?? null;

        if (!$imageDescription) {
            $title = $post->name['en'] ?? $post->name['ar'] ?? $post->label;
            $imageDescription = "A professional photograph related to: {$title}. Coffee industry, business news style.";
        }

        $this->info("Prompt: {$imageDescription}");

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(120)->post('https://api.openai.com/v1/images/generations', [
                        'model' => 'dall-e-3',
                        'prompt' => $imageDescription . " Professional photography style, suitable for a news article about coffee industry.",
                        'n' => 1,
                        'size' => '1024x1024',
                        'quality' => 'standard',
                    ]);

            if (!$response->successful()) {
                $this->error('API Error: ' . $response->body());
                return 1;
            }

            $result = $response->json();
            $imageUrl = $result['data'][0]['url'] ?? null;

            if (!$imageUrl) {
                $this->error('No image URL in response');
                return 1;
            }

            $this->info('Downloading image...');
            $imageContent = Http::get($imageUrl)->body();
            $filename = 'gpt-' . $post->id . '-' . time() . '.png';

            if (!Storage::disk('public')->exists('gpt-images')) {
                Storage::disk('public')->makeDirectory('gpt-images');
            }

            Storage::disk('public')->put('gpt-images/' . $filename, $imageContent);

            $post->update(['image' => 'gpt-images/' . $filename]);

            $this->info("✓ Image saved: {$filename}");
            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }
}
