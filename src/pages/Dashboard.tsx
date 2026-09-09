import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/formatCurrency';

const Dashboard: React.FC = () => {
  const [todaySales, setTodaySales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchKPIs = async () => {
      const today = new Date().toISOString().split('T')[0];
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const { data: todayData } = await supabase
        .from('sales')
        .select('net_amount')
        .gte('sale_date', today)
        .eq('status', 'Completed');
      const todaySum = todayData?.reduce((acc, r) => acc + r.net_amount, 0) || 0;
      setTodaySales(todaySum);

      const { data: monthData } = await supabase
        .from('sales')
        .select('net_amount')
        .gte('sale_date', firstDay)
        .eq('status', 'Completed');
      const monthSum = monthData?.reduce((acc, r) => acc + r.net_amount, 0) || 0;
      setMonthSales(monthSum);

      const { data: batches } = await supabase
        .from('batches')
        .select('current_stock, buy_price')
        .eq('status', 'Available');
      const value = batches?.reduce((acc, b) => acc + (b.current_stock * b.buy_price), 0) || 0;
      setStockValue(value);

      const { count: expired } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })
        .lt('expiry_date', new Date().toISOString().split('T')[0])
        .eq('status', 'Available');
      setExpiredCount(expired || 0);

      // Low stock: count products where total available stock < reorder_level
      const { data: products } = await supabase.from('products').select('product_id, reorder_level');
      let low = 0;
      for (const p of products || []) {
        const { data: stockData } = await supabase
          .from('batches')
          .select('current_stock')
          .eq('product_id', p.product_id)
          .eq('status', 'Available');
        const total = stockData?.reduce((acc, b) => acc + b.current_stock, 0) || 0;
        if (total < p.reorder_level) low++;
      }
      setLowStockCount(low);
    };

    fetchKPIs();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Today's Sales</h3>
          <p className="text-2xl font-bold">{formatCurrency(todaySales)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Monthly Sales</h3>
          <p className="text-2xl font-bold">{formatCurrency(monthSales)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Stock Value</h3>
          <p className="text-2xl font-bold">{formatCurrency(stockValue)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Expired Medicines</h3>
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Low Stock Items</h3>
          <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
