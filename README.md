# PM Daily OS — Deploy Guide

## Files in this folder
- index.html       — main app
- sw.js            — service worker (enables push notifications)
- manifest.json    — PWA config (makes it installable)
- netlify.toml     — hosting config
- icons/           — app icons

## Deploy to Netlify (free, 2 min)

1. Go to https://app.netlify.com/drop
2. Drag this entire folder onto the page
3. Netlify gives you a URL like: https://yourapp.netlify.app
4. Done — share that URL

## Install on iPhone

1. Open the URL in Safari (must be Safari, not Chrome)
2. Tap the Share button (box with arrow at the bottom)
3. Scroll down → tap "Add to Home Screen"
4. Tap "Add" — the app appears on your home screen
5. Open it from the home screen (required for push to work)
6. Go to Settings tab → enable EOD reminder → set your time
7. Allow notifications when prompted

## Push Notifications

Requires iOS 16.4+ and the app must be opened from home screen (not Safari).
Once enabled, you'll get a push notification at your chosen time every day.
