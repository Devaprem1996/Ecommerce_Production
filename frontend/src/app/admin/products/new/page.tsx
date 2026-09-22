"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useQueryClient } from '@tanstack/react-query';
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
  AlertCircle,
  Loader2,
  CloudUpload,
  Layers,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminCategories } from '@/hooks/useAdmin';
import { adminService } from '@/services/admin.service';

// Form validation schema for product metadata
const productFormSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  nameTamil: z.string().optional(),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  status: z.enum(['active', 'inactive'])
});

type ProductFormData = z.infer<typeof productFormSchema>;

export interface ProductVariantItem {
  id?: string;
  name: string;
  price: number;          // Exact selling price customer pays
  originalPrice: number;  // Exact MRP / strikethrough price (optional)
  stock: number;          // Exact inventory for this variant
}

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: categories = [] } = useAdminCategories();
  
  // Image states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Default initial variants: 1 clean default pack
  const [variants, setVariants] = useState<ProductVariantItem[]>([
    { name: '500g Pack', price: 100, originalPrice: 120, stock: 50 },
    { name: '1 Kg Pack', price: 190, originalPrice: 230, stock: 30 },
  ]);

  // TipTap Rich Text Editor Configuration
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Organic, hand-picked, and chemically unprocessed farm produce.</p>',
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      nameTamil: '',
      categoryId: '',
      status: 'active'
    }
  });

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await adminService.uploadImage(file, 'products');
      setImages(prev => [url, ...prev.filter(img => !img.includes('unsplash.com/photo-1615485290382'))]);
      toast.success('Image uploaded to Cloudinary!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

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

  // Variant field update handlers
  const handleVariantChange = (index: number, field: keyof ProductVariantItem, value: any) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'name' ? value : Math.max(0, Number(value) || 0),
      };
      return next;
    });
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: '',
        price: 0,
        originalPrice: 0,
        stock: 10,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.warning('A product must have at least one pack variant.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name.trim()) {
        toast.error(`Variant #${i + 1} must have a pack size or title (e.g. "250g Pack").`);
        return;
      }
      if (v.price <= 0) {
        toast.error(`Variant "${v.name}" must have a selling price greater than 0.`);
        return;
      }
    }

    setLoading(true);
    const descContent = editor ? editor.getHTML() : data.name;

    try {
      const targetCategoryId = data.categoryId || categories[0]?.id;
      if (!targetCategoryId) {
        throw new Error('Please select a valid category.');
      }

      const skuPrefix = data.name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'PROD');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);

      const payloadVariants = variants.map((v, i) => {
        const isDiscounted = v.originalPrice > 0 && v.originalPrice > v.price;
        return {
          nameEn: v.name.trim(),
          nameTa: v.name.trim(),
          sku: `${skuPrefix}-${v.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'V')}-${randomSuffix + i}`,
          price: isDiscounted ? Number(v.originalPrice) : Number(v.price),
          discountPrice: isDiscounted ? Number(v.price) : undefined,
          availableQuantity: Number(v.stock),
        };
      });

      const payload: any = {
        categoryId: targetCategoryId,
        nameEn: data.name.trim(),
        nameTa: (data.nameTamil || data.name).trim(),
        brand: 'Yathu Arokiyagam',
        descriptionEn: descContent,
        descriptionTa: descContent,
        thumbnailUrl: images[0] || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
        variants: payloadVariants,
      };

      await adminService.createProduct(payload);

      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success('Product and variants created successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Failed to create product:', err);
      toast.error(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  // Live calculation helpers for summary card
  const totalStockCount = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price || 0)) : 0;
  const maxPrice = variants.length > 0 ? Math.max(...variants.map(v => v.price || 0)) : 0;

  return (
    <div className="space-y-8 font-sans pb-10 max-w-5xl">
      
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
            Create New Product
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Publish a new product with separate pack size variants, pricing, and stock.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Details, Media & Pack Variants (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Basic Specifications */}
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
                placeholder="e.g. Organic Cold Pressed Groundnut Oil"
                className="w-full text-base md:text-xs font-semibold px-3.5 py-3 md:py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                placeholder="e.g. மரச்செக்கு கடலை எண்ணெய்"
                className="w-full text-base md:text-xs font-semibold px-3.5 py-3 md:py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* TipTap Rich Text Editor for Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Product Description (Rich Text Editor)
              </label>
              {editor && (
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-card overflow-hidden bg-transparent">
                  {/* Editor Mini Toolbar */}
                  <div className="flex items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('heading', { level: 3 }) ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('bold') ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('italic') ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('bulletList') ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
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

          {/* Section 2: PRODUCT VARIANTS & PACK SIZES */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-500" />
                  Product Variants, Pricing & Stock
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  Save exact prices and stock separately for each pack size. Customers will choose from these options.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddVariant}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-950/30 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Pack Variant
              </Button>
            </div>

            {/* Variants Table / Cards */}
            <div className="space-y-3">
              {variants.map((variant, idx) => {
                const hasDiscount = variant.originalPrice > 0 && variant.originalPrice > variant.price;
                const discountPercent = hasDiscount
                  ? Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100)
                  : 0;

                return (
                  <div 
                    key={`var-${idx}`} 
                    className="p-4 rounded-card border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/40 space-y-3 transition-colors hover:border-primary-500/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-500/10 text-primary-500 font-black text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {variant.name || `Variant #${idx + 1}`}
                        </span>
                        {hasDiscount && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                      
                      {/* Pack / Variant Title */}
                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                          Pack Size / Title *
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                          placeholder="e.g. 500g Pack"
                          className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Selling Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={variant.price || ''}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* MRP / Strikethrough Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                          MRP / Original (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={variant.originalPrice || ''}
                          onChange={(e) => handleVariantChange(idx, 'originalPrice', e.target.value)}
                          placeholder="e.g. 120 (Optional)"
                          className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                          Stock (Units) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock ?? ''}
                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                          placeholder="e.g. 50"
                          className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Media & Gallery */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary-500" /> Product Images & Media
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Cloudinary Connected
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-feature p-6 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-primary-500 bg-primary-500/5 scale-[1.01]' 
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-850/50'
              }`}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center justify-center py-3">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Optimizing & uploading directly to Cloudinary...
                  </p>
                  <span className="text-[10px] text-neutral-450 mt-0.5">Please wait a moment</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mb-3">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-neutral-850 dark:text-white">
                    Click to upload a new product image, or drag and drop
                  </p>
                  <p className="text-[10px] font-semibold text-neutral-450 mt-1">
                    PNG, JPG, or WEBP up to 5MB • Automatically scaled & optimized on Cloudinary
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnail Preview list */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Current Images ({images.length}) — First image is primary thumbnail
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {images.map((imgUrl, idx) => {
                    const isCloudinary = imgUrl.includes('cloudinary.com');
                    return (
                      <div key={imgUrl + idx} className="group relative aspect-square rounded-card overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-850 shadow-2xs">
                        <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Primary Badge */}
                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-primary-500 text-white shadow-sm">
                            PRIMARY
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const newOrder = [images[idx], ...images.filter((_, i) => i !== idx)];
                              setImages(newOrder);
                              toast.success('Set as primary thumbnail.');
                            }}
                            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-500 cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}

                        {/* Cloudinary Host Indicator */}
                        {isCloudinary && (
                          <span className="absolute bottom-1.5 left-1.5 px-1 py-0.2 rounded text-[8px] font-bold bg-sky-500/90 text-white">
                            Cloudinary
                          </span>
                        )}

                        {/* Delete Button */}
                        <button 
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Image URL Input helper */}
            <div className="pt-2 border-t border-neutral-150 dark:border-neutral-800">
              <label className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block mb-1.5">
                Or attach external image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 text-base md:text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddImage} 
                  className="text-xs font-bold border border-neutral-250 dark:border-neutral-750 px-4"
                >
                  Add URL
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Category, Status & Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-5 sticky top-24">
            
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">
              Publishing & Category
            </h3>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Category Group *
              </label>
              <select
                {...register('categoryId')}
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.categoryId.message}</span>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Catalog Status
              </label>
              <select
                {...register('status')}
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent focus:outline-none cursor-pointer text-neutral-900 dark:text-white"
              >
                <option value="active">Active (Visible in Store)</option>
                <option value="inactive">Inactive (Hidden from Customers)</option>
              </select>
            </div>

            {/* Live Catalog Summary */}
            <div className="p-3.5 rounded-card bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <Boxes className="w-4 h-4 text-primary-500" />
                <span>Catalog Overview</span>
              </div>
              
              <div className="text-[11px] space-y-1 text-neutral-500 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Pack Options:</span>
                  <strong className="text-neutral-900 dark:text-white">{variants.length} variant{variants.length > 1 ? 's' : ''}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Price Range:</span>
                  <strong className="text-neutral-900 dark:text-white">
                    {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Inventory:</span>
                  <strong className="text-neutral-900 dark:text-white">{totalStockCount} units</strong>
                </div>
              </div>
            </div>

            {/* Publish Product Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3 text-xs font-bold shadow-md cursor-pointer"
              isLoading={loading}
            >
              Publish Product
            </Button>

            <p className="text-[10px] text-center text-neutral-400">
              New product will be added directly to the live catalog.
            </p>
          </div>

        </div>

      </form>
    </div>
  );
}
