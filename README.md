# Weather Dashboard

A React-based weather dashboard that shows real-time weather data and forecasts. When you first open it, you'll see weather info for Bangalore and Jaipur. You can search for other cities and save them to your favorites.

## What it does

- Shows current weather and 7-day forecasts for cities you care about
- Updates weather data automatically every minute
- Has charts showing temperature trends over time
- Lets you switch between Celsius and Fahrenheit
- Works on phones, tablets, and desktops
- Saves your favorite cities in browser storage

## Built with

React, Redux Toolkit, Recharts, React Router, and Vite. Uses WeatherAPI.com for weather data.

## Getting started

You'll need Node.js installed and an API key from WeatherAPI.com (it's free).

```bash
# Install packages
npm install

# Copy the example env file and add your API key
cp .env.example .env
# Edit .env and paste your API key

# Run it locally
npm run dev
```

Then open http://localhost:5173 in your browser.

## Deploying to Vercel

Push your code to GitHub, then:

1. Go to vercel.com and import your repo
2. Set the framework to Vite
3. Add your API key as an environment variable named `VITE_WEATHER_API_KEY`
4. Deploy

That's it. Check [DEPLOYMENT.md](DEPLOYMENT.md) if you run into issues.

## How it works

The app fetches weather data every 60 seconds so you're always looking at current info. When you first visit, it loads Bangalore and Jaipur by default. Click the star icon on any city to save it to your favorites. Your favorites get stored in your browser, so they'll still be there when you come back.

Click on a city card to see detailed weather info, including hourly forecasts and a temperature chart. The data comes from WeatherAPI.com's free tier (1M calls/month, which is plenty).

## Project structure

```
src/
├── components/         # All the React components
├── services/          # API calls to WeatherAPI.com
├── store/             # Redux state management
└── App.jsx            # Main app
```

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## License

MIT
