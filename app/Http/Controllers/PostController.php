<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with('carousels')
            ->orderBy('created_at', 'desc')
            ->paginate(12);
        
        return view('posts.index', compact('posts'));
    }

    public function show(Post $post)
    {
        $post->load('carousels');
        return view('posts.show', compact('post'));
    }

    public function generate()
    {
        try {
            // Run the command programmatically without generating images
            Artisan::call('ai:fetch-posts');
            
            return redirect()->route('posts.index')
                ->with('success', '✅ Successfully generated 10 new AI posts!');
        } catch (\Exception $e) {
            return redirect()->route('posts.index')
                ->with('error', '❌ Error generating posts: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Post $post)
    {
        $request->validate([
            'headline' => 'required|string|max:500',
            'carousels' => 'array',
            'carousels.*.id' => 'required|exists:post_carousels,id',
            'carousels.*.content' => 'required|string',
        ]);

        try {
            // Update the post headline
            $post->update([
                'headline' => $request->headline,
            ]);

            // Update each carousel content
            if ($request->has('carousels')) {
                foreach ($request->carousels as $carouselData) {
                    $post->carousels()
                        ->where('id', $carouselData['id'])
                        ->update(['content' => $carouselData['content']]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => '✅ Post updated successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Error updating post: ' . $e->getMessage(),
            ], 500);
        }
    }
}
