import '../css/app.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from './components/Locale';

createInertiaApp({
    title: (title) => (title ? `${title} - هاف أوتو` : 'هاف أوتو'),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')) as any,
    setup({ el, App, props }) {
        if (!el) return;
        createRoot(el).render(<LocaleProvider><App {...props} /></LocaleProvider>);
    },
    progress: { color: '#0f766e' },
});
