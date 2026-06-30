"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { mockCategories } from '@/constants/mockData';
import { CategoryType } from '@/types';

interface ExtendedCategory extends CategoryType {
  parentId?: string;
  sortOrder: number;
}

const initialCategories: ExtendedCategory[] = [
  { id: 'cat-1', name: 'Fruits & Vegetables', nameTamil: 'பழங்கள் & காய்கறிகள்', slug: 'fruits-vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400', itemCount: 42, sortOrder: 1 },
  { id: 'cat-2', name: 'Dairy & Eggs', nameTamil: 'பால் & முட்டை', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400', itemCount: 18, sortOrder: 2 },
  { id: 'cat-3', name: 'Honey & Spices', nameTamil: 'தேன் & மசாலாக்கள்', slug: 'honey-spices', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400', itemCount: 24, sortOrder: 3 },
  { id: 'cat-4', name: 'Grains & Flours', nameTamil: 'தானியங்கள் & மாவுகள்', slug: 'grains-flours', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400', itemCount: 15, sortOrder: 4 },
  { id: 'cat-5', name: 'Beverages', nameTamil: 'பானங்கள்', slug: 'beverages', image: 'https://images.unsplash.com/photo-1523906630133-f6934a1ab26e?auto=format&fit=crop&q=80&w=400', itemCount: 12, sortOrder: 5 }
];

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<ExtendedCategory[]>(initialCategories);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'parent-root': true
  });
  
  // Dialog modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [nameTamil, setNameTamil] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState('');

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setNameTamil('');
    setSlug('');
    setSortOrder(categories.length + 1);
    setImageUrl('');
    setParentId('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: ExtendedCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameTamil(cat.nameTamil || '');
    setSlug(cat.slug);
    setSortOrder(cat.sortOrder);
    setImageUrl(cat.image);
    setParentId(cat.parentId || '');
    setModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.warning('Please enter a Name and Slug.');
      return;
    }

    if (editingCategory) {
      // Edit
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? {
        ...c,
        name,
        nameTamil: nameTamil !== '' ? nameTamil : undefined,
        slug,
        sortOrder,
        image: imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
        parentId: parentId !== '' ? parentId : undefined
      } : c));
      toast.success('Category details updated!');
    } else {
      // Add
      const newCat: ExtendedCategory = {
        id: 'cat-' + Math.floor(Math.random() * 1000),
        name,
        nameTamil: nameTamil !== '' ? nameTamil : undefined,
        slug,
        sortOrder,
        image: imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
        itemCount: 0,
        parentId: parentId !== '' ? parentId : undefined
      };
      setCategories([...categories, newCat]);
      toast.success('New category created successfully!');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category? All related routing links will be deleted.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title & Add Category Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Category Management
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Define product taxonomies and sort order sequences.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Category
        </Button>
      </div>

      {/* Grid: Category List (Left) and Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Categories Tree list (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-primary-500" />
              Taxonomy Structure
            </h3>
          </div>

          {/* Root node */}
          <div className="space-y-2">
            <div 
              onClick={() => toggleNode('parent-root')}
              className="flex items-center justify-between p-2.5 rounded-card bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 cursor-pointer hover:bg-neutral-100"
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-primary-500">
                {expandedNodes['parent-root'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <FolderOpen className="w-4.5 h-4.5" />
                <span>All Categories ({sortedCategories.length})</span>
              </div>
            </div>

            {expandedNodes['parent-root'] && (
              <div className="pl-6 border-l border-neutral-200 dark:border-neutral-800 space-y-2 mt-2">
                {sortedCategories.map(cat => (
                  <div 
                    key={cat.id} 
                    className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800/80 rounded-card shadow-sm hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-card object-cover border" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                          {cat.name} <span className="text-neutral-450 font-semibold text-[10px] ml-1">({cat.nameTamil})</span>
                        </h4>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Slug: {cat.slug} | Order: {cat.sortOrder}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-500 hover:text-primary-500 cursor-pointer"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-500 hover:text-red-500 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-850 pb-2 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-primary-500" />
            Category Layout Preview
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {sortedCategories.slice(0, 4).map(cat => (
              <div key={cat.id} className="relative rounded-card overflow-hidden h-24 bg-neutral-100 group border">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/45 flex flex-col justify-end p-2.5">
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">{cat.name}</span>
                  <span className="text-[8px] font-semibold text-neutral-200 mt-0.5">{cat.itemCount} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ADD / EDIT CATEGORY DIALOG MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 space-y-4 z-10">
            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-500 hover:text-primary-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Category Tamil Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Category Name (Tamil)
                </label>
                <input
                  type="text"
                  value={nameTamil}
                  onChange={(e) => setNameTamil(e.target.value)}
                  placeholder="பழங்கள் & காய்கறிகள்"
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Category Slug */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Slug URL *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Sort Sequence Index
                </label>
                <input
                  type="number"
                  min={1}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Category Cover Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full font-bold text-xs"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
