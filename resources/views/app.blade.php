<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>منصة حضور | مدرسة موال</title>
    <meta name="description" content="منصة حضور وغياب مدرسة موال - نظام إدارة الحضور والغياب للمدارس" />
    <meta name="author" content="مدرسة موال" />
    <meta property="og:title" content="منصة حضور | مدرسة موال" />
    <meta property="og:description" content="منصة حضور وغياب مدرسة موال" />
    <meta property="og:type" content="website" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite('resources/js/main.tsx')
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
