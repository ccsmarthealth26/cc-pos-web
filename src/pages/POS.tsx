import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

interface CartItem {
  product_id: string;
  drug_name: string;
  quantity: number;
  price: number;
  line_total: number;
}

const POS: React.FC = () => {
  const { profile } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [net, setNet] = useState(0);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('customers').select('customer_id, full_name').then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

  useEffect(() => {
    const s = cart.reduce((acc, item) => acc + item.line_total, 0);
    setSubtotal(s);
    setNet(s - discount > 0 ? s - discount : 0);
  }, [cart, discount]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('drug_name', `%${searchQuery}%`)
        .eq('status', 'Active')
        .limit(10);
      if (!error) setSearchResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToCart = (product: any, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + qty, line_total: (item.quantity + qty) * item.price }
            : item
        );
      } else {
        return [...prev, {
          product_id: product.product_id,
          drug_name: product.drug_name,
          quantity: qty,
          price: product.sell_price,
          line_total: qty * product.sell_price,
        }];
      }
    });
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const voidCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const completeSale = async () => {
    if (cart.length === 0 || net <= 0) return;

    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_sale: item.price,
    }));

    const payments = [
      {
        method: 'Cash',
        amount: net,
        reference: '',
      },
    ];

    const { data, error } = await supabase.rpc('complete_sale', {
      p_cashier_id: profile.user_id,
      p_customer_id: customerId,
      p_items: items,
      p_payments: payments,
      p_discount: discount,
    });

    if (error) {
      alert('Sale failed: ' + error.message);
      return;
    }

    alert('Sale completed! Receipt: ' + data);
    voidCart();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Point of Sale</h2>
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product..."
            className="flex-1 border rounded px-3 py-2"
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="w-20 border rounded px-2 py-2"
          />
          <button
            onClick={() => {
              if (selectedProduct) addToCart(selectedProduct, quantity);
              else if (searchResults.length > 0) addToCart(searchResults[0], quantity);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mb-4 border rounded shadow max-h-60 overflow-y-auto">
            {searchResults.map(p => (
              <div
                key={p.product_id}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                onClick={() => { setSelectedProduct(p); setSearchQuery(p.drug_name); setSearchResults([]); }}
              >
                {p.drug_name} - {formatCurrency(p.sell_price)}
              </div>
            ))}
          </div>
        )}
        <table className="w-full mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{item.drug_name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{formatCurrency(item.price)}</td>
                <td className="p-2">{formatCurrency(item.line_total)}</td>
                <td className="p-2">
                  <button onClick={() => removeItem(idx)} className="text-red-600 hover:underline">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount:</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-24 border rounded px-2"
            />
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Net Total:</span>
            <span>{formatCurrency(net)}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={voidCart} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Void Cart
            </button>
            <button
              onClick={completeSale}
              disabled={cart.length === 0 || net <= 0}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
      <div className="w-full md:w-64 bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Customer</h3>
        <select
          className="w-full border rounded px-2 py-1"
          onChange={(e) => setCustomerId(e.target.value || null)}
          value={customerId || ''}
        >
          <option value="">Walk-in Customer</option>
          {customers.map(c => (
            <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default POS;
