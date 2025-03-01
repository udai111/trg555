import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { formatCurrency } from '../../../utils/formatters';

interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

interface SpendingAnalyticsWidgetProps {
  spending: {
    totalSpent: number;
    byCategory: CategorySpending[];
  };
}

const SpendingAnalyticsWidget: React.FC<SpendingAnalyticsWidgetProps> = ({ spending }) => {
  const chartData = spending.byCategory.map((item) => ({
    id: item.category,
    value: item.amount,
    label: item.category,
    color: item.color,
  }));

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Spending by Category
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Total Spent This Month
        </Typography>
        <Typography variant="h5">
          {formatCurrency(spending.totalSpent, 'USD')}
        </Typography>
      </Box>
      
      <Box sx={{ height: 200, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <PieChart
          series={[
            {
              data: chartData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30 },
            },
          ]}
          height={200}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
            },
          }}
        />
      </Box>
      
      <Box sx={{ mt: 2 }}>
        {spending.byCategory.slice(0, 3).map((item) => (
          <Box 
            key={item.category} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 0.5 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  backgroundColor: item.color,
                  mr: 1 
                }} 
              />
              <Typography variant="body2">{item.category}</Typography>
            </Box>
            <Typography variant="body2">
              {formatCurrency(item.amount, 'USD')}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default SpendingAnalyticsWidget;
