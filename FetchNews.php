<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Modules\Posts\Entities\GptPost;
use Carbon\Carbon;

class FetchCoffeeNews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coffee:fetch-news 
                            {--count=5 : Number of news articles to fetch}
                            {--lang=ar : Language for the news (ar, en, he)}
                            {--force : Force fetch even if already fetched today}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch daily coffee news from around the world using OpenAI API';

    /**
     * OpenAI API endpoint
     */
    protected $openAiEndpoint = 'https://api.openai.com/v1/chat/completions';

    /**
     * Language configurations
     */
    protected $languageConfigs = [
        'ar' => [
            'name' => 'Arabic',
            'native' => 'العربية',
            'direction' => 'rtl',
            'system_prompt' => 'أنت باحث وصحفي محترف متخصص في صناعة القهوة. تقدم معلومات دقيقة وحالية عن سوق القهوة العالمي، بما في ذلك الأسعار والاتجاهات والأحداث وأخبار الصناعة. اكتب دائمًا باللغة العربية الفصحى. أجب دائمًا بصيغة JSON صالحة فقط.',
        ],
        'en' => [
            'name' => 'English',
            'native' => 'English',
            'direction' => 'ltr',
            'system_prompt' => 'You are a professional coffee industry news researcher and journalist. You provide accurate, current information about the global coffee market, including prices, trends, events, and industry news. Always respond with valid JSON only.',
        ],
        'he' => [
            'name' => 'Hebrew',
            'native' => 'עברית',
            'direction' => 'rtl',
            'system_prompt' => 'אתה חוקר ועיתונאי מקצועי בתעשיית הקפה. אתה מספק מידע מדויק ועדכני על שוק הקפה העולמי, כולל מחירים, מגמות, אירועים וחדשות התעשייה. כתוב תמיד בעברית תקנית. ענה תמיד בפורמט JSON תקין בלבד.',
        ],
    ];

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $lang = $this->option('lang');
        $count = $this->option('count');
        $force = $this->option('force');

        $langConfig = $this->languageConfigs[$lang] ?? $this->languageConfigs['ar'];

        $this->info("Starting coffee news fetch in {$langConfig['name']} ({$langConfig['native']})...");

        $apiKey = config('services.openai.key');


        if (!$apiKey) {
            $this->error('OPENAI_API_KEY is not set in .env file');
            return 1;
        }

        $today = Carbon::now()->format('Y-m-d');

        // Check if we already fetched news today (unless forced)
        if (!$force) {
            $existingToday = GptPost::whereDate('fetched_date', $today)->where('lang', $lang)->count();
            if ($existingToday >= $count) {
                $this->info("Already fetched {$existingToday} {$langConfig['name']} articles today. Use --force to override.");
                return 0;
            }
        }

        try {
            $news = $this->fetchNewsFromOpenAI($apiKey, $count, $today, $lang, $langConfig);

            if (empty($news)) {
                $this->warn('No news articles returned from OpenAI');
                return 1;
            }

            $this->info("Received " . count($news) . " news articles");

            foreach ($news as $article) {
                $this->saveArticle($article, $today, $lang);
            }

            $this->info('Coffee news fetch completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error fetching news: ' . $e->getMessage());
            Log::error('Coffee News Fetch Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Fetch news from OpenAI API
     */
    protected function fetchNewsFromOpenAI($apiKey, $count, $today, $lang, $langConfig)
    {
        $prompt = $this->buildPrompt($count, $today, $lang, $langConfig);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(180)->post($this->openAiEndpoint, [
                    'model' => 'gpt-4o',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $langConfig['system_prompt']
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 6000,
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

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse OpenAI response as JSON');
        }

        return $parsed['articles'] ?? $parsed['news'] ?? $parsed['مقالات'] ?? [];
    }

    /**
     * Build the prompt for OpenAI based on language
     */
    protected function buildPrompt($count, $today, $lang, $langConfig)
    {
        if ($lang === 'ar') {
            return $this->buildArabicPrompt($count, $today);
        } elseif ($lang === 'he') {
            return $this->buildHebrewPrompt($count, $today);
        }

        return $this->buildEnglishPrompt($count, $today);
    }

    /**
     * Build Arabic prompt
     */
    protected function buildArabicPrompt($count, $today)
    {
        return <<<PROMPT
أنشئ {$count} مقالات إخبارية فريدة وواقعية عن صناعة القهوة لليوم ({$today}).

يجب أن تكون المقالات باللغة العربية الفصحى.

ركز على مواضيع متنوعة تشمل:
- أسعار القهوة في الأسواق العالمية (عقود أرابيكا وروبوستا الآجلة)
- أخبار إنتاج القهوة من المناطق الرئيسية (البرازيل، كولومبيا، فيتنام، إثيوبيا، اليمن، إلخ)
- أخبار شركات القهوة والاندماجات والاستحواذات
- تأثير الاستدامة وتغير المناخ على القهوة
- المنتجات والابتكارات والاتجاهات الجديدة في عالم القهوة
- اتجاهات استهلاك القهوة حول العالم
- أخبار زراعة القهوة والأخبار الزراعية
- أخبار القهوة العربية والقهوة في الشرق الأوسط

لكل مقال، قدم:
1. title: عنوان خبري جذاب (60-100 حرف)
2. description: ملخص مختصر (150-250 حرف)
3. content: محتوى المقال الكامل (300-500 كلمة) مع فقرات منظمة
4. source: اسم مصدر إخباري واقعي (مثل "رويترز العربية"، "القهوة اليوم"، "بلومبرج الشرق"، "تقرير القهوة العالمي")
5. image_description: وصف بالإنجليزية لصورة مناسبة لهذا المقال (لتوليد صورة بالذكاء الاصطناعي)

أرجع النتيجة بصيغة JSON بالضبط كالتالي:
{
    "articles": [
        {
            "title": "عنوان المقال هنا",
            "description": "ملخص مختصر هنا",
            "content": "محتوى المقال الكامل هنا مع عدة فقرات...",
            "source": "اسم المصدر",
            "image_description": "Description in English for AI image generation"
        }
    ]
}

اجعل المقالات تبدو احترافية وواقعية وحالية. نوّع في أسلوب الكتابة حسب نوع المصدر.
PROMPT;
    }

    /**
     * Build Hebrew prompt
     */
    protected function buildHebrewPrompt($count, $today)
    {
        return <<<PROMPT
צור {$count} כתבות חדשות ייחודיות ומציאותיות על תעשיית הקפה להיום ({$today}).

הכתבות חייבות להיות בעברית תקנית.

התמקד בנושאים מגוונים הכוללים:
- מחירי קפה ומסחר (חוזים עתידיים של ערביקה ורובוסטה)
- חדשות ייצור קפה מאזורים מרכזיים (ברזיל, קולומביה, וייטנאם, אתיופיה וכו')
- חדשות חברות קפה, מיזוגים ורכישות
- קיימות והשפעות שינויי האקלים על הקפה
- מוצרי קפה חדשים, חידושים ומגמות
- מגמות צריכת קפה ברחבי העולם
- חדשות חקלאות וגידול קפה

לכל כתבה, ספק:
1. title: כותרת מושכת (60-100 תווים)
2. description: סיכום קצר (150-250 תווים)
3. content: תוכן מלא של הכתבה (300-500 מילים) עם פסקאות
4. source: שם מקור חדשותי מציאותי (למשל "גלובס", "דה מרקר כלכלה", "רויטרס ישראל")
5. image_description: תיאור באנגלית לתמונה מתאימה לכתבה זו

החזר כ-JSON בפורמט הבא:
{
    "articles": [
        {
            "title": "כותרת כאן",
            "description": "סיכום קצר כאן",
            "content": "תוכן מלא כאן...",
            "source": "שם המקור",
            "image_description": "Description in English for AI image generation"
        }
    ]
}
PROMPT;
    }

    /**
     * Build English prompt
     */
    protected function buildEnglishPrompt($count, $today)
    {
        return <<<PROMPT
Generate {$count} unique, realistic coffee industry news articles for today ({$today}). 

Focus on diverse topics including:
- Coffee market prices and trading (Arabica, Robusta futures)
- Coffee production news from major regions (Brazil, Colombia, Vietnam, Ethiopia, etc.)
- Coffee company news, mergers, and acquisitions
- Sustainability and climate change impacts on coffee
- New coffee products, innovations, and trends
- Coffee consumption trends worldwide
- Coffee farming and agricultural news

For each article, provide:
1. title: A compelling news headline (60-100 characters)
2. description: A brief summary/excerpt (150-250 characters)
3. content: Full article content (300-500 words) with proper paragraphs
4. source: A realistic news source name (e.g., "Reuters", "Coffee Business Daily", "Bloomberg Commodities", "World Coffee Report")
5. image_description: A description of an appropriate image for this article (for AI image generation)

Return as JSON in this exact format:
{
    "articles": [
        {
            "title": "Article headline here",
            "description": "Brief summary here",
            "content": "Full article content here with multiple paragraphs...",
            "source": "Source Name",
            "image_description": "Description of an ideal image for this article"
        }
    ]
}

Make the articles sound professional, factual, and current. Vary the writing style based on the source type.
PROMPT;
    }

    /**
     * Save an article to the database
     */
    protected function saveArticle($article, $today, $lang)
    {
        $title = $article['title'] ?? '';
        $description = $article['description'] ?? '';
        $content = $article['content'] ?? '';
        $source = $article['source'] ?? 'AI Generated';
        $imageDescription = $article['image_description'] ?? '';

        if (empty($title)) {
            $this->warn('Skipping article with empty title');
            return;
        }

        // Generate slug (transliterate Arabic/Hebrew if needed)
        $slug = Str::slug($title);
        if (empty($slug)) {
            // For non-Latin scripts, create a slug from timestamp and random string
            $slug = 'coffee-news-' . $lang . '-' . time() . '-' . Str::random(5);
        }

        // Check for duplicate
        $existing = GptPost::where('slug', $slug)->first();
        if ($existing) {
            $slug = $slug . '-' . time();
        }

        // Create the article - store the content in the appropriate language key
        $nameArray = ['en' => '', 'ar' => '', 'he' => ''];
        $descArray = ['en' => '', 'ar' => '', 'he' => ''];
        $contentArray = ['en' => '', 'ar' => '', 'he' => ''];

        $nameArray[$lang] = $title;
        $descArray[$lang] = $description;
        $contentArray[$lang] = $content;

        $gptPost = GptPost::create([
            'name' => $nameArray,
            'description' => $descArray,
            'content' => $contentArray,
            'source' => $source,
            'source_url' => null,
            'image' => null,
            'slug' => $slug,
            'lang' => $lang,
            'active' => 1,
            'fetched_date' => $today,
            'meta_tags' => [
                'image_description' => $imageDescription,
            ]
        ]);

        $this->info("  ✓ Saved: {$title}");
    }
}
