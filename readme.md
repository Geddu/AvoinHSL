# 🚋 HSL Stop Inspector

A modern web application for exploring and analyzing Helsinki public transport stops in real-time.

## 🌟 Live Demo

Check out the live demo of the HSL Stop Inspector:

[https://avoinhsl.netlify.app/](https://avoinhsl.netlify.app/)

![HSL Stop Inspector Screenshot](https://cdn.discordapp.com/attachments/998966959175634977/1338300873494892575/image.png?ex=67aa9550&is=67a943d0&hm=be7f1364647a54c167d5c772c087b066b66b4a0b2853eb293615e3dbecc5628a&)

## ✨ Features

- **Interactive Map**: Click anywhere in Helsinki to explore nearby public transport stops
- **Real-time Data**: Live information about stops, routes, and departures from HSL API
- **Transport Statistics**: Visual breakdown of transport modes in selected area
- **Stop Analysis**:
  - Peak Hours Visualization
  - Delay Statistics
  - Route Frequency Heatmap
- **Smart Filtering**: Search and filter stops by transport mode
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Geddu/AvoinHSL.git
cd hsl-stop-inspector
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file with your HSL API credentials:

```env
NEXT_PUBLIC_HSL_API_URL=(your api url)
```

You can get your api url from [here](https://digitransit.fi/en/developers/api-registration/)

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Built With

- Next.js 14
- Apollo Client
- Leaflet Maps
- TypeScript
- SCSS Modules

## 🔄 Future Improvements

1. **Performance Optimizations**

   - Implement data caching for frequently accessed stops
   - Optimize bundle size

2. **Feature Enhancements**

   - Add route path visualization on map
   - Add historical delay analysis

3. **User Experience**

   - Add more interactive tooltips and guides
   - Implement dark mode
   - Add accessibility improvements
   - Support for multiple languages

4. **Technical Debt**
   - Improve error handling
   - Add comprehensive test coverage
   - Implement proper error boundaries
   - Add proper loading states for all data fetching

## 🤔 Difficulties

- Getting the data from the HSL API was the most difficult part.
- The data is not very consistent and sometimes the stop name is not available.
- Their documentation could use some work.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Data provided by [HSL Open Data](https://www.hsl.fi/en/hsl/open-data)
- Icons and emojis from [OpenMoji](https://openmoji.org/)
