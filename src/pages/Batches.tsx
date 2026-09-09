import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Batches: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('batches')
      .select('*, products(drug_name)')
      .order('expiry_date')
      .then(({ data, error }) => {
        if (!error) setBatches(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Batches</h1>
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Batch ID</th>
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Batch No.</th>
            <th className="p-2 text-left">Expiry</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(b => (
            <tr key={b.batch_id} className="border-b">
              <td className="p-2">{b.batch_id}</td>
              <td className="p-2">{b.products?.drug_name || 'N/A'}</td>
              <td className="p-2">{b.batch_number}</td>
              <td className="p-2">{new Date(b.expiry_date).toLocaleDateString()}</td>
              <td className="p-2">{b.current_stock}</td>
              <td className="p-2">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Batches;
