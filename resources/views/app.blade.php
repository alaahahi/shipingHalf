<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>نظام هاف أوتو</title>
    <script>document.documentElement.lang = localStorage.getItem('locale') === 'en' ? 'en' : 'ar'; document.documentElement.dir = localStorage.getItem('locale') === 'en' ? 'ltr' : 'rtl'; if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');</script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>
