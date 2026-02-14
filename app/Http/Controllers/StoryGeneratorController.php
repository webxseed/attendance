<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use App\Models\Post;

class StoryGeneratorController extends Controller
{
    /**
     * Default configuration for stories
     */
    private array $config = [
        'width' => 1080,
        'height' => 1920,
        'format' => 'story', // story or post
        'logo' => 'logo.png',
        'brand_name' => 'Qadra Labs',
        'brand_handle' => '@qadralabs',
        'brand_verified' => true,
        'hasLogo' => 0
    ];

    /**
     * Format dimensions
     */
    private array $formatDimensions = [
        'story' => ['width' => 1080, 'height' => 1920],
        'post' => ['width' => 1080, 'height' => 1350],
    ];

    /**
     * Show the story generator form
     */
    public function index(Request $request): View
    {
        $bulkText = '';
        $storiesFromPost = [];
        
        // Check if we have a post parameter
        if ($request->has('post')) {
            $post = Post::with('carousels')->find($request->get('post'));
            
            if ($post && $post->carousels->count() > 0) {
                // First story: the headline
                $storiesFromPost[] = [
                    'text' => $this->addRandomBrackets($post->headline),
                    'subtitle' => '',
                    'background_image' => ''
                ];
                
                // Add each carousel as a story with description as subtitle
                foreach ($post->carousels as $carousel) {
                    $storiesFromPost[] = [
                        'text' => $this->addRandomBrackets($carousel->content ?? ''),
                        'subtitle' => $carousel->description ?? '',
                        'background_image' => ''
                    ];
                }
            }
        }
        
        // Use stories from post if available, otherwise use defaults
        $defaultStories = !empty($storiesFromPost) ? $storiesFromPost : $this->getDefaultStories();
        
        return view('stories.index', [
            'config' => $this->config,
            'defaultStories' => $defaultStories,
            'bulkText' => $bulkText
        ]);
    }

