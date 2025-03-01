import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { fetchUserFinancialData } from '../../services/financialService';
import AccountBalanceWidget from './widgets/AccountBalanceWidget';
import RecentTransactionsWidget from './widgets/RecentTransactionsWidget';
import BudgetProgressWidget from './widgets/BudgetProgressWidget';
import PortfolioSummaryWidget from './widgets/PortfolioSummaryWidget';
import SpendingAnalyticsWidget from './widgets/SpendingAnalyticsWidget';

interface FinancialData {
  accounts: any[];
  transactions: any[];
  budgets: any[];
  portfolio: any;
  spending: any;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const data = await fetchUserFinancialData(user.id);
          setFinancialData(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (isLoading) return <Box sx={{ textAlign: 'center', mt: 4 }}>Loading your financial overview...</Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>{error}</Box>;
  if (!financialData) return <Box sx={{ textAlign: 'center', mt: 4 }}>No financial data available</Box>;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.displayName || 'User'}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Top Row */}
        <Grid item xs={12} md={6}>
          <AccountBalanceWidget accounts={financialData.accounts} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BudgetProgressWidget budgets={financialData.budgets} />
        </Grid>
        
        {/* Middle Row */}
        <Grid item xs={12}>
          <RecentTransactionsWidget transactions={financialData.transactions} />
        </Grid>
        
        {/* Bottom Row */}
        <Grid item xs={12} md={6}>
          <PortfolioSummaryWidget portfolio={financialData.portfolio} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SpendingAnalyticsWidget spending={financialData.spending} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
