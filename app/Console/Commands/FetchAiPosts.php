<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Models\Post;
use App\Models\PostCarousel;
use Illuminate\Support\Str;

class FetchAiPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:fetch-posts {--generate-images : Also generate images immediately}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch daily AI and Tech hacks posts from OpenAI';

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

        $this->info("Fetching AI posts...");

        try {
            $postsData = $this->fetchFromOpenAI($apiKey);
            
            foreach ($postsData as $postData) {
                $this->savePost($postData, $apiKey);
            }

            $this->info('Successfully fetched and saved posts.');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    protected function fetchFromOpenAI($apiKey)
    {
        $currentDate = now()->format('Y-m-d');
        $currentMonth = now()->format('F Y');
        
        // Get existing post headlines to avoid duplicates
        $existingHeadlines = Post::pluck('headline')->toArray();
        $existingHeadlinesText = '';
        if (!empty($existingHeadlines)) {
            $existingHeadlinesText = "\n\n## ⚠️ تجنب التكرار - لا تنشئ بوستات بعناوين مشابهة لهذه:\n" . implode("\n", array_slice($existingHeadlines, -50));
        }
        
        $prompt = <<<PROMPT
أنشئ 10 منشورات انستغرام خرافية ومثيرة عن الذكاء الاصطناعي (AI) بمحتوى قيّم جداً ومبهر، مع التركيز التام على **أمثلة من واقع الحياة** (Real Life Examples).

## 🎯 المواضيع المطلوبة (نوع بين هذه الفئات):
1. **🆕 أدوات AI جديدة ومفيدة:** تطبيقات عملية تسهل الحياة اليومية أو العمل.
2. **📈 تريندات وتوجهات AI:** كيف نطبق الذكاء الاصطناعي في الواقع العملي اليوم.
3. **📰 أخبار ومستجدات AI:** إطلاقات ثورية وتأثيرها المباشر علينا.
4. **🔥 Prompts وحيل (Hacks):** سيناريوهات واقعية لاستخدام ChatGPT للحصول على نتائج مبهرة.

## ⚠️ الهيكل الإلزامي لكل منشور (5 Carousels):
يجب أن يتكون كل منشور من **5 شرائح (Carousels)** بالضبط بهذا الترتيب:

1. **Carousel 1: COMPELLING HEADLINE**
   - عنوان ناري يوقف القارئ عن التمرير (3-6 كلمات + إيموجي).
   - محتوى تشويقي يمهد للموضوع بروح حماسية.

2. **Carousel 2: Description**
   - شرح مبسط للفكرة أو الأداة أو المشكلة في الواقع.
   - لماذا هذا الموضوع مهم لك الآن؟

3. **Carousel 3: VALUABLE CONTENT #1**
   - أول جزء من القيمة العملية (خطوات، مميزات، أو جزء من الـ Prompt).
   - يجب أن يكون مثالاً حقيقياً قابلاً للتطبيق.

4. **Carousel 4: VALUABLE CONTENT #2**
   - استكمال القيمة (بقية الخطوات، الـ Prompt الكامل، أو نتيجة مذهلة للأداة).
   - تعميق الفائدة بمثال واقعي آخر أو تفاصيل تقنية مبهرة.

5. **Carousel 5: COMPELLING AND MOTIVATING ENDING**
   - عنوان محفز (مثلاً: "🚀 مستقبلك يبدأ الآن!").
   - نص حماسي جداً يدفع القارئ للتوقف عن المشاهدة والبدء في التنفيذ فوراً مع سؤال تفاعلي للجمهور.

## ⚠️ القواعد الذهبية:
- **أمثلة واقعية:** لا تتحدث في المطلق، اذكر حالات استخدام حقيقية (مثلاً: "كيف استخدم مهندس في دبي الـ AI ليكمل شغل 10 ساعات في ساعة").
- **Prompts للنسخ:** اذكر الـ prompt كاملاً بين علامات تنصيص في خانة الـ description لمشاريع/حالات واقعية.
- **لغة نارية:** استخدم أسلوباً حماسياً، مباشراً، ومؤثراً.

{$existingHeadlinesText}

---

أخرج JSON فقط مع 10 posts متنوعة، كل post يحتوي على 5 carousels بهذا التنسيق:
{
  "posts": [
    {
      "headline": "عنوان Post الرئيسي ناري",
      "carousels": [
        {"title": "🚨 HEADLINE", "content": "محتوى تشويقي ناري...", "description": "سياق قصير...", "image_prompt": "Cinematic visual Description..."},
        {"title": "📝 DESCRIPTION", "content": "شرح الفكرة من الواقع...", "description": "تفصيل إضافي...", "image_prompt": "Explanatory visual description..."},
        {"title": "💡 VALUE #1", "content": "أول معلومة قيّمة حقيقية...", "description": "Prompt أو رابط أو خطوة...", "image_prompt": "Dynamic visual description..."},
        {"title": "🔥 VALUE #2", "content": "ثاني معلومة قيّمة ومبهرة...", "description": "الـ Prompt الكامل للنسخ أو تفصيل الخبر...", "image_prompt": "Deep dive visual description..."},
        {"title": "🚀 MOTIVATING ENDING", "content": "صرخة للعمل (Call to Action) وتحفيز مجنون...", "image_prompt": "Inspirational and high-energy visual description..."}
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
                    'content' => 'أنت خبير في أخبار وتحديثات الذكاء الاصطناعي. تكتب محتوى احترافي عن ChatGPT، Claude، Gemini وأدوات AI الأخرى. أسلوبك مباشر ومحكي. أخرج JSON صالح فقط. You are an AI news expert writing professional content about ChatGPT, Claude, Gemini and other AI tools. Your style is direct and conversational. Output valid JSON only.'
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
            'topic' => 'AI/Tech Hacks'
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
            
            // Only generate images if explicitly requested
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
                'prompt' => $carousel->image_prompt . ", digital art style, high quality, 4k, suitable for social media background",
                'n' => 1,
                'size' => '1024x1024',
                'quality' => 'standard',
            ]);

            if ($response->successful()) {
                $url = $response->json()['data'][0]['url'] ?? null;
                if ($url) {
                    $contents = Http::get($url)->body();
                    $filename = 'ai-posts/post-' . $carousel->post_id . '-carousel-' . $carousel->id . '-' . Str::random(6) . '.png';
                    
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
