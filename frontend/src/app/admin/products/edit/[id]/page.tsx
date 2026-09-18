"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
  AlertCircle,
  Loader2,
  CloudUpload,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminCategories } from '@/hooks/useAdmin';
import { adminService } from '@/services/admin.service';
import { resolveProductImage } from '@/utils/apiMapper';

// Form validation schema using Zod
const productFormSchema = z.object({
  name: z.string().min(3, { message: 'English name must be at least 3 characters' }),
  nameTamil: z.string().optional(),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  price: z.number().min(1, { message: 'Price must be greater than 0' }),
  originalPrice: z.number().optional(),
  unit: z.string().min(1, { message: 'UoM (e.g. 500g, 1L) is required' }),
  stock: z.number().min(0, { message: 'Stock cannot be negative' }),
  tags: z.string().optional(),
  status: z.enum(['active', 'inactive'])
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const { data: categories = [] } = useAdminCategories();

  useEffect(() => {
    params.then((resolved) => {
      setProductId(resolved.id);
    });
  }, [params]);

  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  
  // Image states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

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
      setImages(prev => [url, ...prev]);
      toast.success('Image uploaded to Cloudinary! Click Save Changes to commit to database.');
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

  // Weight variants state
  const [variants, setVariants] = useState<{ weight: string; price: number }[]>([]);
  const [newVarWeight, setNewVarWeight] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(0);

  // TipTap Rich Text Editor Configuration
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      nameTamil: '',
      categoryId: '',
      price: 0,
      originalPrice: 0,
      unit: '',
      stock: 0,
      tags: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    setFetching(true);

    adminService.getProduct(productId)
      .then((prod) => {
        if (!isMounted || !prod) return;
        setProductData(prod);

        const primaryVariant = prod.variants?.[0];
        const rawThumb = prod.thumbnailUrl;
        const isDeadSeedUrl = rawThumb && rawThumb.includes('yathu-iyarkaiyagam');
        const resolvedImage = isDeadSeedUrl ? resolveProductImage(prod.slug, prod.category?.slug) : rawThumb;
        const initialImages = resolvedImage ? [resolvedImage] : (prod.images?.length ? prod.images : ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400']);
        setImages(initialImages);

        const totalStock = prod.variants?.reduce(
          (sum: number, v: any) => sum + (v.inventory?.availableQuantity ?? 0),
          0
        ) ?? 50;

        if (prod.variants?.length > 1) {
          setVariants(prod.variants.map((v: any) => ({
            weight: v.nameEn,
            price: Number(v.discountPrice || v.price),
          })));
        }

        reset({
          name: prod.nameEn,
          nameTamil: prod.nameTa || '',
          categoryId: prod.categoryId || prod.category?.id || '',
          price: Number(primaryVariant?.discountPrice || primaryVariant?.price || 0),
          originalPrice: Number(primaryVariant?.price || 0),
          unit: primaryVariant?.nameEn || '500g',
          stock: totalStock,
          tags: 'organic, fresh',
          status: prod.isActive ? 'active' : 'inactive',
        });

        if (editor && prod.descriptionEn) {
          editor.commands.setContent(prod.descriptionEn);
        }
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        toast.error("Failed to load product from live database.");
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, reset, editor]);

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

  const onSubmit = async (data: ProductFormData) => {
    if (!productId) return;
    setLoading(true);
    const descContent = editor ? editor.getHTML() : data.name;

    try {
      const payload: any = {
        nameEn: data.name.trim(),
        nameTa: (data.nameTamil || data.name).trim(),
        descriptionEn: descContent,
        descriptionTa: descContent,
        thumbnailUrl: images[0] || undefined,
        isActive: data.status === 'active',
      };

      if (data.categoryId) {
        payload.categoryId = data.categoryId;
      }

      await adminService.updateProduct(productId, payload);
      toast.success('Product updated in live Neon database!');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

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
            Edit Product: {productData?.nameEn || 'Loading...'}
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Modify product details, category, and images in Neon PostgreSQL.
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
                className="w-full text-base md:text-xs font-semibold px-3.5 py-3 md:py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 ${editor.isActive('heading', { level: 1 }) ? 'text-primary-500 bg-neutral-200' : 'text-neutral-500'}`}
                    >
                      <Heading1 className="w-3.5 h-3.5" />
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

          {/* Multiple Image upload UI with Cloudinary */}
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
                {...register('categoryId')}
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
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

            {/* Price */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Price (INR) *
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border rounded-card bg-transparent focus:outline-none"
              />
              {errors.price && (
                <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.price.message}</span>
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
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border rounded-card bg-transparent focus:outline-none"
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
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border rounded-card bg-transparent focus:outline-none"
              />
              {errors.unit && (
                <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.unit.message}</span>
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
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border rounded-card bg-transparent focus:outline-none"
              />
              {errors.stock && (
                <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.stock.message}</span>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full text-base md:text-xs font-semibold px-3 py-2.5 md:py-2 border rounded-card bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3 text-xs font-bold"
            isLoading={loading}
          >
            Commit Changes to DB
          </Button>

        </div>

      </form>

    </div>
  );
}
