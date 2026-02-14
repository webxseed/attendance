<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Post;
use App\Models\PostCarousel;
use Illuminate\Support\Str;

class FetchSciFiTechPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tech:fetch-scifi {--generate-images : Also generate images immediately}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch daily Sci-Fi movies, futuristic tools, and tech news';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $apiKey = config('services.openai.key');

        if (!$apiKey) {
            $this->error('OPENAI_API_KEY is not configured in services.openai.key');
            return 1;
        }

        $this->info("Fetching Sci-Fi and Futuristic Tech posts...");

        try {
            $postsData = $this->fetchFromOpenAI($apiKey);
            
            foreach ($postsData as $postData) {
                $this->savePost($postData, $apiKey);
            }

            $this->info('Successfully fetched and saved Sci-Fi tech posts.');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    protected function fetchFromOpenAI($apiKey)
    {
        // Get existing post headlines to avoid duplicates
        $existingHeadlines = Post::where('topic', 'Sci-Fi & Future Tech')->pluck('headline')->toArray();
        $existingHeadlinesText = '';
        if (!empty($existingHeadlines)) {
            $existingHeadlinesText = "\n\n## ⚠️ تجنب التكرار - لا تنشئ بوستات بعناوين مشابهة لهذه:\n" . implode("\n", array_slice($existingHeadlines, -50));
        }
        
        $prompt = <<<PROMPT
أنشئ 10 منشورات انستغرام خرافية ومثيرة عن عالم الـ Sci-Fi، السينما المستقبلية، وأدوات المستقبل (Futuristic Tools)، مع التركيز على **أمثلة حقيقية** وتطبيقات عملية من الواقع المعاصر أو القريب جداً.

## 🎯 المواضيع المطلوبة (نوع بين هذه الفئات):
1. **🎬 سينما Sci-Fi مظلمة ومبهرة:** أعطِ Prompts ذكية لاستكشاف أفلام بمفاهيم غريبة ومثيرة (مثل Superman الشرير، عوالم موازية).
2. **🦾 أدوات المستقبل (VR, MR, Brain-Chips):** تغطية أحدث ما وصل إليه العلم في الواقع المعزز، واجهات الدماغ، والبدلات الآلية وتطبيقاتها الحقيقية اليوم.
3. **🌌 محتوى Sci-Fi فلسفي:** نظريات السفر عبر الزمن، المفارقات الكونية، والذكاء الاصطناعي الواعي.
4. **⚙️ Tech News & Hacks:** أخبار تقنية ثورية وحيل تجعل حياتك تبدو كأنها من عام 2050 بناءً على تقنيات موجودة فعلاً.

## ⚠️ الهيكل الإلزامي لكل منشور (5 Carousels):
يجب أن يتكون كل منشور من **5 شرائح (Carousels)** بالضبط بهذا الترتيب:

1. **Carousel 1: COMPELLING HEADLINE**
   - عنوان ناري يوقف القارئ (3-6 كلمات + إيموجي).
   - محتوى تشويقي يمهد للموضوع بروح حماسية.

2. **Carousel 2: Description**
   - شرح مبسط للفكرة أو الأداة أو الخبر في سياق واقعي.
   - لماذا هذا المستقبل مذهل أو مرعب؟

3. **Carousel 3: VALUABLE CONTENT #1**
   - أول جزء من القيمة العملية (خطوات، مميزات، أو جزء من الـ Prompt).
   - مثال حقيقي لمختبر أو شركة أو تقنية قيد التطوير.

4. **Carousel 4: VALUABLE CONTENT #2**
   - استكمال القيمة (الـ Prompt الكامل للنسخ، أو تفاصيل تقنية مبهرة).
   - تعميق الفائدة بمثال واقعي آخر أو نتيجة "مستقبلية" نعيشها اليوم.

5. **Carousel 5: COMPELLING AND MOTIVATING ENDING**
   - عنوان محفز (مثلاً: "🚀 المستقبل بدأ الآن!").
   - نص حماسي جداً يدفع القارئ للتفاعل والبدء في استكشاف هذا العالم مع سؤال تفاعلي.

## ⚠️ القواعد الذهبية:
- **أمثلة واقعية:** اذكر تقنيات حقيقية (مثل Neuralink، Apple Vision Pro، أو تجارب ناسا).
- **لغة نارية:** استخدم أسلوباً حماسياً، سينمائياً، ومؤثراً.

{$existingHeadlinesText}

---

أخرج JSON فقط مع 10 posts متنوعة، كل post يحتوي على 5 carousels بهذا التنسيق:
{
  "posts": [
    {
      "headline": "عنوان ناري ومثير مع إيموجي",
      "carousels": [
        {"title": "🚨 HEADLINE", "content": "محتوى تشويقي ناري...", "description": "سياق قصير...", "image_prompt": "Cinematic sci-fi visual..."},
        {"title": "📝 DESCRIPTION", "content": "شرح الفكرة من الواقع...", "description": "تفصيل إضافي...", "image_prompt": "Futuristic tool visual..."},
        {"title": "💡 VALUE #1", "content": "أول معلومة قيّمة حقيقية...", "description": "Prompt أو خطوة...", "image_prompt": "High-tech visual..."},
        {"title": "🔥 VALUE #2", "content": "ثاني معلومة قيّمة ومبهرة...", "description": "الـ Prompt الكامل للنسخ أو تفصيل الخبر...", "image_prompt": "Advanced tech depth visual..."},
        {"title": "🚀 MOTIVATING ENDING", "content": "نص حماسي جداً يدفع للتفاعل الفوري...", "image_prompt": "Inspirational future vision visual..."}
      ]
    }
  ]
}
PROMPT;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(180)->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o',
            'max_tokens' => 16000,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'أنت خبير في سينما الـ Sci-Fi والتقنيات المستقبلية. تكتب محتوى يجمع بين الإثارة والذكاء. أخرج JSON صالح فقط.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'response_format' => ['type' => 'json_object']
        ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI API request failed: ' . $response->body());
        }

        $result = $response->json();
        $content = $result['choices'][0]['message']['content'] ?? null;
        
        if (!$content) {
            throw new \Exception('No content in OpenAI response');
        }

        $parsed = json_decode($content, true);
        return $parsed['posts'] ?? [];
    }

    protected function savePost($data, $apiKey)
    {
        $post = Post::create([
            'headline' => $data['headline'],
            'topic' => 'Sci-Fi & Future Tech'
        ]);

        $this->info("Saved Post: {$post->headline}");

        foreach ($data['carousels'] as $index => $carouselItem) {
            $carousel = PostCarousel::create([
                'post_id' => $post->id,
                'title' => $carouselItem['title'] ?? null,
                'description' => $carouselItem['content'],
                'content' => $carouselItem['description'] ?? null,
                'image_prompt' => $carouselItem['image_prompt'] ?? null,
                'position' => $index + 1
            ]);
            
            if ($this->option('generate-images') && $carousel->image_prompt) {
                $this->generateImage($carousel, $apiKey);
            }
        }
    }

    protected function generateImage(PostCarousel $carousel, $apiKey)
    {
        $this->info("  Generating image for carousel #{$carousel->position}...");

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post('https://api.openai.com/v1/images/generations', [
                'model' => 'dall-e-3',
                'prompt' => $carousel->image_prompt . ", cinematic, sci-fi style, highly detailed, 4k, futurism",
                'n' => 1,
                'size' => '1024x1024',
                'quality' => 'standard',
            ]);

            if ($response->successful()) {
                $url = $response->json()['data'][0]['url'] ?? null;
                if ($url) {
                    $contents = Http::get($url)->body();
                    $filename = 'scifi-posts/post-' . $carousel->post_id . '-carousel-' . $carousel->id . '-' . Str::random(6) . '.png';
                    
                    Storage::disk('public')->put($filename, $contents);
                    
                    $carousel->update(['image_path' => $filename]);
                    $this->info("  ✓ Image saved: $filename");
                }
            } else {
                $this->error("  Failed to generate image: " . $response->body());
            }

        } catch (\Exception $e) {
            $this->error("  Error generating image: " . $e->getMessage());
        }
    }
}
