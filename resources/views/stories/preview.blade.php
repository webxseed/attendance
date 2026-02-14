<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Stories Generator - مولد ستوريز إنستغرام</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', 'Arial', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        
        .page-header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .page-header h1 {
            font-size: 42px;
            font-weight: 900;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .page-header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .back-btn {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            margin-bottom: 15px;
            transition: all 0.3s;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .back-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .stories-container {
            display: flex;
            flex-direction: column;
            gap: 60px;
            width: 100%;
            max-width: 1200px;
        }
        
        .story-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        
        .story-title {
            font-size: 28px;
            color: white;
            font-weight: 700;
            text-align: center;
            padding: 15px 30px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .download-btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 15px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
        }
        
        .download-all-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 18px 50px;
            border-radius: 12px;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            transition: all 0.3s;
            margin-top: 20px;
        }
        
        .download-all-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
            background: #45a049;
        }
        
        .download-all-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            background: #999;
        }
        
        .download-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
            background: #f8f9ff;
        }
        
        .download-btn:active {
            transform: translateY(0);
        }
        
        .download-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .instagram-story {
            width: {{ $config['width'] }}px;
            height: {{ $config['height'] }}px;
            position: relative;
            overflow: hidden;
            background: #000;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            background-size:cover;
            background-position:center;
            background-repeat:no-repeat;
        }
        
        .background-image {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .gradient-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, 0.95) 0%,
                rgba(0, 0, 0, 0.85) 30%,
                rgba(0, 0, 0, 0.6) 50%,
                rgba(0, 0, 0, 0.3) 70%,
                rgba(0, 0, 0, 0) 100%
            );
        }
        
        .content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 60px 50px 20px;
        }
        
        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 0 0 auto;
        }
        
        .logo {
            max-width: 200px;
            max-height: 120px;
            object-fit: contain;
        }
        
        .text-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            text-align: center;
            direction: rtl;
            padding-bottom: 70px;
        }
        
        .main-text {
            font-size: 56px;
            font-weight: 900;
            color: #ffffff;
            line-height: 1.8;
            margin-bottom: 10px;
            font-family: 'Cairo', sans-serif;
        }
        
        .highlight {
            color: #c2603d;
        }
        
        .subtitle-text {
                font-size: 27px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.85);
                line-height: 1.8;
                margin-top: 20px;
                font-family: 'Cairo', sans-serif;
                white-space: pre-line;
                text-align: right;
        }
        
        .brand-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 25px;
            flex-direction: row-reverse;
            margin: 0 auto;
            margin-top: 50px;
            justify-content: center;
        }
        .brand-icon img {
            width: 65px;
            height: 65px;
            object-fit: contain;
        }
        .brand-icon {
            width: 65px;
            height: 65px;
        }
        
        .brand-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
            text-align: right;
        }
        
        .brand-name {
            font-size: 18px;
            color: #ffffff;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
            font-family: 'Cairo', sans-serif;
            flex-direction: row-reverse;
        }
        
        .brand-handle {
            font-size: 14px;
            color: #cccccc;
            font-family: 'Cairo', sans-serif;
        }
        
        .verified {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            background: #3b82f6;
            border-radius: 50%;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        /* Carousel Arrow Overlay */
        .carousel-arrow {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            background: rgba(195, 97, 62, 0.8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #fff;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            pointer-events: none;
            line-height: 52px;
        }
        
        .carousel-arrow::before {
            content: '›';
            font-size: 60px;
            height: 64px;
            display: flex;
            direction: ltr;
        }
        
        /* Responsive for preview */
        @media (max-width: 1200px) {
            .instagram-story {
                transform: scale(0.5);
                transform-origin: center;
            }
        }
        
        @media (max-width: 800px) {
            .instagram-story {
                transform: scale(0.35);
            }
            
            .page-header h1 {
                font-size: 32px;
            }
        }
    </style>
</head>
<body>
    <div class="page-header">
        <a href="{{ route('stories.index') }}" class="back-btn">← العودة للمحرر / Back to Editor</a>
        <h1>📱 Instagram Stories Generator</h1>
        <p>مولد ستوريز إنستغرام - {{ $totalStories }} {{ $config['format'] === 'post' ? 'Posts' : 'Stories' }} Ready to Download ({{ $config['width'] }}×{{ $config['height'] }})</p>
        <button class="download-all-btn" onclick="downloadAllImages()">
            📥 تحميل جميع الصور / Download All Stories
        </button>
    </div>
    
    <div class="stories-container">
        @foreach ($stories as $index => $story)
        @php $storyNum = $index + 1; @endphp
        <div class="story-item">
            <h2 class="story-title">📱 Story {{ $storyNum }} of {{ $totalStories }}</h2>
            <div class="instagram-story" id="instagram-story-{{ $storyNum }}" style="background: {{ $story['background_image'] ? '#000' : $story['background_color'] }}">
                @if($story['background_image'])
                <div class="background-image" style="background-image: url('{{ $story['background_image'] }}');"></div>
                <div class="gradient-overlay"></div>
                @endif
                
                <div class="content">
                    <div class="text-content">
                        <div class="main-text" style="color: {{ $story['text_color'] }}; font-size: {{ $storyNum === 1 ? '64px' : '56px' }}">
                            @foreach($story['segments'] as $segment)
                                @if($segment['type'] === 'highlight')
                                    <span class="highlight" style="color: {{ $story['highlight_color'] }}">{{ $segment['text'] }}</span>
                                @else
                                    {{ $segment['text'] }}
                                @endif
                            @endforeach
                        </div>
                        @if (!empty($story['subtitle']) || !empty($story['subtitle_segments']))
                        <div class="subtitle-text" style="color: {{ $story['text_color'] }}">
                            @if (!empty($story['subtitle_segments']))
                                @foreach($story['subtitle_segments'] as $segment)
                                    @if($segment['type'] === 'highlight')
                                        <span class="highlight" style="color: {{ $story['highlight_color'] }}">{{ $segment['text'] }}</span>
                                    @else
                                        {{ $segment['text'] }}
                                    @endif
                                @endforeach
                            @else
                                {{ $story['subtitle'] }}
                            @endif
                        </div>
                        @endif
                        @if ($story['hasLogo'])
                        <div class="brand-info">
                            <div class="brand-text">
                                <div class="brand-name">
                                    @if ($story['brand_verified'])
                                    <span class="verified">✓</span>
                                    @endif
                                    {{ $story['brand_name'] }}
                                </div>
                                <div class="brand-handle">{{ $story['brand_handle'] }}</div>
                            </div>
                            <div class="brand-icon"><img src="{{ $config['logo_data_uri'] }}" alt="Logo" class="logo"></div>
                        </div>
                        @endif
                    </div>
                </div>
                
                @if($storyNum < $totalStories)
                <div class="carousel-arrow"></div>
                @endif
            </div>
            
            <button class="download-btn" onclick="downloadImage({{ $storyNum }})">
                📥 تحميل Story {{ $storyNum }} / Download Story {{ $storyNum }}
            </button>
        </div>
        @endforeach
    </div>
    
    <script>
        const imageCache = new Map();
        const totalStories = {{ $totalStories }};
        const storyWidth = {{ $config['width'] }};
        const storyHeight = {{ $config['height'] }};

        function blobToDataURL(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to convert blob to data URL.'));
                reader.readAsDataURL(blob);
            });
        }

        async function ensureImageData(img) {
            if (img.dataset.prepared === 'true') {
                return;
            }

            if (img.src.startsWith('data:')) {
                if (img.decode) {
                    try {
                        await img.decode();
                    } catch (e) {
                        // Ignore decode fallback
                    }
                } else if (!img.complete) {
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                }

                img.dataset.prepared = 'true';
                return;
            }

            const url = img.src;

            try {
                let dataUrl;
                if (imageCache.has(url)) {
                    dataUrl = imageCache.get(url);
                } else {
                    const response = await fetch(url, { mode: 'cors', cache: 'reload' });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${url} (status ${response.status})`);
                    }
                    const blob = await response.blob();
                    dataUrl = await blobToDataURL(blob);
                    imageCache.set(url, dataUrl);
                }

                img.src = dataUrl;

                if (img.decode) {
                    try {
                        await img.decode();
                    } catch (e) {
                        // Ignore decode fallback
                    }
                } else if (!img.complete) {
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                }

                img.dataset.prepared = 'true';
            } catch (error) {
                console.error('Image preparation error:', error);
                // Continue even if image fails, to at least render text
            }
        }

        async function ensureBackgroundImageData(div) {
            if (div.dataset.prepared === 'true') return;
            
            let bg = div.style.backgroundImage;
            // bg is like 'url("...")' which might be wrapped in quotes
            if (!bg || bg === 'none') return;
            
            // Extract URL simple parsing
            let url = bg.slice(4, -1).replace(/^["']|["']$/g, "");
            
            if (!url || url.startsWith('data:')) {
                div.dataset.prepared = 'true';
                return;
            }

            try {
                let dataUrl;
                if (imageCache.has(url)) {
                    dataUrl = imageCache.get(url);
                } else {
                    const response = await fetch(url, { mode: 'cors', cache: 'reload' });
                    if (!response.ok) throw new Error('Fetch failed');
                    const blob = await response.blob();
                    dataUrl = await blobToDataURL(blob);
                    imageCache.set(url, dataUrl);
                }
                div.style.backgroundImage = `url('${dataUrl}')`;
                div.dataset.prepared = 'true';
            } catch (e) {
                console.error("Failed to load background image", e);
            }
        }

        async function prepareImages(element) {
            // Process img tags
            const images = element.querySelectorAll('img');
            for (const img of images) {
                await ensureImageData(img);
            }
            
            // Process background images
            const bgDivs = element.querySelectorAll('.background-image');
            for (const div of bgDivs) {
                 await ensureBackgroundImageData(div);
            }
        }

        async function generateCanvas(sourceElement) {
            // 1. Prepare images first on the visible element
            await prepareImages(sourceElement);

            // 2. Clone the element to render it at full size (without CSS transforms)
            const clone = sourceElement.cloneNode(true);
            
            // 3. Reset styles on the clone to ensure full 1080x1920 rendering
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.position = 'fixed';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.zIndex = '-9999';
            clone.style.width = `${storyWidth}px`;
            clone.style.height = `${storyHeight}px`;
            clone.style.borderRadius = '0'; 
            
            // Append to body so it can be rendered
            document.body.appendChild(clone);

            try {
                // 4. Capture the clone
                const canvas = await html2canvas(clone, {
                    scale: 1, 
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#000000',
                    width: storyWidth,
                    height: storyHeight,
                    logging: false,
                    onclone: (clonedDoc) => {
                        // Cloning might revert JS changes to inline styles if not careful, 
                        // but cloneNode(true) usually copies current state including inline styles.
                    }
                });
                
                return canvas;
            } finally {
                // 5. Clean up
                document.body.removeChild(clone);
            }
        }

        async function downloadImage(storyNumber) {
            const element = document.getElementById('instagram-story-' + storyNumber);
            const buttons = document.querySelectorAll('.download-btn');
            const currentButton = buttons[storyNumber - 1];
            
            const originalText = currentButton.textContent;
            currentButton.textContent = 'جاري التحميل... Loading...';
            currentButton.disabled = true;
            
            try {
                const canvas = await generateCanvas(element);

                const blob = await new Promise((resolve, reject) => {
                    canvas.toBlob(function(result) {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(new Error('Unable to create image blob.'));
                        }
                    }, 'image/png', 1.0);
                });

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'instagram-{{ $config['format'] }}-' + storyNumber + '-' + Date.now() + '.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                currentButton.textContent = '✅ تم التحميل! Downloaded!';
                setTimeout(() => {
                    currentButton.textContent = originalText;
                    currentButton.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Error generating image:', error);
                alert('تعذر تحميل الصور بسبب مشكلة في التحميل أو الحقوق. / Error downloading image.');
                currentButton.textContent = originalText;
                currentButton.disabled = false;
            }
        }
        
        async function downloadAllImages() {
            const downloadAllBtn = document.querySelector('.download-all-btn');
            const originalText = downloadAllBtn.textContent;
            
            downloadAllBtn.textContent = 'جاري التحميل... Processing...';
            downloadAllBtn.disabled = true;
            
            try {
                for (let i = 1; i <= totalStories; i++) {
                    downloadAllBtn.textContent = `جاري التحميل ${i}/${totalStories}... Processing ${i}/${totalStories}`;
                    
                    const element = document.getElementById('instagram-story-' + i);
                    const canvas = await generateCanvas(element);

                    const blob = await new Promise((resolve, reject) => {
                        canvas.toBlob(function(result) {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(new Error('Unable to create image blob.'));
                            }
                        }, 'image/png', 1.0);
                    });

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'instagram-{{ $config['format'] }}-' + i + '-' + Date.now() + '.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    // Small delay between downloads
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                downloadAllBtn.textContent = '✅ تم تحميل الكل! All Downloaded!';
                setTimeout(() => {
                    downloadAllBtn.textContent = originalText;
                    downloadAllBtn.disabled = false;
                }, 3000);
                
            } catch (error) {
                console.error('Error generating images:', error);
                alert('تعذر تحميل الصور بسبب مشكلة في التحميل أو الحقوق. / Error downloading images.');
                downloadAllBtn.textContent = originalText;
                downloadAllBtn.disabled = false;
            }
        }

    </script>
</body>
</html>
