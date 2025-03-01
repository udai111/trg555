import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, InputAdornment,
  IconButton, Button, Chip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { fetchTransactions } from '../../services/transactionService';
import TransactionModal from './TransactionModal';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  account: string;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTransactions();
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(transaction => transaction.category === categoryFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(transaction => transaction.type === typeFilter);
    }

    setFilteredTransactions(result);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, transactions, categoryFilter, typeFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  if (isLoading) return <Box sx={{ textAlign: 'center', mt: 4 }}>Loading transactions...</Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>{error}</Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Transactions</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search transactions"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="type-filter-label">Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Account</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.category} 
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          fontWeight: 'medium',
                          color: transaction.type === 'income' ? 'success.main' : 'error.main' 
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, 'USD')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <TransactionModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </Box>
  );
};

export default TransactionList;
