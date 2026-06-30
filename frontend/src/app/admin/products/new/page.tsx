"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Bold, 
  Italic, 
  List, 
  Heading1, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

// Form validation schema using Zod
const productFormSchema = z.object({
  name: z.string().min(3, { message: 'English name must be at least 3 characters' }),
  nameTamil: z.string().optional(),
  category: z.string().min(1, { message: 'Category is required' }),
  price: z.number().min(1, { message: 'Price must be greater than 0' }),
  originalPrice: z.number().optional(),
  unit: z.string().min(1, { message: 'UoM (e.g. 500g, 1L) is required' }),
  stock: z.number().min(0, { message: 'Stock cannot be negative' }),
  tags: z.string().optional(),
  status: z.enum(['active', 'inactive'])
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Image states
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Weight variants state
  const [variants, setVariants] = useState<{ weight: string; price: number }[]>([
    { weight: '250g', price: 90 },
    { weight: '500g', price: 170 }
  ]);
  const [newVarWeight, setNewVarWeight] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(0);

  // TipTap Rich Text Editor Configuration
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Organic, hand-picked, and chemically unprocessed farm produce.</p>',
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      nameTamil: '',
      category: 'Fruits & Vegetables',
      price: 0,
      originalPrice: 0,
      unit: '500g',
      stock: 50,
      tags: 'organic, fresh',
      status: 'active'
    }
  });

  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
      toast.success('Image link attached.');
    } else {
      toast.warning('Please enter a valid HTTP image link.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!newVarWeight || newVarPrice <= 0) {
      toast.warning('Provide variant weight and price.');
      return;
    }
    setVariants([...variants, { weight: newVarWeight, price: newVarPrice }]);
    setNewVarWeight('');
    setNewVarPrice(0);
    toast.success('Weight variant registered.');
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProductFormData) => {
    setLoading(true);
    const descContent = editor ? editor.getHTML() : '';

    setTimeout(() => {
      setLoading(false);
      const completeProductPayload = {
        ...data,
        description: descContent,
        images,
        variants
      };

      console.log('Submitted Product: ', completeProductPayload);
      toast.success('Organic product registered in Catalog successfully!');
      router.push('/admin/products');
    }, 1200);
  };

  return (
    <div className="space-y-8 font-sans pb-10 max-w-4xl">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.push('/admin/products')}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Add Product
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Publish a new crop, honey batch, or fresh dairy variant.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Basic Details & Text Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">
              Primary Specifications
            </h3>

            {/* Name (English) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Product Name (English) *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Organic Red Tomatoes"
              />
              {errors.name && (
                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name.message}
                </span>
              )}
            </div>

            {/* Name (Tamil) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Product Name (Tamil translation)
              </label>
              <input
                type="text"
                {...register('nameTamil')}
                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="இயற்கை தக்காளி"
              />
            </div>

            {/* TipTap Rich Text Editor for Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Product Description (Rich Text Editor)
              </label>
              
              {editor && (
                <div className="border border-neutral-200 dark:border-neutral-750 rounded-card overflow-hidden">
                  {/* Rich Text Toolbar */}
                  <div className="flex gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-750 flex-wrap">
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('bold') ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('italic') ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('heading', { level: 1 }) ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                      title="Heading"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('bulletList') ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Content editable pane */}
                  <EditorContent editor={editor} className="p-3.5 min-h-[160px] text-xs font-semibold focus:outline-none dark:text-white" />
                </div>
              )}
            </div>

          </div>

          {/* Multiple Image upload UI */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primary-500" /> Image Attachments
            </h3>

            {/* Thumbnail Preview list */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <div key={imgUrl + idx} className="relative aspect-square rounded-card overflow-hidden border bg-neutral-100">
                  <img src={imgUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="aspect-square border border-dashed rounded-card flex flex-col items-center justify-center text-neutral-450 p-2.5 text-center bg-neutral-50/50">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-wider leading-none">Drag & Drop Files</span>
              </div>
            </div>

            {/* New Image URL Input helper */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://unsplash.com/photo-..."
                className="flex-1 text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
              />
              <Button type="button" variant="ghost" size="sm" onClick={handleAddImage} className="text-xs font-bold border border-neutral-250 dark:border-neutral-750">
                Add URL
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Inventory, Tags (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">
              Inventory & Cost
            </h3>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Category Group *
              </label>
              <select
                {...register('category')}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Honey & Spices">Honey & Spices</option>
                <option value="Grains & Flours">Grains & Flours</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Price (INR) *
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
              />
              {errors.price && (
                <span className="text-[9px] font-bold text-red-500 mt-1 block">{errors.price.message}</span>
              )}
            </div>

            {/* Original Price */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Original Price (for discount)
              </label>
              <input
                type="number"
                {...register('originalPrice', { valueAsNumber: true })}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
              />
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Unit of Measure (UoM) *
              </label>
              <input
                type="text"
                {...register('unit')}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                placeholder="500g or 1L"
              />
              {errors.unit && (
                <span className="text-[9px] font-bold text-red-500 mt-1 block">{errors.unit.message}</span>
              )}
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Stock Quantity *
              </label>
              <input
                type="number"
                {...register('stock', { valueAsNumber: true })}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
              />
              {errors.stock && (
                <span className="text-[9px] font-bold text-red-500 mt-1 block">{errors.stock.message}</span>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* Weight variants */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">
              Weight Variants
            </h3>

            {/* Add weight variant controls */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newVarWeight}
                onChange={(e) => setNewVarWeight(e.target.value)}
                placeholder="1kg"
                className="w-20 text-xs font-semibold px-2 py-1.5 border rounded-card bg-transparent focus:outline-none"
              />
              <input
                type="number"
                value={newVarPrice}
                onChange={(e) => setNewVarPrice(parseFloat(e.target.value) || 0)}
                placeholder="Price"
                className="flex-1 text-xs font-semibold px-2 py-1.5 border rounded-card bg-transparent focus:outline-none"
              />
              <button 
                type="button"
                onClick={handleAddVariant}
                className="p-2 rounded bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Active list */}
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={v.weight + i} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-2 rounded-card text-xs font-bold border">
                  <span>{v.weight} — ₹{v.price}</span>
                  <button 
                    type="button"
                    onClick={() => handleRemoveVariant(i)}
                    className="text-neutral-450 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3 text-xs font-bold"
            isLoading={loading}
          >
            Save Product Card
          </Button>

        </div>

      </form>

    </div>
  );
}
