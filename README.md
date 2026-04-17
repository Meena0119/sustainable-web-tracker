# Sustainable Web Tracker

A clean, modern Google Chrome extension that tracks the carbon footprint of the websites you visit! 🌍

## Features
- **Carbon Estimator:** Automatically tracks how much data each website downloads and estimates the CO₂ emissions (1 MB = ~0.5g CO₂).
- **Green Host Check:** Checks if the website is hosted using renewable energy (powered by The Green Web Foundation API).
- **Lifetime Tracking:** Keeps a running total of the data you've downloaded across all sites.
- **Premium UI:** Uses a beautiful "glassmorphism" design that shifts from green (eco-friendly) to red (high emissions).

## How to Install (for Chrome)

1. Open Google Chrome.
2. In the top URL bar, type: `chrome://extensions/` and hit Enter.
3. In the top right corner, turn on **Developer mode**.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this project (the `kuch bhi` folder on your Desktop).
6. That's it! You should now see the little puzzle piece (or leaf, if you add an icon later) in your browser toolbar. Pin it to access it easily!

## How it works

- **`manifest.json`**: This is the instruction manual that tells Chrome what our extension is and what permissions it needs.
- **`background.js`**: This is the engine. It runs in the background, listening to every web request to count how many bytes of data are being transferred. It also checks The Green Web Foundation API to see if the website is green.
- **`popup.html` & `popup.css`**: These create the user interface you see when you click the extension. The CSS uses modern gradients and blur effects to look sleek.
- **`popup.js`**: The brains of the popup. It talks to `background.js`, gets the current numbers, does the math (converting bytes to megabytes and CO₂), and updates the screen.

Have fun saving the planet! 🌱
