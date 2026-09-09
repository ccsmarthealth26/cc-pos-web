import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('customers').select('*').order('full_name').then(({ data, error }) => {
      if (!error) setCustomers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Credit Limit</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.customer_id} className="border-b">
              <td className="p-2">{c.customer_id}</td>
              <td className="p-2">{c.full_name}</td>
              <td className="p-2">{c.phone_number}</td>
              <td className="p-2">{c.credit_limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;
