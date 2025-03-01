import axios from 'axios';
import { parse } from 'date-fns';
import { NSE_API_BASE_URL } from '../config';

export class NSEService {
  private readonly api: any;

  constructor() {
    this.api = axios.create({
      baseURL: NSE_API_BASE_URL,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
  }

  async getQuote(symbol: string) {
    try {
      const response = await this.api.get(`/api/quote-equity?symbol=${symbol}`);
      const data = response.data;
      
      return {
        symbol,
        name: data.info.companyName,
        price: parseFloat(data.priceInfo.lastPrice),
        change: parseFloat(data.priceInfo.change),
        changePercent: parseFloat(data.priceInfo.pChange),
        volume: parseInt(data.preOpenMarket.totalTradedVolume),
        marketCap: parseFloat(data.securityInfo.marketCap),
        sector: data.metadata.industry,
        open: parseFloat(data.priceInfo.open),
        high: parseFloat(data.priceInfo.intraDayHighLow.max),
        low: parseFloat(data.priceInfo.intraDayHighLow.min),
        previousClose: parseFloat(data.priceInfo.previousClose),
        dayRange: {
          min: parseFloat(data.priceInfo.intraDayHighLow.min),
          max: parseFloat(data.priceInfo.intraDayHighLow.max)
        },
        yearRange: {
          min: parseFloat(data.priceInfo.weekHighLow.min),
          max: parseFloat(data.priceInfo.weekHighLow.max)
        }
      };
    } catch (error) {
      console.error('Error fetching NSE quote:', error);
      throw error;
    }
  }

  async getHistory(symbol: string, timeframe: string) {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '1D':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '1W':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      const response = await this.api.get('/api/historical/cm/equity', {
        params: {
          symbol,
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        }
      });

      return response.data.data.map((item: any) => ({
        date: item.CH_TIMESTAMP,
        open: parseFloat(item.CH_OPENING_PRICE),
        high: parseFloat(item.CH_HIGH_PRICE),
        low: parseFloat(item.CH_LOW_PRICE),
        close: parseFloat(item.CH_CLOSING_PRICE),
        volume: parseInt(item.CH_TRADED_QTY),
        deliveryQuantity: parseInt(item.CH_DELIVERY_QTY || 0),
        deliveryPercentage: parseFloat(item.CH_DELIVERY_PERCENTAGE || 0)
      }));
    } catch (error) {
      console.error('Error fetching NSE history:', error);
      throw error;
    }
  }

  async getStockDetails(symbol: string) {
    try {
      const response = await this.api.get(`/api/equity-meta`, {
        params: { symbol }
      });
      
      const data = response.data;
      return {
        symbol,
        companyName: data.info.companyName,
        industry: data.metadata.industry,
        sector: data.metadata.sector,
        marketCap: parseFloat(data.securityInfo.marketCap),
        faceValue: parseFloat(data.metadata.faceValue),
        issuedSize: parseInt(data.metadata.issuedSize),
        listingDate: data.metadata.listingDate,
        fundamentals: {
          pe: parseFloat(data.metadata.pe),
          eps: parseFloat(data.metadata.eps),
          pb: parseFloat(data.metadata.pb),
          roe: parseFloat(data.metadata.roe),
          dividend: parseFloat(data.metadata.dividend)
        },
        shareholding: {
          promoters: parseFloat(data.shareholding.promoterHolding),
          fii: parseFloat(data.shareholding.fiiHolding),
          dii: parseFloat(data.shareholding.diiHolding),
          public: parseFloat(data.shareholding.publicHolding)
        }
      };
    } catch (error) {
      console.error('Error fetching NSE stock details:', error);
      throw error;
    }
  }

  async getSectorData(sector: string) {
    try {
      const response = await this.api.get('/api/equity-stock-indices', {
        params: { index: sector }
      });
      
      return {
        name: sector,
        performance: {
          daily: parseFloat(response.data.data.percChange),
          monthly: parseFloat(response.data.data.perChange30d),
          yearly: parseFloat(response.data.data.perChange365d)
        },
        marketCap: parseFloat(response.data.data.marketCap),
        pe: parseFloat(response.data.data.pe),
        pb: parseFloat(response.data.data.pb),
        dividendYield: parseFloat(response.data.data.yield),
        constituents: response.data.data.constituents.map((stock: any) => ({
          symbol: stock.symbol,
          weightage: parseFloat(stock.weightage),
          marketCap: parseFloat(stock.marketCap)
        }))
      };
    } catch (error) {
      console.error('Error fetching NSE sector data:', error);
      throw error;
    }
  }

  async getOptionChain(symbol: string) {
    try {
      const response = await this.api.get('/api/option-chain-equities', {
        params: { symbol }
      });
      
      const data = response.data.records;
      return {
        underlyingValue: parseFloat(data.underlyingValue),
        expiryDates: data.expiryDates,
        strikePrices: data.strikePrices,
        calls: data.data.map((item: any) => ({
          strikePrice: parseFloat(item.strikePrice),
          expiryDate: item.expiryDate,
          openInterest: parseInt(item.CE.openInterest),
          changeinOpenInterest: parseInt(item.CE.changeinOpenInterest),
          totalTradedVolume: parseInt(item.CE.totalTradedVolume),
          impliedVolatility: parseFloat(item.CE.impliedVolatility),
          lastPrice: parseFloat(item.CE.lastPrice),
          change: parseFloat(item.CE.change),
          bidQty: parseInt(item.CE.bidQty),
          bidprice: parseFloat(item.CE.bidprice),
          askQty: parseInt(item.CE.askQty),
          askPrice: parseFloat(item.CE.askPrice)
        })),
        puts: data.data.map((item: any) => ({
          strikePrice: parseFloat(item.strikePrice),
          expiryDate: item.expiryDate,
          openInterest: parseInt(item.PE.openInterest),
          changeinOpenInterest: parseInt(item.PE.changeinOpenInterest),
          totalTradedVolume: parseInt(item.PE.totalTradedVolume),
          impliedVolatility: parseFloat(item.PE.impliedVolatility),
          lastPrice: parseFloat(item.PE.lastPrice),
          change: parseFloat(item.PE.change),
          bidQty: parseInt(item.PE.bidQty),
          bidprice: parseFloat(item.PE.bidprice),
          askQty: parseInt(item.PE.askQty),
          askPrice: parseFloat(item.PE.askPrice)
        }))
      };
    } catch (error) {
      console.error('Error fetching NSE option chain:', error);
      throw error;
    }
  }
} 