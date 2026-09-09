import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/formatCurrency';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ drug_name: '', sell_price: 0, reorder_level: 0 });

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('drug_name');
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    const { error } = await supabase.from('products').insert([form]);
    if (!error) {
      setShowAdd(false);
      setForm({ drug_name: '', sell_price: 0, reorder_level: 0 });
      fetchProducts();
    } else alert(error.message);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Product
        </button>
      </div>
      {showAdd && (
        <div className="mb-4 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">New Product</h2>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Drug Name" value={form.drug_name} onChange={(e) => setForm({...form, drug_name: e.target.value})} className="border rounded px-2 py-1" />
            <input placeholder="Sell Price" type="number" value={form.sell_price} onChange={(e) => setForm({...form, sell_price: Number(e.target.value)})} className="border rounded px-2 py-1" />
            <input placeholder="Reorder Level" type="number" value={form.reorder_level} onChange={(e) => setForm({...form, reorder_level: Number(e.target.value)})} className="border rounded px-2 py-1" />
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-1 rounded">Save</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
          </div>
        </div>
      )}
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Sell Price</th>
            <th className="p-2 text-left">Reorder Level</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.product_id} className="border-b">
              <td className="p-2">{p.product_id}</td>
              <td className="p-2">{p.drug_name}</td>
              <td className="p-2">{formatCurrency(p.sell_price)}</td>
              <td className="p-2">{p.reorder_level}</td>
              <td className="p-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