    /**
     * Add random brackets around words in a sentence
     */
    private function addRandomBrackets(string $text): string
    {
        // Split text into words while preserving punctuation
        $words = preg_split('/(\s+)/', $text, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        $processedWords = [];
        $wordCount = 0;
        
        foreach ($words as $word) {
            // Skip whitespace
            if (preg_match('/^\s+$/', $word)) {
                $processedWords[] = $word;
                continue;
            }
            
            // Skip if it's empty or just punctuation
            if (empty(trim($word)) || preg_match('/^[\p{P}\p{S}]+$/u', $word)) {
                $processedWords[] = $word;
                continue;
            }
            
            $wordCount++;
            
            // Randomly add brackets around 20-30% of words
            if (rand(1, 100) <= 25) {
                // Remove trailing punctuation temporarily
                $punctuation = '';
                $cleanWord = preg_replace('/[\p{P}\p{S}]+$/u', '', $word, -1, $count);
                if ($count > 0) {
                    $punctuation = substr($word, strlen($cleanWord));
                    $processedWords[] = '[' . $cleanWord . ']' . $punctuation;
                } else {
                    $processedWords[] = '[' . $word . ']';
                }
            } else {
                $processedWords[] = $word;
            }
        }
        
        return implode('', $processedWords);
    }

    /**
     * Generate stories from form submission
     */
    public function generate(Request $request)
    {

        $validated = $request->validate([
            'format' => 'nullable|string|in:story,post',
            'brand_name' => 'nullable|string|max:255',
            'brand_handle' => 'nullable|string|max:255',
            'brand_verified' => 'nullable|boolean',
            'has_logo' => 'nullable|boolean',
            'stories' => 'required|array|min:1',
            'stories.*.text' => 'required|string',
            'stories.*.subtitle' => 'nullable|string|max:500',
            'stories.*.background_image' => 'nullable|url',
            'stories.*.background_image_file' => 'nullable|image|max:10240', // Max 10MB
            'stories.*.background_color' => 'nullable|string',
            'stories.*.text_color' => 'nullable|string',
            'stories.*.highlight_color' => 'nullable|string',
            'stories.*.has_logo' => 'nullable|boolean',
        ]);

        // Update config with user input
        $config = $this->config;
        $format = $validated['format'] ?? 'story';
        $config['format'] = $format;
        $config['width'] = $this->formatDimensions[$format]['width'];
        $config['height'] = $this->formatDimensions[$format]['height'];
        $config['brand_name'] = $validated['brand_name'] ?? $config['brand_name'];
        $config['brand_handle'] = $validated['brand_handle'] ?? $config['brand_handle'];
        $config['brand_verified'] = $validated['brand_verified'] ?? $config['brand_verified'];
        $config['hasLogo'] = $validated['has_logo'] ?? $config['hasLogo'];
        $config['logo_data_uri'] = $this->getImageDataUri(public_path($config['logo']));

        // Process stories
        $processedStories = [];
        foreach ($validated['stories'] as $index => $story) {
            $segments = $this->parseText($story['text']);
            $hasLogo = $story['has_logo'] ?? $config['hasLogo'];
            
            // Parse subtitle segments (for highlighting text in [brackets])
            $subtitleSegments = null;
            if (!empty($story['subtitle'])) {
                $subtitleSegments = $this->parseText($story['subtitle']);
            }
            
            // Handle background image (file takes precedence over URL)
            $backgroundImage = $story['background_image'] ?? null;
            
            if ($request->hasFile("stories.{$index}.background_image_file")) {
                $file = $request->file("stories.{$index}.background_image_file");
                $imageData = file_get_contents($file->getRealPath());
                $mimeType = $file->getMimeType();
                $base64 = base64_encode($imageData);
                $backgroundImage = "data:{$mimeType};base64,{$base64}";
            }

            $backgroundColor = $story['background_color'] ?? '#667eea';
            $textColor = $story['text_color'] ?? '#ffffff';
            $highlightColor = $story['highlight_color'] ?? '#c2603d';

            $processedStories[] = [
                'background_image' => $backgroundImage,
                'background_size' => 'cover',
                'background_color' => $backgroundColor,
                'text_color' => $textColor,
                'highlight_color' => $highlightColor,
                'segments' => $segments,
                'subtitle' => $story['subtitle'] ?? null,
                'subtitle_segments' => $subtitleSegments,
                'brand_name' => $config['brand_name'],
                'brand_handle' => $config['brand_handle'],
                'brand_verified' => $config['brand_verified'],
                'hasLogo' => $hasLogo
            ];
        }

        return view('stories.preview', [
            'stories' => $processedStories,
            'config' => $config,
            'totalStories' => count($processedStories)
        ]);
    }

    /**
     * Search Freepik API for images
     */
    public function searchFreepik(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|max:255',
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $apiKey = config('services.freepik.api_key');
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'Freepik API key not configured'
            ], 500);
        }

        $page = $validated['page'] ?? 1;
        $limit = $validated['limit'] ?? 20;

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'x-freepik-api-key' => $apiKey,
                'Accept' => 'application/json',
            ])->get('https://api.freepik.com/v1/resources', [
                'term' => $validated['query'],
                'page' => $page,
                'limit' => $limit,
                'filters[content_type][]' => 'photo'
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Freepik API returned an error: ' . $response->body()
                ], $response->status());
            }

            $data = $response->json();
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to search Freepik: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save carousel updates to database
     */
    public function saveCarousels(Request $request)
    {
        \Log::info('Save carousels request:', $request->all());
        
        $validated = $request->validate([
            'post_id' => 'required|integer|exists:posts,id',
            'headline' => 'nullable|string|max:255',
            'carousels' => 'required|array',
            'carousels.*.content' => 'nullable|string',
            'carousels.*.description' => 'nullable|string',
            'carousels.*.position' => 'required|integer',
        ]);

        try {
            $post = Post::with('carousels')->findOrFail($validated['post_id']);
            
            \Log::info('Post found:', [
                'id' => $post->id,
                'existing_carousels' => $post->carousels->count()
            ]);
            
            // Update headline if provided
            if (isset($validated['headline']) && !empty($validated['headline'])) {
                $cleanHeadline = preg_replace('/\[|\]/', '', $validated['headline']);
                $post->update(['headline' => $cleanHeadline]);
                \Log::info('Updated headline:', ['headline' => $cleanHeadline]);
            }
            
            // Update existing carousels
            $updatedCount = 0;
            foreach ($validated['carousels'] as $carouselData) {
                // Skip if content is null or empty
                if (empty($carouselData['content'])) {
                    \Log::info('Skipping carousel with empty content at position: ' . $carouselData['position']);
                    continue;
                }
                
                $carousel = $post->carousels()
                    ->where('position', $carouselData['position'])
                    ->first();
                
                if ($carousel) {
                    // Remove brackets from content before saving
                    $cleanContent = preg_replace('/\[|\]/', '', $carouselData['content']);
                    
                    $carousel->update([
                        'content' => $cleanContent,
                        'description' => $carouselData['description'] ?? '',
                    ]);
                    
                    $updatedCount++;
                    \Log::info('Updated carousel:', [
                        'position' => $carouselData['position'],
                        'content' => $cleanContent
                    ]);
                } else {
                    \Log::warning('Carousel not found at position: ' . $carouselData['position']);
                }
            }
            
            \Log::info("Updated {$updatedCount} carousels");
            
            return response()->json([
                'success' => true,
                'message' => 'Carousels updated successfully',
                'updated_count' => $updatedCount
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Error saving carousels:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save carousels: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Parse text into segments of normal and highlighted text
     */
    private function parseText(string $text): array
    {
        // Split by [text] blocks, capturing the delimiters
        $parts = preg_split('/(\[.*?\])/', $text, -1, PREG_SPLIT_DELIM_CAPTURE);
        $segments = [];
        
        foreach ($parts as $part) {
            if (str_starts_with($part, '[') && str_ends_with($part, ']')) {
                // It's a highlight block
                $content = substr($part, 1, -1); // Remove [ and ]
                if ($content !== '') {
                    $segments[] = ['type' => 'highlight', 'text' => $content];
                }
            } else {
                // It's normal text
                if ($part !== '') {
                    $segments[] = ['type' => 'normal', 'text' => $part];
                }
            }
        }
        
        return $segments;
    }

    /**
     * Convert a local image to a data URI (base64) for embedding
     */
    private function getImageDataUri(string $path): string
    {
        if (!is_string($path) || trim($path) === '') {
            return $path;
        }

        if (!file_exists($path)) {
            return $path;
        }

        $data = @file_get_contents($path);
        if ($data === false) {
            return $path;
        }

        $mimeType = function_exists('mime_content_type') ? @mime_content_type($path) : '';

        if (!$mimeType) {
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $mimeType = match($extension) {
                'jpg', 'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                default => 'image/png',
            };
        }

        return 'data:' . $mimeType . ';base64,' . base64_encode($data);
    }

    /**
     * Get default story examples
     */
    private function getDefaultStories(): array
    {
        return [
            [
                'text' => 'في سنة ٢٠٢٦، قررت انو راح أستثمر مش بس بالبرامج… أستثمر بطريقة الشغل نفسها',
                'background_image' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1080&q=80'
            ],
            [
                'text' => 'بدل ما أسأل: "شو بقدر أبني؟" صرت أسأل:',
                'background_image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&q=80'
            ],
            [
                'text' => '"كيف بحسن العميل وهو بيمر بكل خطوة معي خلال مشروعه؟"',
                'background_image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&q=80'
            ],
        ];
    }
}
