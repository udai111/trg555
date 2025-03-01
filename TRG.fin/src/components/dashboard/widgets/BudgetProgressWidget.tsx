import React from 'react';
import { Paper, Typography, Box, LinearProgress, Divider } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  currency: string;
}

interface BudgetProgressWidgetProps {
  budgets: Budget[];
}

const BudgetProgressWidget: React.FC<BudgetProgressWidgetProps> = ({ budgets }) => {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Budget Progress
      </Typography>
      
      {budgets.map((budget) => {
        const progress = (budget.spent / budget.allocated) * 100;
        const isOverBudget = progress > 100;
        
        return (
          <Box key={budget.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{budget.category}</Typography>
              <Typography variant="body2">
                {formatCurrency(budget.spent, budget.currency)} / {formatCurrency(budget.allocated, budget.currency)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              color={isOverBudget ? 'error' : progress > 80 ? 'warning' : 'primary'}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        );
      })}
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="subtitle2">Total Budget</Typography>
        <Typography variant="subtitle2">
          {formatCurrency(
            budgets.reduce((sum, budget) => sum + budget.spent, 0),
            'USD'
          )} / {formatCurrency(
            budgets.reduce((sum, budget) => sum + budget.allocated, 0),
            'USD'
          )}
        </Typography>
      </Box>
    </Paper>
  );
};

export default BudgetProgressWidget;
