import React from 'react';
import { Paper, Typography, Box, Divider, Chip, Stack } from '@mui/material';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface PortfolioItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  allocation: number;
}

interface PortfolioSummaryWidgetProps {
  portfolio: {
    totalValue: number;
    dailyChange: number;
    dailyChangePercentage: number;
    items: PortfolioItem[];
  };
}

const PortfolioSummaryWidget: React.FC<PortfolioSummaryWidgetProps> = ({ portfolio }) => {
  const isPositiveChange = portfolio.dailyChange >= 0;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Investment Portfolio
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Total Value
        </Typography>
        <Typography variant="h4">
          {formatCurrency(portfolio.totalValue, 'USD')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          {isPositiveChange ? (
            <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
          ) : (
            <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
          )}
          <Typography 
            variant="body2" 
            color={isPositiveChange ? 'success.main' : 'error.main'}
          >
            {isPositiveChange ? '+' : ''}
            {formatCurrency(portfolio.dailyChange, 'USD')} ({formatPercentage(portfolio.dailyChangePercentage)})
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
        Top Holdings
      </Typography>
      
      <Stack spacing={1}>
        {portfolio.items.slice(0, 3).map((item) => (
          <Box key={item.symbol} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2">{item.symbol}</Typography>
              <Typography variant="caption" color="text.secondary">{item.name}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">{formatCurrency(item.value, 'USD')}</Typography>
              <Chip 
                label={`${formatPercentage(item.change)}`}
                size="small"
                color={item.change >= 0 ? 'success' : 'error'}
                variant="outlined"
                sx={{ height: 20 }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default PortfolioSummaryWidget;
