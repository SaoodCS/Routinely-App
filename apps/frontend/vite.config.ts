import { combinePresetAndAppleSplashScreens, minimal2023Preset } from '@vite-pwa/assets-generator/config';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const BG_COLOR = '#071018';

export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: 'autoUpdate',
         devOptions: { enabled: true },
         manifest: {
            name: 'Routinely',
            short_name: 'Routinely', // this is the name seen when the app is installed as a PWA on iOS
            description: 'manage your routine',
            categories: ['Productivity'],
            background_color: BG_COLOR,
            theme_color: BG_COLOR,
            orientation: 'natural',
            display: 'standalone',
            start_url: '/?application=true',
            scope: '/',
            id: '/',
            icons: [
               { src: 'logo-64x64.png', sizes: '64x64', type: 'image/png' },
               { src: 'logo-192x192.png', sizes: '192x192', type: 'image/png' },
               { src: 'logo-512x512.png', sizes: '512x512', type: 'image/png' },
               { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
         },
         // generates Apple splash screens and adds them to dist/index.html at build
         pwaAssets: {
            injectThemeColor: false,
            image: 'public/logo-512x512.png',
            preset: combinePresetAndAppleSplashScreens(
               {
                  ...minimal2023Preset,
                  apple: { ...minimal2023Preset.apple, sizes: [] },
                  transparent: { ...minimal2023Preset.transparent, sizes: [], favicons: [] },
                  maskable: { ...minimal2023Preset.maskable, sizes: [] },
               },
               {
                  resizeOptions: { background: BG_COLOR },
                  name: (landscape, size) => `apple-splash-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`,
               },
            ),
         },
      }),
   ],
});
