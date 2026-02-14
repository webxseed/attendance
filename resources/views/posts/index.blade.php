<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('AI Posts') }}
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {{-- Success/Error Messages --}}
            @if(session('success'))
                <div class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {{ session('success') }}
                </div>
            @endif
            
            @if(session('error'))
                <div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {{ session('error') }}
                </div>
            @endif
            
            {{-- Header Section --}}
            <div class="mb-8 text-center">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">🤖 AI Generated Posts</h1>
                <p class="text-gray-600 mb-4">Browse all AI-generated Instagram content</p>
                <div class="mt-4 flex justify-center gap-4 items-center flex-wrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {{ $posts->total() }} Posts
                    </span>
                    
                    {{-- Generate Posts Button --}}
                    <form action="{{ route('posts.generate') }}" method="POST" onsubmit="return confirm('This will generate 10 new AI posts. Continue?');">
                        @csrf
                        <button type="submit" class="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            Generate 10 New Posts
                        </button>
                    </form>
                </div>
            </div>

            {{-- Posts Grid --}}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @forelse($posts as $post)
                    <div class="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        {{-- Post Header --}}
                        <div class="p-5 border-b border-gray-100 cursor-pointer" onclick="openViewModal({{ $post->id }})">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h3 class="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors" dir="rtl">
                                        {{ $post->headline }}
                                    </h3>
                                    <p class="text-xs text-gray-500 mt-2">
                                        {{ $post->created_at->format('M d, Y - h:i A') }}
                                    </p>
                                </div>
                                {{-- Arrow indicator --}}
                                <div class="ml-3 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {{-- Carousel Preview with Navigation --}}
                        <div class="relative" data-carousel="post-{{ $post->id }}">
                            @if($post->carousels->count() > 0)
                                {{-- Slides Container --}}
                                <div class="overflow-hidden aspect-square">
                                    <div class="flex transition-transform duration-300 ease-out h-full" data-slides="post-{{ $post->id }}">
                                        @foreach($post->carousels as $carousel)
                                            <div class="w-full flex-shrink-0 h-full cursor-pointer" onclick="openViewModal({{ $post->id }})">
                                                @if($carousel->image_path)
                                                    <img 
                                                        src="{{ asset('storage/' . $carousel->image_path) }}" 
                                                        alt="Slide {{ $carousel->position }}"
                                                        class="w-full h-full object-cover"
                                                    >
                                                @else
                                                    <div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                        <span class="text-6xl">🤖</span>
                                                    </div>
                                                @endif
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                                
                                {{-- Navigation Arrows (only if more than 1 slide) --}}
                                @if($post->carousels->count() > 1)
                                    <button type="button" onclick="cardPrevSlide('post-{{ $post->id }}', event)" 
                                            class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10">
                                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                        </svg>
                                    </button>
                                    <button type="button" onclick="cardNextSlide('post-{{ $post->id }}', event)" 
                                            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10">
                                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                @endif
                                
                                {{-- Carousel Indicator Dots --}}
                                <div class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5" data-dots="post-{{ $post->id }}">
                                    @foreach($post->carousels as $index => $carousel)
                                        <button type="button" onclick="cardGoToSlide('post-{{ $post->id }}', {{ $index }}, event)"
                                                class="w-2 h-2 rounded-full transition-all {{ $index === 0 ? 'bg-white w-4' : 'bg-white/50' }}"
                                                data-dot-index="{{ $index }}"></button>
                                    @endforeach
                                </div>
                                
                                {{-- Slide count badge --}}
                                <div class="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                    <span data-current-slide="post-{{ $post->id }}">1</span>/{{ $post->carousels->count() }}
                                </div>
                            @else
                                <div class="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer" onclick="openViewModal({{ $post->id }})">
                                    <span class="text-gray-400 text-sm">No images</span>
                                </div>
                            @endif
                        </div>

                        {{-- Post Content Preview --}}
                        <div class="p-5">
                            @if($post->carousels->count() > 0)
                                <div data-content="post-{{ $post->id }}">
                                    @foreach($post->carousels as $index => $carousel)
                                        <div class="{{ $index === 0 ? '' : 'hidden' }}" data-content-index="{{ $index }}">
                                            <p class="text-gray-700 text-sm leading-relaxed line-clamp-2" dir="rtl">
                                                {{ $carousel->content }}
                                            </p>
                                            @if($carousel->description)
                                                <p class="mt-2 text-amber-700 bg-amber-50 text-xs leading-relaxed p-2 rounded-lg border border-amber-200 line-clamp-2" dir="rtl">
                                                    📋 {{ $carousel->description }}
                                                </p>
                                            @endif
                                        </div>
                                    @endforeach
                                </div>
                            @endif
                            
                            {{-- Action Buttons --}}
                            <div class="mt-4 flex items-center justify-center gap-2">
                                <button onclick="openViewModal({{ $post->id }})" class="flex-1 inline-flex items-center justify-center px-3 py-2 text-indigo-600 font-medium text-sm hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    View
                                </button>
                                <button onclick="openEditModal({{ $post->id }})" class="flex-1 inline-flex items-center justify-center px-3 py-2 text-amber-600 font-medium text-sm hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Edit
                                </button>
                            </div>
                        </div>
                        
                        {{-- Create Stories Button --}}
                        @if($post->carousels->count() > 0)
                            <div class="px-5 pb-5">
                                <a href="{{ route('stories.index') }}?post={{ $post->id }}" 
                                   class="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 bg-blue-600">
                                    <span class="inline-flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                        </svg>
                                        Create Stories from Post
                                    </span>
                                </a>
                            </div>
                        @endif
                    </div>
                @empty
                    <div class="col-span-full text-center py-16">
                        <div class="text-6xl mb-4">📭</div>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
                        <p class="text-gray-500">Run the AI fetch command to generate posts</p>
                        <code class="mt-4 inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                            php artisan ai:fetch-posts
                        </code>
                    </div>
                @endforelse
            </div>

            {{-- Pagination --}}
            @if($posts->hasPages())
                <div class="mt-8">
                    {{ $posts->links() }}
                </div>
            @endif
        </div>
    </div>

    {{-- View Modal --}}
    <div id="viewModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto" onclick="closeViewModal(event)">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
            {{-- Modal Header --}}
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h3 id="viewModalTitle" class="text-xl font-bold text-white" dir="rtl"></h3>
                <button type="button" onclick="closeViewModal()" class="text-white hover:text-gray-200 text-3xl font-bold leading-none">
                    &times;
                </button>
            </div>
            
            {{-- Modal Body --}}
            <div class="overflow-y-auto" style="max-height: calc(90vh - 140px);">
                {{-- Carousel Slider --}}
                <div class="relative" id="viewCarouselContainer">
                    <div class="overflow-hidden">
                        <div id="viewCarouselSlides" class="flex transition-transform duration-500 ease-out">
                            <!-- Slides will be injected here -->
                        </div>
                    </div>
                    
                    {{-- Navigation Arrows --}}
                    <button id="viewPrevBtn" onclick="viewPrevSlide()" class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10">
                        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <button id="viewNextBtn" onclick="viewNextSlide()" class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10">
                        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
                
                {{-- Dots Indicator --}}
                <div id="viewDotsContainer" class="flex justify-center py-4 space-x-2">
                    <!-- Dots will be injected here -->
                </div>
                
                {{-- All Slides List --}}
                <div class="p-6 border-t border-gray-200">
                    <h4 class="text-lg font-bold text-gray-900 mb-4">All Slides</h4>
                    <div id="viewSlidesList" class="space-y-3">
                        <!-- Slides list will be injected here -->
                    </div>
                </div>
            </div>
            
            {{-- Modal Footer --}}
            <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onclick="closeViewModal()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold">
                    Close
                </button>
            </div>
        </div>
    </div>

    {{-- Edit Modal --}}
    <div id="editModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto" onclick="closeEditModal(event)">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
            {{-- Modal Header --}}
            <div class="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                <h3 class="text-xl font-bold text-white">✏️ Edit Post</h3>
                <button type="button" onclick="closeEditModal()" class="text-white hover:text-gray-200 text-3xl font-bold leading-none">
                    &times;
                </button>
            </div>
            
            {{-- Modal Body --}}
            <form id="editPostForm" onsubmit="submitEditForm(event)">
                <input type="hidden" id="editPostId" name="post_id">
                
                <div class="overflow-y-auto p-6" style="max-height: calc(90vh - 180px);">
                    {{-- Headline --}}
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                        <input type="text" id="editHeadline" name="headline" required
                               class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
                               dir="rtl" placeholder="Enter headline...">
                    </div>
                    
                    {{-- Carousels --}}
                    <div class="space-y-4">
                        <h4 class="text-lg font-semibold text-gray-900">Carousel Slides</h4>
                        <div id="editCarouselsList" class="space-y-4">
                            <!-- Carousel edit fields will be injected here -->
                        </div>
                    </div>
                </div>
                
                {{-- Modal Footer --}}
                <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
                    <button type="button" onclick="closeEditModal()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold">
                        Cancel
                    </button>
                    <button type="submit" id="editSubmitBtn" class="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-semibold">
                        Save Changes
                    </button>
                </div>
            </form>
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

    <script>
        // Posts data for modals
        const postsData = @json($posts->items());
        
        // Card carousel state (track current slide for each post)
        const cardSlides = {};
        
        // Initialize card slides state
        postsData.forEach(post => {
            cardSlides['post-' + post.id] = 0;
        });
        
        // Card carousel navigation functions
        function cardPrevSlide(carouselId, event) {
            event.stopPropagation();
            const post = postsData.find(p => 'post-' + p.id === carouselId);
            if (!post || !post.carousels) return;
            
            const totalSlides = post.carousels.length;
            cardSlides[carouselId] = cardSlides[carouselId] > 0 ? cardSlides[carouselId] - 1 : totalSlides - 1;
            updateCardSlide(carouselId);
        }
        
        function cardNextSlide(carouselId, event) {
            event.stopPropagation();
            const post = postsData.find(p => 'post-' + p.id === carouselId);
            if (!post || !post.carousels) return;
            
            const totalSlides = post.carousels.length;
            cardSlides[carouselId] = cardSlides[carouselId] < totalSlides - 1 ? cardSlides[carouselId] + 1 : 0;
            updateCardSlide(carouselId);
        }
        
        function cardGoToSlide(carouselId, index, event) {
            event.stopPropagation();
            cardSlides[carouselId] = index;
            updateCardSlide(carouselId);
        }
        
        function updateCardSlide(carouselId) {
            const currentSlide = cardSlides[carouselId];
            
            // Update slides position
            const slidesContainer = document.querySelector(`[data-slides="${carouselId}"]`);
            if (slidesContainer) {
                slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
            
            // Update dots
            const dotsContainer = document.querySelector(`[data-dots="${carouselId}"]`);
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('button');
                dots.forEach((dot, index) => {
                    if (index === currentSlide) {
                        dot.classList.remove('bg-white/50', 'w-2');
                        dot.classList.add('bg-white', 'w-4');
                    } else {
                        dot.classList.remove('bg-white', 'w-4');
                        dot.classList.add('bg-white/50', 'w-2');
                    }
                });
            }
            
            // Update current slide number
            const slideNumber = document.querySelector(`[data-current-slide="${carouselId}"]`);
            if (slideNumber) {
                slideNumber.textContent = currentSlide + 1;
            }
            
            // Update content preview
            const contentContainer = document.querySelector(`[data-content="${carouselId}"]`);
            if (contentContainer) {
                const contentItems = contentContainer.querySelectorAll('[data-content-index]');
                contentItems.forEach((item, index) => {
                    if (index === currentSlide) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            }
        }
        
        // View Modal State
        let currentViewSlide = 0;
        let currentViewPost = null;
        
        // Open View Modal
        function openViewModal(postId) {
            const post = postsData.find(p => p.id === postId);
            if (!post) return;
            
            currentViewPost = post;
            currentViewSlide = 0;
            
            // Set title
            document.getElementById('viewModalTitle').textContent = post.headline;
            
            // Build carousel slides
            const slidesContainer = document.getElementById('viewCarouselSlides');
            const dotsContainer = document.getElementById('viewDotsContainer');
            const slidesList = document.getElementById('viewSlidesList');
            
            slidesContainer.innerHTML = '';
            dotsContainer.innerHTML = '';
            slidesList.innerHTML = '';
            
            if (post.carousels && post.carousels.length > 0) {
                post.carousels.forEach((carousel, index) => {
                    // Slide
                    const slide = document.createElement('div');
                    slide.className = 'w-full flex-shrink-0';
                    slide.innerHTML = `
                        <div class="bg-white">
                            ${carousel.image_path 
                                ? `<div class="aspect-square overflow-hidden bg-gray-100">
                                       <img src="/storage/${carousel.image_path}" alt="Slide ${carousel.position}" class="w-full h-full object-cover">
                                   </div>`
                                : `<div class="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                       <span class="text-8xl">🤖</span>
                                   </div>`
                            }
                            <div class="p-6">
                                <div class="flex items-center mb-4">
                                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                                        ${carousel.position}
                                    </span>
                                    <span class="ml-3 text-sm text-gray-500">Slide ${carousel.position} of ${post.carousels.length}</span>
                                </div>
                                <p class="text-gray-800 text-lg leading-relaxed" dir="rtl">${carousel.content}</p>
                                ${carousel.description ? `
                                    <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p class="text-amber-800 text-sm font-medium mb-1">📋 Prompt للنسخ:</p>
                                        <p class="text-amber-700 text-sm leading-relaxed" dir="rtl">${carousel.description}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                    slidesContainer.appendChild(slide);
                    
                    // Dot
                    const dot = document.createElement('button');
                    dot.className = `h-3 rounded-full transition-all duration-300 hover:bg-indigo-400 ${index === 0 ? 'bg-indigo-600 w-8' : 'bg-gray-300 w-3'}`;
                    dot.onclick = () => goToViewSlide(index);
                    dotsContainer.appendChild(dot);
                    
                    // List item
                    const listItem = document.createElement('div');
                    listItem.className = 'bg-gray-50 rounded-xl p-4 flex gap-4 cursor-pointer hover:bg-gray-100 transition-colors';
                    listItem.onclick = () => goToViewSlide(index);
                    listItem.innerHTML = `
                        <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                            ${carousel.image_path 
                                ? `<img src="/storage/${carousel.image_path}" alt="Slide ${carousel.position}" class="w-full h-full object-cover">`
                                : `<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                       <span class="text-2xl">🤖</span>
                                   </div>`
                            }
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">
                                    ${carousel.position}
                                </span>
                                <span class="ml-2 text-xs text-gray-500">Slide ${carousel.position}</span>
                            </div>
                            <p class="text-gray-700 text-sm leading-relaxed line-clamp-2" dir="rtl">${carousel.content}</p>
                            ${carousel.description ? `
                                <p class="mt-1 text-amber-600 text-xs line-clamp-1" dir="rtl">📋 ${carousel.description}</p>
                            ` : ''}
                        </div>
                    `;
                    slidesList.appendChild(listItem);
                });
                
                // Show/hide navigation arrows
                const showArrows = post.carousels.length > 1;
                document.getElementById('viewPrevBtn').style.display = showArrows ? 'flex' : 'none';
                document.getElementById('viewNextBtn').style.display = showArrows ? 'flex' : 'none';
            }
            
            updateViewSlidePosition();
            
            // Show modal
            document.getElementById('viewModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        function closeViewModal(event) {
            if (!event || event.target.id === 'viewModal') {
                document.getElementById('viewModal').classList.add('hidden');
                document.body.style.overflow = '';
                currentViewPost = null;
            }
        }
        
        function viewPrevSlide() {
            if (!currentViewPost || !currentViewPost.carousels) return;
            currentViewSlide = currentViewSlide > 0 ? currentViewSlide - 1 : currentViewPost.carousels.length - 1;
            updateViewSlidePosition();
        }
        
        function viewNextSlide() {
            if (!currentViewPost || !currentViewPost.carousels) return;
            currentViewSlide = currentViewSlide < currentViewPost.carousels.length - 1 ? currentViewSlide + 1 : 0;
            updateViewSlidePosition();
        }
        
        function goToViewSlide(index) {
            currentViewSlide = index;
            updateViewSlidePosition();
        }
        
        function updateViewSlidePosition() {
            const slidesContainer = document.getElementById('viewCarouselSlides');
            slidesContainer.style.transform = `translateX(-${currentViewSlide * 100}%)`;
            
            // Update dots
            const dots = document.getElementById('viewDotsContainer').children;
            Array.from(dots).forEach((dot, index) => {
                if (index === currentViewSlide) {
                    dot.classList.remove('bg-gray-300', 'w-3');
                    dot.classList.add('bg-indigo-600', 'w-8');
                } else {
                    dot.classList.remove('bg-indigo-600', 'w-8');
                    dot.classList.add('bg-gray-300', 'w-3');
                }
            });
        }
        
        // Edit Modal
        function openEditModal(postId) {
            const post = postsData.find(p => p.id === postId);
            if (!post) return;
            
            document.getElementById('editPostId').value = post.id;
            document.getElementById('editHeadline').value = post.headline;
            
            // Build carousel edit fields
            const carouselsList = document.getElementById('editCarouselsList');
            carouselsList.innerHTML = '';
            
            if (post.carousels && post.carousels.length > 0) {
                post.carousels.forEach((carousel, index) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.className = 'bg-gray-50 rounded-xl p-4 border border-gray-200';
                    carouselItem.innerHTML = `
                        <div class="flex items-start gap-4">
                            <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                ${carousel.image_path 
                                    ? `<img src="/storage/${carousel.image_path}" alt="Slide ${carousel.position}" class="w-full h-full object-cover">`
                                    : `<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                           <span class="text-3xl">🤖</span>
                                       </div>`
                                }
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center mb-2">
                                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">
                                        ${carousel.position}
                                    </span>
                                    <span class="ml-2 text-sm font-medium text-gray-700">Slide ${carousel.position}</span>
                                </div>
                                <input type="hidden" name="carousels[${index}][id]" value="${carousel.id}">
                                <textarea name="carousels[${index}][content]" rows="4" required
                                          class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                          dir="rtl" placeholder="Enter content...">${carousel.content}</textarea>
                            </div>
                        </div>
                    `;
                    carouselsList.appendChild(carouselItem);
                });
            }
            
            // Show modal
            document.getElementById('editModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        function closeEditModal(event) {
            if (!event || event.target.id === 'editModal') {
                document.getElementById('editModal').classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
        
        async function submitEditForm(event) {
            event.preventDefault();
            
            const form = document.getElementById('editPostForm');
            const postId = document.getElementById('editPostId').value;
            const submitBtn = document.getElementById('editSubmitBtn');
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            // Build form data
            const formData = new FormData(form);
            const data = {
                headline: formData.get('headline'),
                carousels: []
            };
            
            // Collect carousels data
            const carouselInputs = form.querySelectorAll('[name^="carousels"]');
            const carouselsMap = {};
            
            carouselInputs.forEach(input => {
                const match = input.name.match(/carousels\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const index = match[1];
                    const field = match[2];
                    if (!carouselsMap[index]) carouselsMap[index] = {};
                    carouselsMap[index][field] = input.value;
                }
            });
            
            data.carousels = Object.values(carouselsMap);
            
            try {
                const response = await fetch(`/posts/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Update local data
                    const postIndex = postsData.findIndex(p => p.id == postId);
                    if (postIndex !== -1) {
                        postsData[postIndex].headline = data.headline;
                        data.carousels.forEach(carousel => {
                            const carouselIndex = postsData[postIndex].carousels.findIndex(c => c.id == carousel.id);
                            if (carouselIndex !== -1) {
                                postsData[postIndex].carousels[carouselIndex].content = carousel.content;
                            }
                        });
                    }
                    
                    // Update UI
                    alert(result.message);
                    closeEditModal();
                    location.reload(); // Refresh to show updated data
                } else {
                    alert(result.message || 'Error updating post');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        }
    </script>
</x-app-layout>
