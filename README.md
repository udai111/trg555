# TRG.fin - Trading Platform

A comprehensive trading platform offering an immersive Stock Market Game with real-world market simulation and advanced educational features.

## Features

- React frontend with TypeScript
- Responsive design for mobile and desktop
- TradingView advanced charting
- Real-time market data integration
- NSE stocks and cryptocurrency trading simulation
- Enhanced mobile user experience
- Gamification and interactive learning elements

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/udai111/trgfin.git
cd trgfin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```
DATABASE_URL=your_database_url
PGHOST=your_db_host
PGPORT=your_db_port
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The project uses GitHub Actions for CI/CD. On every push to the `main` branch, it will:
1. Install dependencies
2. Build the project
3. Archive the build artifacts

### Required GitHub Secrets

Set up the following secrets in your GitHub repository settings:
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

## License

MIT

## Author

Tanuj Raj Gangwar
