import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import qlib
from qlib.constant import REG_CN
from qlib.utils import init_instance_by_config
from qlib.workflow import R
from qlib.workflow.record_temp import SignalRecord, PortAnaRecord
from qlib.data.dataset.handler import DataHandlerLP
import pandas as pd
from datetime import datetime
import pytz
import numpy as np
from typing import List, Dict, Any
from .quantum_service import QuantumTradingService

app = FastAPI(title="Quantum Trading Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Qlib
provider_uri = "~/.qlib/qlib_data/cn_data"  # target_dir
qlib.init(provider_uri=provider_uri, region=REG_CN)

# Initialize services
quantum_service = QuantumTradingService()

@app.on_event("startup")
async def startup_event():
    await quantum_service.initialize_services()

@app.get("/api/market-status")
async def get_market_status():
    try:
        # Get market data using Qlib
        instruments = ["AAPL", "TSLA", "GOOGL"]  # Example instruments
        fields = ["$close", "$volume", "$factor", "$change"]
        
        market_data = {}
        for instrument in instruments:
            data = R.get_data(
                instruments=instrument,
                fields=fields,
                start_time="2023-01-01",
                end_time=datetime.now().strftime("%Y-%m-%d")
            )
            market_data[instrument] = data.to_dict('records')
        
        return {
            "status": "success",
            "data": market_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/train-model")
async def train_model(model_config: dict):
    try:
        model = init_instance_by_config(model_config)
        dataset = R.get_data()
        model.fit(dataset)
        
        return {
            "status": "success",
            "model_id": str(model.id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backtest")
async def run_backtest(config: dict):
    try:
        backtest_config = {
            "start_time": "2023-01-01",
            "end_time": "2024-01-01",
            "account": 100000,
            "benchmark": "AAPL",
            "exchange_kwargs": {
                "limit_threshold": 0.095,
                "deal_price": "close",
                "open_cost": 0.0005,
                "close_cost": 0.0015,
                "min_cost": 5,
            },
        }
        
        # Initialize backtest environment
        backtest = R.get_backtest(backtest_config)
        results = backtest.run()
        
        return {
            "status": "success",
            "results": results.to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio-analysis")
async def get_portfolio_analysis():
    try:
        portfolio = R.get_portfolio()
        analysis = PortAnaRecord(portfolio)
        metrics = analysis.get_metrics()
        
        return {
            "status": "success",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-analysis")
async def get_market_analysis(symbols: List[str]):
    """Get comprehensive market analysis"""
    try:
        return await quantum_service.get_market_analysis(symbols)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-regime")
async def get_market_regime(symbols: List[str]):
    """Get current market regime analysis"""
    try:
        return await quantum_service._detect_market_regime(symbols)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alpha-signals")
async def get_alpha_signals(symbols: List[str]):
    """Get alpha signals for given symbols"""
    try:
        return await quantum_service._generate_alpha_signals(symbols)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/optimize")
async def optimize_portfolio(portfolio_id: str, constraints: Dict[str, Any]):
    """Optimize portfolio with given constraints"""
    try:
        return await quantum_service.optimize_portfolio(portfolio_id, constraints)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/analytics/{portfolio_id}")
async def get_portfolio_analytics(portfolio_id: str):
    """Get comprehensive portfolio analytics"""
    try:
        return await quantum_service.get_portfolio_analytics(portfolio_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trades/execute")
async def execute_trades(trades: List[Dict[str, Any]], execution_style: str = "vwap"):
    """Execute trades with specified algorithm"""
    try:
        return await quantum_service.execute_trades(trades, execution_style)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5100)