<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                {{ __('Post Details') }}
            </h2>
            <a href="{{ route('posts.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Posts
            </a>
        </div>
    </x-slot>

    <div class="py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {{-- Post Header --}}
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div class="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h1 class="text-2xl md:text-3xl font-bold text-white leading-tight" dir="rtl">
                        {{ $post->headline }}
                    </h1>
                    <p class="text-indigo-100 mt-2 text-sm">
                        Created: {{ $post->created_at->format('F d, Y - h:i A') }}
                    </p>
                </div>
            </div>

            {{-- Carousel Slider --}}
            <div class="relative" x-data="{ activeSlide: 0, totalSlides: {{ $post->carousels->count() }} }">
                {{-- Slides Container --}}
                <div class="overflow-hidden rounded-2xl shadow-lg">
                    <div class="flex transition-transform duration-500 ease-out" 
                         :style="'transform: translateX(-' + (activeSlide * 100) + '%)'">
                        @foreach($post->carousels as $index => $carousel)
                            <div class="w-full flex-shrink-0">
                                <div class="bg-white">
                                    {{-- Image --}}
                                    @if($carousel->image_path)
                                        <div class="aspect-square overflow-hidden bg-gray-100">
                                            <img 
                                                src="{{ asset('storage/' . $carousel->image_path) }}" 
                                                alt="Slide {{ $carousel->position }}"
                                                class="w-full h-full object-cover"
                                            >
                                        </div>
                                    @else
                                        <div class="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span class="text-8xl">🤖</span>
                                        </div>
                                    @endif
                                    
                                    {{-- Content --}}
                                    <div class="p-6">
                                        <div class="flex items-center mb-4">
                                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                                                {{ $carousel->position }}
                                            </span>
                                            <span class="ml-3 text-sm text-gray-500">Slide {{ $carousel->position }} of {{ $post->carousels->count() }}</span>
                                        </div>
                                        <p class="text-gray-800 text-lg leading-relaxed" dir="rtl">
                                            {{ $carousel->content }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                {{-- Navigation Arrows --}}
                @if($post->carousels->count() > 1)
                    <button 
                        @click="activeSlide = activeSlide > 0 ? activeSlide - 1 : totalSlides - 1"
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10">
                        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <button 
                        @click="activeSlide = activeSlide < totalSlides - 1 ? activeSlide + 1 : 0"
                        class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10">
                        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                @endif

                {{-- Dots Indicator --}}
                <div class="flex justify-center mt-6 space-x-2">
                    @foreach($post->carousels as $index => $carousel)
                        <button 
                            @click="activeSlide = {{ $index }}"
                            :class="activeSlide === {{ $index }} ? 'bg-indigo-600 w-8' : 'bg-gray-300 w-3'"
                            class="h-3 rounded-full transition-all duration-300 hover:bg-indigo-400">
                        </button>
                    @endforeach
                </div>
            </div>

            {{-- All Slides List --}}
            <div class="mt-12">
                <h2 class="text-xl font-bold text-gray-900 mb-6">All Slides</h2>
                <div class="space-y-4">
                    @foreach($post->carousels as $carousel)
                        <div class="bg-white rounded-xl shadow-md overflow-hidden flex">
                            {{-- Thumbnail --}}
                            <div class="w-32 h-32 flex-shrink-0">
                                @if($carousel->image_path)
                                    <img 
                                        src="{{ asset('storage/' . $carousel->image_path) }}" 
                                        alt="Slide {{ $carousel->position }}"
                                        class="w-full h-full object-cover"
                                    >
                                @else
                                    <div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span class="text-3xl">🤖</span>
                                    </div>
                                @endif
                            </div>
                            
                            {{-- Content --}}
                            <div class="flex-1 p-4">
                                <div class="flex items-center mb-2">
                                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">
                                        {{ $carousel->position }}
                                    </span>
                                    <span class="ml-2 text-xs text-gray-500">Slide {{ $carousel->position }}</span>
                                </div>
                                <p class="text-gray-700 text-sm leading-relaxed line-clamp-3" dir="rtl">
                                    {{ $carousel->content }}
                                </p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <style>
        .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
</x-app-layout>
