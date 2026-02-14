<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('📱 Instagram Stories Generator') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-2">مولد ستوريز إنستغرام</h3>
                        <p class="text-gray-600">أضف النصوص والصور لإنشاء ستوريز إنستغرام جاهزة للتحميل.</p>
                        <p class="text-sm text-gray-500 mt-1">استخدم الأقواس المربعة [] حول النص الذي تريد تمييزه باللون البرتقالي.</p>
                        <p class="text-sm text-gray-500">مثال: هذا نص [مميز بالبرتقالي] وباقي النص</p>
                    </div>

                    <form action="{{ route('stories.generate') }}" method="POST" id="storyForm" enctype="multipart/form-data">
                        @csrf
                        
                        <!-- Hidden Post ID for saving back to database -->
                        <input type="hidden" name="post_id" id="postId" value="{{ request()->get('post') ?? '' }}">
                        
                        <!-- Format Selection -->
                        <div class="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h4 class="font-semibold mb-4 text-purple-800">📐 نوع المحتوى / Content Format</h4>
                            <div class="flex flex-wrap gap-4">
                                <label class="flex items-center p-4 bg-white rounded-lg border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-colors has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50">
                                    <input type="radio" name="format" value="story" checked
                                           class="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500">
                                    <span class="mr-3 flex flex-col">
                                        <span class="font-semibold text-gray-900">📱 ستوري / Story</span>
                                        <span class="text-sm text-gray-500">1080 × 1920 px</span>
                                    </span>
                                </label>
                                <label class="flex items-center p-4 bg-white rounded-lg border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-colors has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50">
                                    <input type="radio" name="format" value="post"
                                           class="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500">
                                    <span class="mr-3 flex flex-col">
                                        <span class="font-semibold text-gray-900">🖼️ بوست / Post</span>
                                        <span class="text-sm text-gray-500">1080 × 1350 px</span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- Brand Configuration -->
                        <div class="mb-8 p-4 bg-gray-50 rounded-lg">
                            <h4 class="font-semibold mb-4">⚙️ إعدادات العلامة التجارية</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">اسم العلامة التجارية</label>
                                    <input type="text" name="brand_name" value="{{ $config['brand_name'] }}" 
                                           class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">الحساب</label>
                                    <input type="text" name="brand_handle" value="{{ $config['brand_handle'] }}" 
                                           class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="flex items-center gap-4 pt-6">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="brand_verified" value="1" {{ $config['brand_verified'] ? 'checked' : '' }}
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500">
                                        <span class="mr-2 text-sm text-gray-700">موثق ✓</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="has_logo" id="masterLogoCheckbox" value="1" {{ $config['hasLogo'] ? 'checked' : '' }}
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                               onchange="toggleAllStoryLogos(this.checked)">
                                        <span class="mr-2 text-sm text-gray-700">إظهار الشعار</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="rtlCheckbox" value="1"
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                               onchange="toggleRtlInputs(this.checked)">
                                        <span class="mr-2 text-sm text-gray-700">اتجاه النص RTL</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Bulk Import -->
                        <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 class="font-semibold mb-4 text-blue-800">📝 إضافة سريعة (Bulk Add)</h4>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-blue-700 mb-1">أدخل النص الكامل (سيتم تقسيمه إلى شرائح عند كل نقطة ".")</label>
                                <textarea id="bulkText" rows="4" 
                                          class="w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                          placeholder="اكتب قصتك هنا... سيتم تحويل كل جملة تنتهي بنقطة إلى ستوري منفصل.">{{ $bulkText }}</textarea>
                            </div>
                            <button type="button" onclick="populateStories()" style="background-color: #2563eb;"
                                    class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                ⚡ تعبئة الستوريز
                            </button>
                        </div>

                        <!-- Stories -->
                        <div id="storiesContainer">
                            @foreach ($defaultStories as $index => $story)
                            <div class="story-item mb-6 p-4 border border-gray-200 rounded-lg" data-index="{{ $index }}">
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-semibold">📖 Story {{ $index + 1 }}</h4>
                                    @if ($index > 0)
                                    <button type="button" onclick="removeStory(this)" class="text-red-500 hover:text-red-700 text-sm">
                                        🗑️ حذف
                                    </button>
                                    @endif
                                </div>
                                
                                <div class="grid grid-cols-1 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">النص</label>
                                        <input type="text" name="stories[{{ $index }}][text]" required
                                               value="{{ $story['text'] }}"
                                               class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                               placeholder="أدخل النص هنا... استخدم [نص] للتمييز">
                                    </div>
                                    <div>
                                        <div class="flex items-center justify-between mb-1">
                                            <label class="block text-sm font-medium text-gray-700">العنوان الفرعي (اختياري)</label>
                                            <button type="button" onclick="removeBrackets(this)" class="text-xs text-red-500 hover:text-red-700 hover:underline">
                                                إزالة [] الأقواس
                                            </button>
                                        </div>
                                        <textarea name="stories[{{ $index }}][subtitle]" rows="3"
                                                  class="story-subtitle w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                  placeholder="أدخل العنوان الفرعي هنا...">{{ $story['subtitle'] ?? '' }}</textarea>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">صورة الخلفية</label>
                                            <div class="space-y-2">
                                                <div class="flex gap-2">
                                                    <input type="url" name="stories[{{ $index }}][background_image]"
                                                           value="{{ $story['background_image'] }}"
                                                           class="story-bg-url flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                           placeholder="رابط مباشر للصورة (URL)">
                                                    <button type="button" 
                                                            onclick="openFreepikModal({{ $index }})"
                                                            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-sm whitespace-nowrap shadow-md hover:shadow-lg">
                                                        🔍 بحث Freepik
                                                    </button>
                                                </div>
                                                <div class="text-center text-sm text-gray-500">- أو -</div>
                                                <input type="file" name="stories[{{ $index }}][background_image_file]" accept="image/*"
                                                       class="w-full text-sm text-gray-500
                                                              file:mr-4 file:py-2 file:px-4
                                                              file:rounded-full file:border-0
                                                              file:text-sm file:font-semibold
                                                              file:bg-indigo-50 file:text-indigo-700
                                                              hover:file:bg-indigo-100">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">لون الخلفية (إذا لم توجد صورة)</label>
                                            <div class="flex gap-2">
                                                <input type="color" name="stories[{{ $index }}][background_color]" 
                                                       value="#667eea"
                                                       class="h-10 w-14 rounded-md border-gray-300 shadow-sm p-1 cursor-pointer">
                                                <input type="text" name="stories[{{ $index }}][background_color_text]" 
                                                       value="#667eea"
                                                       onchange="this.previousElementSibling.value = this.value"
                                                       class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                       placeholder="#667eea">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">لون النص الأساسي</label>
                                            <div class="flex gap-2">
                                                <input type="color" name="stories[{{ $index }}][text_color]" 
                                                       value="#ffffff"
                                                       class="h-10 w-14 rounded-md border-gray-300 shadow-sm p-1 cursor-pointer">
                                                <input type="text" name="stories[{{ $index }}][text_color_text]" 
                                                       value="#ffffff"
                                                       onchange="this.previousElementSibling.value = this.value"
                                                       class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                       placeholder="#ffffff">
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">لون النص المميز [بين الأقواس]</label>
                                            <div class="flex gap-2">
                                                <input type="color" name="stories[{{ $index }}][highlight_color]" 
                                                       value="#c2603d"
                                                       class="h-10 w-14 rounded-md border-gray-300 shadow-sm p-1 cursor-pointer">
                                                <input type="text" name="stories[{{ $index }}][highlight_color_text]" 
                                                       value="#c2603d"
                                                       onchange="this.previousElementSibling.value = this.value"
                                                       class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                       placeholder="#c2603d">
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="flex items-center">
                                            <input type="checkbox" name="stories[{{ $index }}][has_logo]" value="1"
                                                   class="story-logo-checkbox rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500">
                                            <span class="mr-2 text-sm text-gray-700">إظهار الشعار في هذا الستوري</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            @endforeach
                        </div>

                        <!-- Add Story Button -->
                        <div class="mb-6">
                            <button type="button" onclick="addStory()" style="background-color: #16a34a;"
                                    class="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                ➕ إضافة ستوري جديد
                            </button>
                        </div>

                        <!-- Submit Buttons -->
                        <div class="flex justify-end gap-3">
                            @if(request()->has('post'))
                            <button type="button" onclick="saveCarouselsToDB()" style="background-color: #059669;"
                                    class="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                💾 حفظ في قاعدة البيانات / Save to Database
                            </button>
                            @endif
                            <button type="submit" style="background-color: #4f46e5;"
                                    class="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                🚀 معاينة وإنشاء الستوريز / Preview & Generate
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        let storyCount = {{ count($defaultStories) }};

        // Auto-populate if bulkText is pre-filled
        document.addEventListener('DOMContentLoaded', function() {
            const bulkText = document.getElementById('bulkText').value.trim();
            if (bulkText) {
                populateStories();
            }
        });

        // Toggle all story logo checkboxes
        function toggleAllStoryLogos(checked) {
            const storyCheckboxes = document.querySelectorAll('.story-logo-checkbox');
            storyCheckboxes.forEach(checkbox => {
                checkbox.checked = checked;
            });
        }

        // Toggle RTL direction for all inputs and textareas
        function toggleRtlInputs(checked) {
            const inputs = document.querySelectorAll('input[type="text"], input[type="url"], textarea');
            inputs.forEach(input => {
                if (checked) {
                    input.style.direction = 'rtl';
                    input.style.textAlign = 'right';
                } else {
                    input.style.direction = '';
                    input.style.textAlign = '';
                }
            });
        }

        // Remove all [] brackets from the textarea content
        function removeBrackets(button) {
            const container = button.closest('div').parentElement;
            const textarea = container.querySelector('textarea');
            if (textarea) {
                textarea.value = textarea.value.replace(/\[|\]/g, '');
            }
        }

        function populateStories() {
            const bulkText = document.getElementById('bulkText').value;
            if (!bulkText) return;

            if (!confirm('سيتم استبدال الستوريز الحالية بالنص الجديد. هل أنت متأكد؟')) {
                return;
            }

            const container = document.getElementById('storiesContainer');
            container.innerHTML = '';
            storyCount = 0;

            // Split by dot and filter empty
            const sentences = bulkText.split('.').map(s => s.trim()).filter(s => s.length > 0);

            if (sentences.length === 0 && bulkText.trim().length > 0) {
                // If no dots found, add the whole text as one story
                addStory(bulkText.trim());
            } else {
                sentences.forEach(sentence => {
                    addStory(sentence + '.');
                });
            }
        }

        function addStory(initialText = '') {
            const container = document.getElementById('storiesContainer');
            const newStory = document.createElement('div');
            newStory.className = 'story-item mb-6 p-4 border border-gray-200 rounded-lg';
            newStory.dataset.index = storyCount;
            
            newStory.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-semibold">📖 Story ${storyCount + 1}</h4>
                    <button type="button" onclick="removeStory(this)" class="text-red-500 hover:text-red-700 text-sm">
                        🗑️ حذف
                    </button>
                </div>
                
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">النص</label>
                        <input type="text" name="stories[${storyCount}][text]" required
                                  class="story-text-input w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="أدخل النص هنا... استخدم [نص] للتمييز">
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label class="block text-sm font-medium text-gray-700">العنوان الفرعي (اختياري)</label>
                            <button type="button" onclick="removeBrackets(this)" class="text-xs text-red-500 hover:text-red-700 hover:underline">
                                إزالة [] الأقواس
                            </button>
                        </div>
                        <textarea name="stories[${storyCount}][subtitle]" rows="3"
                               class="story-subtitle w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                               placeholder="أدخل العنوان الفرعي هنا..."></textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">صورة الخلفية</label>
                            <div class="space-y-2">
                                <div class="flex gap-2">
                                    <input type="url" name="stories[${storyCount}][background_image]"
                                           class="story-bg-url flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                           placeholder="رابط مباشر للصورة (URL)">
                                    <button type="button" 
                                            onclick="openFreepikModal(${storyCount})"
                                            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-sm whitespace-nowrap shadow-md hover:shadow-lg">
                                        🔍 بحث Freepik
                                    </button>
                                </div>
                                <div class="text-center text-sm text-gray-500">- أو -</div>
                                <input type="file" name="stories[${storyCount}][background_image_file]" accept="image/*"
                                       class="w-full text-sm text-gray-500
                                              file:mr-4 file:py-2 file:px-4
                                              file:rounded-full file:border-0
                                              file:text-sm file:font-semibold
                                              file:bg-indigo-50 file:text-indigo-700
                                              hover:file:bg-indigo-100">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">لون الخلفية (إذا لم توجد صورة)</label>
                            <div class="flex gap-2">
                                <input type="color" name="stories[${storyCount}][background_color]" 
                                       value="#667eea"
                                       class="h-10 w-14 rounded-md border-gray-300 shadow-sm p-1 cursor-pointer">
                                <input type="text" name="stories[${storyCount}][background_color_text]" 
                                       value="#667eea"
                                       onchange="this.previousElementSibling.value = this.value"
                                       class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                       placeholder="#667eea">
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">لون النص الأساسي</label>
                            <div class="flex gap-2">
                                <input type="color" name="stories[${storyCount}][text_color]" 
                                       value="#ffffff"
                                       class="h-10 w-14 rounded-md border-gray-300 shadow-sm p-1 cursor-pointer">
                                <input type="text" name="stories[${storyCount}][text_color_text]" 
                                       value="#ffffff"
                                       onchange="this.previousElementSibling.value = this.value"
                                       class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                       placeholder="#ffffff">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">لون النص المميز [بين الأقواس]</label>
                            <div class="flex gap-2">
                                <input type="color" name="stories[${storyCount}][highlight_color]" 
                                       value="#c2603d"
                                       class="h-10 w-14 rounded-md border-gray-300 shadow-sm p-1 cursor-pointer">
                                <input type="text" name="stories[${storyCount}][highlight_color_text]" 
                                       value="#c2603d"
                                       onchange="this.previousElementSibling.value = this.value"
                                       class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                       placeholder="#c2603d">
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" name="stories[${storyCount}][has_logo]" value="1"
                                   class="story-logo-checkbox rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500">
                            <span class="mr-2 text-sm text-gray-700">إظهار الشعار في هذا الستوري</span>
                        </label>
                    </div>
                </div>
            `;
            
            if (initialText) {
                newStory.querySelector('.story-text-input').value = initialText;
            }

            container.appendChild(newStory);
            
            // Sync the new checkbox with master checkbox state
            const masterCheckbox = document.getElementById('masterLogoCheckbox');
            const newCheckbox = newStory.querySelector('.story-logo-checkbox');
            if (masterCheckbox && newCheckbox) {
                newCheckbox.checked = masterCheckbox.checked;
            }
            
            // Sync RTL style with the new inputs
            const rtlCheckbox = document.getElementById('rtlCheckbox');
            if (rtlCheckbox && rtlCheckbox.checked) {
                const newInputs = newStory.querySelectorAll('input[type="text"], input[type="url"], textarea');
                newInputs.forEach(input => {
                    input.style.direction = 'rtl';
                    input.style.textAlign = 'right';
                });
            }
            
            storyCount++;
        }

        function removeStory(button) {
            const storyItem = button.closest('.story-item');
            storyItem.remove();
            updateStoryNumbers();
        }

        function updateStoryNumbers() {
            const items = document.querySelectorAll('.story-item');
            items.forEach((item, index) => {
                const title = item.querySelector('h4');
                title.textContent = `📖 Story ${index + 1}`;
            });
        }
        
        // Save carousels to database
        async function saveCarouselsToDB() {
            const postId = document.getElementById('postId').value;
            
            if (!postId) {
                alert('لا يوجد معرف منشور للحفظ / No post ID to save');
                return;
            }
            
            // Collect all story texts and subtitles
            const stories = [];
            let headline = '';
            const storyItems = document.querySelectorAll('.story-item');
            
            storyItems.forEach((item, index) => {
                const textInput = item.querySelector('input[name*="[text]"]');
                const subtitleInput = item.querySelector('textarea[name*="[subtitle]"]');
                
                if (index === 0) {
                    // First item is the headline
                    headline = textInput ? textInput.value : '';
                } else if (textInput && textInput.value && textInput.value.trim() !== '') {
                    // Skip any with empty content
                    stories.push({
                        content: textInput.value,
                        description: subtitleInput ? subtitleInput.value : '',
                        position: index // Position matches the story index (DB starts at 1)
                    });
                }
            });
            
            // Show loading state
            const saveBtn = event.target;
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'جاري الحفظ... Saving...';
            saveBtn.disabled = true;
            
            try {
                const response = await fetch('{{ route('stories.save') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({
                        post_id: postId,
                        headline: headline,
                        carousels: stories
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    saveBtn.textContent = '✅ تم الحفظ! Saved!';
                    setTimeout(() => {
                        saveBtn.textContent = originalText;
                        saveBtn.disabled = false;
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Failed to save');
                }
                
            } catch (error) {
                console.error('Error saving:', error);
                alert('حدث خطأ أثناء الحفظ / Error saving: ' + error.message);
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }
        }
    </script>

    <!-- Freepik Search Modal -->
    <div id="freepikModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeFreepikModal(event)" style="overflow-y: auto;">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full" onclick="event.stopPropagation()">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h3 class="text-xl font-bold text-white">🔍 بحث عن صور من Freepik</h3>
                <button type="button" onclick="closeFreepikModal()" class="text-white hover:text-gray-200 text-2xl font-bold">
                    ×
                </button>
            </div>
            
            <!-- Search Input -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex gap-2">
                    <input type="text" 
                           id="freepikSearchInput" 
                           placeholder="ابحث عن صور... (مثال: nature, business, technology)"
                           class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                           onkeypress="if(event.key === 'Enter') performFreepikSearch()">
                    <button type="button" 
                            onclick="performFreepikSearch()"
                            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold">
                        بحث
                    </button>
                </div>
            </div>
            
            <!-- Loading Indicator -->
            <div id="freepikLoading" class="hidden p-8 text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p class="mt-4 text-gray-600">جاري البحث...</p>
            </div>
            
            <!-- Results Grid - Fixed height with scroll -->
            <div class="p-6 overflow-y-scroll" style="max-height: 500px;">
                <div id="freepikResults" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <p class="col-span-full text-center text-gray-500 py-8">ابدأ البحث لعرض النتائج</p>
                </div>
            </div>
            
            <!-- Close Button -->
            <div class="p-4 border-t border-gray-200 flex justify-center">
                <button type="button" 
                        onclick="closeFreepikModal()"
                        class="px-8 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-semibold">
                    إغلاق
                </button>
            </div>
        </div>
    </div>

    <script>
        let currentStoryIndex = null;
        
        function openFreepikModal(storyIndex) {
            currentStoryIndex = storyIndex;
            document.getElementById('freepikModal').classList.remove('hidden');
            document.getElementById('freepikSearchInput').focus();
            document.body.style.overflow = 'hidden';
        }
        
        function closeFreepikModal(event) {
            if (!event || event.target.id === 'freepikModal') {
                document.getElementById('freepikModal').classList.add('hidden');
                currentStoryIndex = null;
                document.body.style.overflow = '';
            }
        }
        
        async function performFreepikSearch() {
            const query = document.getElementById('freepikSearchInput').value.trim();
            
            if (!query) {
                alert('الرجاء إدخال كلمة بحث');
                return;
            }
            
            const loadingDiv = document.getElementById('freepikLoading');
            const resultsDiv = document.getElementById('freepikResults');
            
            // Show loading
            loadingDiv.classList.remove('hidden');
            resultsDiv.innerHTML = '';
            
            try {
                const response = await fetch('{{ route('stories.freepik.search') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ query: query })
                });
                
                const data = await response.json();
                
                // Hide loading
                loadingDiv.classList.add('hidden');
                
                if (!response.ok || data.error) {
                    resultsDiv.innerHTML = `<p class="col-span-full text-center text-red-500 py-8">${data.error || 'حدث خطأ أثناء البحث'}</p>`;
                    return;
                }
                
                if (!data.data || !data.data.data || data.data.data.length === 0) {
                    resultsDiv.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">لم يتم العثور على نتائج</p>';
                    return;
                }
                
                // Display results
                displayFreepikResults(data.data.data);
                
            } catch (error) {
                loadingDiv.classList.add('hidden');
                resultsDiv.innerHTML = `<p class="col-span-full text-center text-red-500 py-8">حدث خطأ: ${error.message}</p>`;
            }
        }
        
        function displayFreepikResults(images) {
            const resultsDiv = document.getElementById('freepikResults');
            resultsDiv.innerHTML = '';
            
            images.forEach(image => {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-200';
                imageDiv.onclick = () => selectFreepikImage(image);
                
                // Get the image URL
                let imageUrl = '';
                if (image.image && image.image.source && image.image.source.url) {
                    imageUrl = image.image.source.url;
                } else if (image.thumbnails && image.thumbnails.length > 0) {
                    imageUrl = image.thumbnails[0].url;
                }
                
                imageDiv.innerHTML = `
                    <img src="${imageUrl}" 
                         alt="${image.title || 'Freepik Image'}" 
                         class="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-200">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                        <span class="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            اختر هذه الصورة
                        </span>
                    </div>
                `;
                
                resultsDiv.appendChild(imageDiv);
            });
        }
        
        function selectFreepikImage(image) {
            if (currentStoryIndex === null) return;
            
            // Get the best quality image URL
            let imageUrl = '';
            if (image.image && image.image.source && image.image.source.url) {
                imageUrl = image.image.source.url;
            } else if (image.thumbnails && image.thumbnails.length > 0) {
                imageUrl = image.thumbnails[image.thumbnails.length - 1].url; // Get largest thumbnail
            }
            
            // Find the correct input field
            const storyItems = document.querySelectorAll('.story-item');
            storyItems.forEach((item, index) => {
                if (item.dataset.index == currentStoryIndex || index == currentStoryIndex) {
                    const urlInput = item.querySelector('.story-bg-url');
                    if (urlInput) {
                        urlInput.value = imageUrl;
                    }
                }
            });
            
            closeFreepikModal();
        }
    </script>
</x-app-layout>

