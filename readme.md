# 🚋 HSL Stop Inspector

A modern web application for exploring and analyzing Helsinki public transport stops in real-time.

![HSL Stop Inspector Screenshot](public/screenshot.png)

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

bash
git clone https://github.com/yourusername/hsl-stop-inspector.git
cd hsl-stop-inspector

2. Install dependencies:

bash
pnpm install

3. Create a `.env.local` file with your HSL API credentials:

env
NEXT_PUBLIC_HSL_API_URL=https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql


4. Start the development server:

bash
pnpm dev

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
   - Add request debouncing for map interactions
   - Optimize bundle size

2. **Feature Enhancements**
   - Add route path visualization on map
   - Implement favorite stops functionality
   - Add historical delay analysis
   - Support for comparing multiple locations

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Data provided by [HSL Open Data](https://www.hsl.fi/en/hsl/open-data)
- Icons and emojis from [OpenMoji](https://openmoji.org/)