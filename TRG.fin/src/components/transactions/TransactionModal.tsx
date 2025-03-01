import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, IconButton, InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  account: string;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  transaction?: Transaction;
  isEditing?: boolean;
}

const categories = {
  income: ['Salary', 'Investment', 'Gift', 'Other Income'],
  expense: ['Food', 'Transportation', 'Entertainment', 'Housing', 'Utilities', 'Healthcare', 'Education', 'Shopping', 'Other']
};

const accounts = ['Cash', 'Checking Account', 'Savings Account', 'Credit Card'];

const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  onClose,
  onAddTransaction,
  transaction,
  isEditing = false
}) => {
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [account, setAccount] = useState(transaction?.account || accounts[0]);
  const [date, setDate] = useState<Date | null>(transaction?.date ? new Date(transaction.date) : new Date());
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!description) newErrors.description = 'Description is required';
    if (!amount) newErrors.amount = 'Amount is required';
    if (amount && isNaN(Number(amount))) newErrors.amount = 'Amount must be a number';
    if (!category) newErrors.category = 'Category is required';
    if (!date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const newTransaction: Transaction = {
      id: transaction?.id || Date.now().toString(),
      description,
      amount: Number(amount),
      category,
      type,
      account,
      date: date!.toISOString()
    };
    
    onAddTransaction(newTransaction);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setType('expense');
    setAccount(accounts[0]);
    setDate(new Date());
    setErrors({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <form>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  error: !!errors.date,
                  helperText: errors.date
                }
              }}
            />
            
            <TextField
              label="Description"
              fullWidth
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />
            
            <TextField
              label="Amount"
              fullWidth
              margin="normal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as 'income' | 'expense');
                  setCategory(''); // Reset category when type changes
                }}
                label="Type"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.category}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {categories[type].map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Account</InputLabel>
              <Select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                label="Account"
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc} value={acc}>
                    {acc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditing ? 'Update' : 'Add'} Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;
