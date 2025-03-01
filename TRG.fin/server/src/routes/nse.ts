import express from 'express';
import { NSEService } from '../services/nse';
import { NSEPredictionService } from '../services/nse-prediction';
import { NSEScreenerService } from '../services/nse-screener';
import { BacktestService } from '../services/backtest';
import { validateSymbol, validateTimeframe } from '../middleware/validation';

const router = express.Router();
const nseService = new NSEService();
const predictionService = new NSEPredictionService();
const screenerService = new NSEScreenerService();
const backtestService = new BacktestService();

// Stock Data Routes
router.get('/stocks/nse/:symbol/quote', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await nseService.getQuote(symbol);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

router.get('/stocks/nse/:symbol/history', [validateSymbol, validateTimeframe], async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    const history = await nseService.getHistory(symbol, timeframe as string);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
});

router.get('/stocks/nse/:symbol/details', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const details = await nseService.getStockDetails(symbol);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

router.get('/stocks/nse/sector/:sector', async (req, res) => {
  try {
    const { sector } = req.params;
    const sectorData = await nseService.getSectorData(sector);
    res.json(sectorData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sector data' });
  }
});

router.get('/stocks/nse/:symbol/options', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const optionChain = await nseService.getOptionChain(symbol);
    res.json(optionChain);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch option chain' });
  }
});

// Prediction Routes
router.get('/predictions/nse/:symbol', [validateSymbol, validateTimeframe], async (req, res) => {
  try {
    const { symbol } = req.params;
    const { model, timeframe } = req.query;
    const prediction = await predictionService.getPrediction(
      symbol,
      model as string,
      timeframe as string
    );
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

router.get('/predictions/nse/:symbol/ensemble', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const prediction = await predictionService.getEnsemblePrediction(symbol);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ensemble prediction' });
  }
});

router.get('/predictions/nse/:symbol/sentiment', validateSymbol, async (req, res) => {
  try {
    const { symbol } = req.params;
    const sentiment = await predictionService.getSentimentAnalysis(symbol);
    res.json(sentiment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sentiment analysis' });
  }
});

// Strategy Routes
router.post('/strategies/backtest', async (req, res) => {
  try {
    const { symbol, settings } = req.body;
    const results = await backtestService.runBacktest(symbol, settings);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run backtest' });
  }
});

router.get('/strategies/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await backtestService.getPerformance(id);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch strategy performance' });
  }
});

router.post('/strategies/:id/optimize', async (req, res) => {
  try {
    const { id } = req.params;
    const params = req.body;
    const optimized = await backtestService.optimizeStrategy(id, params);
    res.json(optimized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to optimize strategy' });
  }
});

// Screener Routes
router.post('/screener/nse', async (req, res) => {
  try {
    const criteria = req.body;
    const results = await screenerService.runScreener(criteria);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run screener' });
  }
});

router.get('/screener/saved', async (req, res) => {
  try {
    const screeners = await screenerService.getSavedScreeners();
    res.json(screeners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved screeners' });
  }
});

router.post('/screener/save', async (req, res) => {
  try {
    const { name, criteria } = req.body;
    const saved = await screenerService.saveScreener(name, criteria);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save screener' });
  }
});

export default router; 