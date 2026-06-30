"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { mockProducts } from '@/constants/mockData';
import { ProductType } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductType[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  const handleSort = (key: 'name' | 'price' | 'stock') => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.nameTamil && p.nameTamil.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedCategory, sortKey, sortDirection]);

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success(`"${name}" deleted successfully.`);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Create, edit, and keep track of organic inventory lists.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button
            variant="primary"
            size="sm"
            className="text-xs font-bold"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Product
          </Button>
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, Tamil name, or Product ID..."
            className="w-full text-xs font-semibold pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 bg-transparent rounded-card text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Filters and category controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-bold pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border rounded-card text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Product Info</th>
                <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort('name')}>
                  Name <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-4">Category</th>
                <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort('price')}>
                  Price <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort('stock')}>
                  Stock <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    {/* Image & ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'} 
                          alt={prod.name} 
                          className="w-10 h-10 rounded-card object-cover border"
                        />
                        <span className="text-[10px] font-bold text-neutral-450 font-sans block">{prod.id}</span>
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td className="p-4">
                      <p className="font-bold text-neutral-850 dark:text-white leading-tight">{prod.name}</p>
                      {prod.nameTamil && (
                        <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">{prod.nameTamil}</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-500/10 text-primary-500 uppercase">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <p className="font-extrabold text-neutral-900 dark:text-white">₹{prod.price}</p>
                      <span className="text-[9px] text-neutral-400 font-bold block">per {prod.unit}</span>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold text-xs ${
                          prod.stock <= 10 ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {prod.stock}
                        </span>
                        {prod.stock <= 10 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        prod.stock > 0 ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {prod.stock > 0 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {prod.stock > 0 ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/products/edit/${prod.id}`}>
                          <button 
                            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-bold text-neutral-500">
                    No matching products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
