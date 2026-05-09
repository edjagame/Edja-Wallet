import React /* TODO: Import { useState, useEffect } */ from 'react';
import TransactionForm from '../components/TransactionForm';
// TODO 1: Import your new TransactionList component
// import TransactionList from '../components/TransactionList';
// TODO 2: Import axios if you created an api helper
// import axios from '../api/axios';

function Transactions() {
  // TODO 3: Create state for transactions array and search query
  // const [transactions, setTransactions] = useState([]);
  // const [searchQuery, setSearchQuery] = useState('');

  // TODO 4: Create a function to fetch transactions from the backend
  // const fetchTransactions = async () => {
  //   try {
  //     const res = await axios.get('/transactions');
  //     setTransactions(res.data);
  //   } catch (err) { console.error(err); }
  // };

  // TODO 5: Use useEffect to call fetchTransactions on component mount
  // useEffect(() => { fetchTransactions(); }, []);

  return (
    <div>
      <h1>Transactions</h1>
      
      {/* TODO 6: Add a search input field here that updates searchQuery state */}
      
      <TransactionForm />
      
      <hr style={{ margin: '2rem 0' }}/>
      
      {/* TODO 7: Render your TransactionList component and pass the transactions state as a prop */}
      {/* <TransactionList transactions={transactions} /> */}
    </div>
  );
}

export default Transactions;
