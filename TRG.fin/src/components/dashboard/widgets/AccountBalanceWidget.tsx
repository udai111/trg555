import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface AccountBalanceWidgetProps {
  accounts: Account[];
}

const AccountBalanceWidget: React.FC<AccountBalanceWidgetProps> = ({ accounts }) => {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Account Balances
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Total Balance
        </Typography>
        <Typography variant="h4">
          {formatCurrency(totalBalance, 'USD')}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <List disablePadding>
        {accounts.map((account) => (
          <ListItem key={account.id} disablePadding sx={{ py: 0.5 }}>
            <ListItemText 
              primary={account.name}
              secondary={account.type}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            <Typography variant="body2">
              {formatCurrency(account.balance, account.currency)}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AccountBalanceWidget;
