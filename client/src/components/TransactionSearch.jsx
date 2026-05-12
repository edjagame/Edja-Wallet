import React, { useState, useEffect } from 'react';

function TransactionSearch({ onSearch, categories }) {
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [categoryId, setCategoryId] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const handleSetCurrentMonth = () => {
    setMonth(new Date().toISOString().substring(0, 7));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ search, month, categoryId, minAmount, maxAmount });
  };

  // Re-fetch transactions automatically when the month filter changes via the snap button, 
  // or generally we can just rely on the effect. Let's just use effect for the month specifically if desired,
  // but it's simpler to trigger on form submit. We can trigger onSearch on `month` change.
  useEffect(() => {
    onSearch({ search, month, categoryId, minAmount, maxAmount });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]); // Trigger mainly when month changes directly

  return (
    <form onSubmit={handleSearch} className="mb-20 card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h3 className="mt-0 mb-10">Search & Filter</h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '150px' }}
        />
        
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="Min Amount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          min="0"
          step="0.01"
          style={{ width: '120px' }}
        />
        
        <input
          type="number"
          placeholder="Max Amount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          min="0"
          step="0.01"
          style={{ width: '120px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          title="Leave blank to view all transactions"
        />
        <button type="button" onClick={handleSetCurrentMonth} className="btn-primary">Current Month</button>
        <div style={{ flex: 1 }} />
        <button type="submit" className="btn-primary">Apply Filters</button>
      </div>
    </form>
  );
}

export default TransactionSearch;