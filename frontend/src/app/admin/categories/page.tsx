"use client";

import React, { useState, useMemo, useRef } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  FolderOpen,
  RefreshCw,
  Loader2,
  Package,
  Upload,
  CloudUpload
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminCategories } from '@/hooks/useAdmin';
import { adminService } from '@/services/admin.service';

interface CategoryItem {
  id: string;
  name: string;
  nameTamil?: string;
  slug: string;
  image: string;
  itemCount: number;
  sortOrder: number;
}

export default function CategoryManagementPage() {
  const { data: rawCategories = [], isLoading, isFetching, refetch } = useAdminCategories();

  // Dialog modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [nameTamil, setNameTamil] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }
    try {
      setIsUploadingImage(true);
      const url = await adminService.uploadImage(file, 'categories');
      setImageUrl(url);
      toast.success('Category banner uploaded to Cloudinary!');
    } catch (err: any) {
      console.error('Failed to upload category image:', err);
      toast.error(err.message || 'Failed to upload category image.');
    } finally {
      setIsUploadingImage(false);
      if (categoryFileInputRef.current) categoryFileInputRef.current.value = '';
    }
  };

  // Map Neon DB categories
  const categories: CategoryItem[] = useMemo(() => {
    return rawCategories.map((c: any) => ({
      id: c.id,
      name: c.nameEn,
      nameTamil: c.nameTa,
      slug: c.slug,
      image: c.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
      itemCount: c._count?.products ?? 0,
      sortOrder: c.sortOrder ?? 0,
    }));
  }, [rawCategories]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setNameTamil('');
    setSlug('');
    setSortOrder(categories.length + 1);
    setImageUrl('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameTamil(cat.nameTamil || '');
    setSlug(cat.slug);
    setSortOrder(cat.sortOrder);
    setImageUrl(cat.image);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.warning('Please enter a Name and Slug.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // Edit existing category in Neon DB
        await adminService.updateCategory(editingCategory.id, {
          nameEn: name.trim(),
          nameTa: (nameTamil || name).trim(),
          imageUrl: imageUrl.trim() || undefined,
          sortOrder: Number(sortOrder),
        });
        toast.success(`Category "${name}" updated in database.`);
      } else {
        // Create new category in Neon DB
        await adminService.createCategory({
          nameEn: name.trim(),
          nameTa: (nameTamil || name).trim(),
          imageUrl: imageUrl.trim() || undefined,
          sortOrder: Number(sortOrder),
        });
        toast.success(`Category "${name}" created in database.`);
      }

      await refetch();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}" from Neon DB? Only empty categories can be deleted.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await adminService.deleteCategory(id);
      toast.success(`Category "${name}" deleted.`);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Category Hierarchy
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              Live Neon DB ({categories.length} categories)
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Organize crops, natural extracts, and dairy lines into clean classifications.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs font-bold border border-neutral-200 dark:border-neutral-750"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="text-xs font-bold w-full sm:w-auto justify-center"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Category
          </Button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm">
        
        {/* Tree Header Info */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary-500" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Organic Store Catalog Structure
            </span>
          </div>
          <span className="text-xs font-bold text-neutral-450">
            Total active categories: {categories.length}
          </span>
        </div>

        {/* Tree Display List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-neutral-100 dark:bg-neutral-800/50 rounded-card animate-pulse" />
            ))
          ) : sortedCategories.length > 0 ? (
            sortedCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-card border border-neutral-150 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-10 h-10 rounded-card object-cover border border-neutral-200 dark:border-neutral-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {cat.name}
                      </span>
                      {cat.nameTamil && (
                        <span className="text-xs text-neutral-500 font-medium">
                          ({cat.nameTamil})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-450 font-semibold mt-0.5">
                      <span>Slug: /{cat.slug}</span>
                      <span>•</span>
                      <span>Order: {cat.sortOrder}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    <Package className="w-3 h-3 text-primary-500" />
                    {cat.itemCount} products
                  </span>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      disabled={deletingId === cat.id}
                      className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer disabled:opacity-50"
                      title="Delete Category"
                    >
                      {deletingId === cat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center font-bold text-neutral-500">
              No categories found in Neon database.
            </div>
          )}
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Category Name (English) *
                </label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Traditional Oils"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Category Name (Tamil)
                </label>
                <input 
                  type="text"
                  value={nameTamil}
                  onChange={(e) => setNameTamil(e.target.value)}
                  placeholder="பாரம்பரிய எண்ணெய்கள்"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  URL Slug *
                </label>
                <input 
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="traditional-oils"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Category Banner / Image
                  </label>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                    Cloudinary Ready
                  </span>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={categoryFileInputRef}
                  onChange={handleCategoryFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                <div className="flex gap-2">
                  <input 
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload below"
                    className="flex-1 text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => categoryFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="text-xs font-bold border border-neutral-250 dark:border-neutral-750 px-3"
                    leftIcon={
                      isUploadingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {isUploadingImage ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>

                {imageUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-10 h-10 rounded-card overflow-hidden border bg-neutral-100 dark:bg-neutral-800 shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-neutral-450 truncate flex-1 font-mono">
                      {imageUrl}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Display Sort Order
                </label>
                <input 
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="primary" 
                  size="sm" 
                  isLoading={submitting}
                  className="text-xs font-bold"
                >
                  {editingCategory ? 'Update in Neon DB' : 'Save to Neon DB'}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
