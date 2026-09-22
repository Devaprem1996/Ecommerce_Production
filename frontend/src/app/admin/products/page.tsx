"use client";

import React, { useState, useMemo, useRef } from 'react';
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
  AlertTriangle,
  RefreshCw,
  Loader2,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  ChevronDown,
  ChevronUp,
  Camera,
  CloudUpload,
  Upload,
  Image as ImageIcon,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminProducts, useAdminCategories } from '@/hooks/useAdmin';
import { adminService } from '@/services/admin.service';
import { resolveProductImage } from '@/utils/apiMapper';

interface CatalogProduct {
  id: string;
  name: string;
  nameTamil?: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  stock: number;
  unit: string;
  images: string[];
  isActive: boolean;
}

export default function AdminProductsPage() {
  const { data: productsData, isLoading, isFetching, refetch } = useAdminProducts({ limit: 100 });
  const { data: categoriesData } = useAdminCategories();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // View Mode: 'table' vs 'category'
  const [viewMode, setViewMode] = useState<'table' | 'category'>('table');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Quick Change Product Image Modal States
  const [imageModalProduct, setImageModalProduct] = useState<CatalogProduct | null>(null);
  const [modalImageFile, setModalImageFile] = useState<File | null>(null);
  const [modalImagePreview, setModalImagePreview] = useState<string>('');
  const [modalImageUrlInput, setModalImageUrlInput] = useState<string>('');
  const [isUploadingModalImage, setIsUploadingModalImage] = useState(false);
  const [modalDragOver, setModalDragOver] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenImageModal = (product: CatalogProduct) => {
    setImageModalProduct(product);
    setModalImageFile(null);
    setModalImagePreview(product.images[0] || resolveProductImage(product.slug, product.categorySlug));
    setModalImageUrlInput('');
  };

  const handleCloseImageModal = () => {
    setImageModalProduct(null);
    setModalImageFile(null);
    setModalImagePreview('');
    setModalImageUrlInput('');
    setIsUploadingModalImage(false);
    setModalDragOver(false);
  };

  const handleModalFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }
    setModalImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setModalImagePreview(objectUrl);
  };

  const handleSaveModalImage = async () => {
    if (!imageModalProduct) return;
    try {
      setIsUploadingModalImage(true);
      let targetUrl = modalImagePreview;

      // If user uploaded a new local file, stream directly to Cloudinary
      if (modalImageFile) {
        targetUrl = await adminService.uploadImage(modalImageFile, 'products');
      } else if (modalImageUrlInput && modalImageUrlInput.startsWith('http')) {
        targetUrl = modalImageUrlInput.trim();
      }

      // Update product in catalog
      await adminService.updateProduct(imageModalProduct.id, { thumbnailUrl: targetUrl });
      toast.success(`Photo for "${imageModalProduct.name}" updated successfully!`);
      await refetch();
      handleCloseImageModal();
    } catch (err: any) {
      console.error('Failed to update product photo:', err);
      toast.error(err.message || 'Failed to update product photo.');
    } finally {
      setIsUploadingModalImage(false);
    }
  };

  // Map Neon DB products to display model with high-res curated real images
  const products: CatalogProduct[] = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.map((p: any) => {
      const primaryVariant = p.variants?.[0];
      const totalStock = p.variants?.reduce(
        (sum: number, v: any) => sum + (v.inventory?.availableQuantity ?? 0),
        0
      ) ?? 0;

      const catSlug = p.category?.slug || '';
      // Real Cloudinary uploads under active cloud are preserved
      const isPlaceholder = !p.thumbnailUrl || p.thumbnailUrl.includes('yathu-iyarkaiyagam') || p.thumbnailUrl.includes('placeholder');
      const resolvedImage = isPlaceholder
        ? resolveProductImage(p.slug, catSlug)
        : p.thumbnailUrl;

      return {
        id: p.id,
        name: p.nameEn,
        nameTamil: p.nameTa,
        slug: p.slug,
        category: p.category?.nameEn || 'General',
        categorySlug: catSlug,
        price: primaryVariant?.discountPrice ? Number(primaryVariant.discountPrice) : Number(primaryVariant?.price || 0),
        stock: totalStock,
        unit: primaryVariant?.nameEn || 'Unit',
        images: [resolvedImage],
        isActive: p.isActive,
      };
    });
  }, [productsData]);

  // Extract unique category names with counts for filter tabs
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const categoriesList = (categoriesData as any[] || []).map((c: any) => ({
      name: c.nameEn,
      nameTa: c.nameTa,
      slug: c.slug,
      count: counts[c.nameEn] || 0,
    }));

    return [
      { name: 'All', nameTa: 'அனைத்தும்', slug: 'all', count: products.length },
      ...categoriesList,
    ];
  }, [products, categoriesData]);

  const handleSort = (key: 'name' | 'price' | 'stock') => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter and sort all products
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(s) || 
        (p.nameTamil && p.nameTamil.toLowerCase().includes(s)) ||
        p.id.toLowerCase().includes(s);
      const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
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

  // Group products by category for Category-Wise View
  const groupedByCategory = useMemo(() => {
    const map: Record<string, { categoryName: string; categoryNameTamil?: string; products: CatalogProduct[] }> = {};
    
    // Initialize with real categories in order
    (categoriesData as any[] || []).forEach((cat: any) => {
      map[cat.nameEn] = {
        categoryName: cat.nameEn,
        categoryNameTamil: cat.nameTa,
        products: [],
      };
    });

    // Populate filtered products
    filteredAndSortedProducts.forEach((p) => {
      if (!map[p.category]) {
        map[p.category] = { categoryName: p.category, products: [] };
      }
      map[p.category].products.push(p);
    });

    // Return only categories that have matching products
    return Object.values(map).filter(g => g.products.length > 0);
  }, [filteredAndSortedProducts, categoriesData]);

  // Pagination calculation
  const totalItems = filteredAndSortedProducts.length;
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / (effectivePageSize || 1)));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    if (pageSize === 0) return filteredAndSortedProducts;
    const start = (safePage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, safePage, pageSize]);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setIsDeleting(id);
      await adminService.deleteProduct(id);
      toast.success(`"${name}" deleted successfully.`);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Product Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              Active ({products.length} items)
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Manage your store's products, inventory, pricing, and media.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle: Table vs Category-wise */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-card border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-card text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Table View with Pagination"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-card text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'category'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Category-wise Grouped View"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>By Category</span>
            </button>
          </div>

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

          <Link href="/admin/products/new" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold w-full sm:w-auto justify-center"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Category Pills / Quick Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryStats.map((cat) => (
          <button
            key={cat.name}
            onClick={() => {
              setSelectedCategory(cat.name);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
              selectedCategory === cat.name
                ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-primary-500/50 hover:text-primary-500'
            }`}
          >
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === cat.name
                ? 'bg-white/20 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by product name, Tamil name, or Product ID..."
            className="w-full text-base md:text-xs font-semibold pl-10 pr-4 py-2.5 md:py-2 border border-neutral-200 dark:border-neutral-700 bg-transparent rounded-card text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Page Size & Results summary */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
            Showing <strong className="text-neutral-900 dark:text-white">{totalItems === 0 ? 0 : (safePage - 1) * effectivePageSize + 1}-{Math.min(safePage * effectivePageSize, totalItems)}</strong> of <strong className="text-neutral-900 dark:text-white">{totalItems}</strong>
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs font-bold px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-card text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={0}>All ({products.length})</option>
            </select>
          </div>
        </div>

      </div>

      {/* VIEW MODE 1: Table View with Pagination */}
      {viewMode === 'table' && (
        <>
          {/* Table Container (Desktop only) */}
          <div className="hidden md:block bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
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
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-card bg-neutral-200 dark:bg-neutral-800" />
                            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="h-3.5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-1" />
                          <div className="h-2.5 w-24 bg-neutral-150 dark:bg-neutral-850 rounded" />
                        </td>
                        <td className="p-4"><div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                        <td className="p-4"><div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-8 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                        <td className="p-4"><div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                        <td className="p-4 text-right"><div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map(prod => (
                      <tr key={prod.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                        {/* Image & ID */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => handleOpenImageModal(prod)}
                              className="group/img relative w-11 h-11 rounded-card overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-2xs cursor-pointer"
                              title="Click to change product image via Cloudinary"
                            >
                              <img 
                                src={prod.images[0]} 
                                alt={prod.name} 
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = resolveProductImage(prod.slug, prod.categorySlug);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                                <Camera className="w-3.5 h-3.5" />
                                <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">Edit</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-450 font-mono block truncate max-w-[80px]" title={prod.id}>
                              {prod.id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>
                        
                        {/* Name */}
                        <td className="p-4">
                          <p className="font-bold text-neutral-850 dark:text-white leading-tight text-xs">{prod.name}</p>
                          {prod.nameTamil && (
                            <span className="text-[10px] text-neutral-500 font-medium block mt-0.5">{prod.nameTamil}</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 uppercase">
                            {prod.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="p-4">
                          <p className="font-extrabold text-neutral-900 dark:text-white">₹{prod.price}</p>
                          <span className="text-[10px] text-neutral-400 font-bold block">per {prod.unit}</span>
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
                          {!prod.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                              <XCircle className="w-3 h-3 text-neutral-400" />
                              Inactive
                            </span>
                          ) : prod.stock <= 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                              <XCircle className="w-3 h-3 text-red-500" />
                              Out of Stock
                            </span>
                          ) : prod.stock <= 10 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Low Stock ({prod.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20">
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleOpenImageModal(prod)}
                              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-emerald-500 cursor-pointer"
                              title="Change Photo via Cloudinary"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
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
                              disabled={isDeleting === prod.id}
                              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer disabled:opacity-50"
                              title="Delete Product"
                            >
                              {isDeleting === prod.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center font-bold text-neutral-500">
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Container (Mobile only) */}
          <div className="block md:hidden space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-neutral-900 border rounded-feature p-4 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-card bg-neutral-200 dark:bg-neutral-800" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                      <div className="h-3 bg-neutral-150 dark:bg-neutral-850 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map(prod => (
                <div key={prod.id} className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={prod.images[0]} 
                      alt={prod.name} 
                      className="w-14 h-14 rounded-card object-cover border border-neutral-200 dark:border-neutral-700 bg-neutral-100 shadow-2xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = resolveProductImage(prod.slug, prod.categorySlug);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-sm text-neutral-850 dark:text-white truncate">{prod.name}</h4>
                        <span className="text-[10px] font-bold text-neutral-450 shrink-0 font-mono">{prod.id.slice(0, 6)}</span>
                      </div>
                      {prod.nameTamil && (
                        <span className="text-[10px] text-neutral-500 font-medium block">{prod.nameTamil}</span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-500/10 text-primary-500 uppercase mt-1 inline-block">
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-neutral-50 dark:border-neutral-850/60 pt-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-450 uppercase block">Price</span>
                      <p className="font-extrabold text-neutral-900 dark:text-white mt-0.5">₹{prod.price}</p>
                      <span className="text-[10px] text-neutral-400 font-bold block">per {prod.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-450 uppercase block">Stock</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`font-extrabold ${prod.stock <= 10 ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {prod.stock}
                        </span>
                        {prod.stock <= 10 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                    </div>
                    <div>
                      {!prod.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                          Inactive
                        </span>
                      ) : prod.stock <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                          Out of Stock
                        </span>
                      ) : prod.stock <= 10 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Low Stock ({prod.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 border-t border-neutral-50 dark:border-neutral-850/60 pt-2.5">
                    <Link href={`/admin/products/edit/${prod.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold border border-neutral-250 dark:border-neutral-750 py-1.5 px-3"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      disabled={isDeleting === prod.id}
                      className="text-[10px] font-bold py-1.5 px-3"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-neutral-900 border rounded-feature p-8 text-center font-bold text-neutral-500">
                No products found matching your search.
              </div>
            )}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
              <span className="text-xs font-semibold text-neutral-500">
                Page <strong className="text-neutral-900 dark:text-white">{safePage}</strong> of <strong className="text-neutral-900 dark:text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safePage <= 1}
                  className="p-2 rounded-card border border-neutral-200 dark:border-neutral-750 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Display page window
                  if (totalPages > 7) {
                    if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - safePage) > 2) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} className="text-xs text-neutral-400 px-1">...</span>;
                      }
                      return null;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] h-8 text-xs font-bold rounded-card transition-all cursor-pointer ${
                        safePage === pageNum
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safePage >= totalPages}
                  className="p-2 rounded-card border border-neutral-200 dark:border-neutral-750 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: Category-Wise Grouped View */}
      {viewMode === 'category' && (
        <div className="space-y-8">
          {groupedByCategory.length > 0 ? (
            groupedByCategory.map((group) => (
              <div 
                key={group.categoryName}
                className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4"
              >
                {/* Category Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3.5 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-card bg-primary-500/10 flex items-center justify-center text-primary-500 font-black">
                      {group.categoryName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                          {group.categoryName}
                        </h3>
                        {group.categoryNameTamil && (
                          <span className="text-xs text-neutral-500 font-medium">
                            ({group.categoryNameTamil})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-500">
                    {group.products.length} products
                  </span>
                </div>

                {/* Products Grid in Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.products.map((prod) => (
                    <div 
                      key={prod.id}
                      className="flex flex-col justify-between p-3.5 rounded-card border border-neutral-150 dark:border-neutral-800 hover:border-primary-500/40 hover:shadow-sm transition-all bg-neutral-50/40 dark:bg-neutral-850/30"
                    >
                      <div className="space-y-3">
                        {/* Image & Status Badge */}
                        <div className="relative aspect-4/3 rounded-card overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 group/cardimg">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className="w-full h-full object-cover group-hover/cardimg:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = resolveProductImage(prod.slug, prod.categorySlug);
                            }}
                          />
                          <button
                            onClick={() => handleOpenImageModal(prod)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-primary-500 text-white shadow-sm transition-all cursor-pointer z-10"
                            title="Change Photo via Cloudinary"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs ${
                            !prod.isActive ? 'bg-neutral-600 text-white' : prod.stock <= 0 ? 'bg-red-500 text-white' : prod.stock <= 10 ? 'bg-amber-500 text-white' : 'bg-success text-white'
                          }`}>
                            {!prod.isActive ? 'Inactive' : prod.stock <= 0 ? 'Out of Stock' : prod.stock <= 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>

                        {/* Title & Tamil subtitle */}
                        <div>
                          <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1" title={prod.name}>
                            {prod.name}
                          </h4>
                          {prod.nameTamil && (
                            <span className="text-[10px] text-neutral-500 font-medium block truncate mt-0.5">
                              {prod.nameTamil}
                            </span>
                          )}
                        </div>

                        {/* Price & Stock */}
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                          <div>
                            <span className="font-extrabold text-neutral-900 dark:text-white">₹{prod.price}</span>
                            <span className="text-[10px] text-neutral-400 font-semibold block">per {prod.unit}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Stock</span>
                            <span className={`font-extrabold text-xs ${prod.stock <= 10 ? 'text-red-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                              {prod.stock} units
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-neutral-200/60 dark:border-neutral-800">
                        <Link href={`/admin/products/edit/${prod.id}`} className="flex-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-[10px] font-bold border border-neutral-250 dark:border-neutral-750 py-1.5"
                            leftIcon={<Edit className="w-3 h-3" />}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          disabled={isDeleting === prod.id}
                          className="text-[10px] font-bold py-1.5 px-2.5"
                          title="Delete Product"
                        >
                          {isDeleting === prod.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-neutral-900 border rounded-feature p-12 text-center font-bold text-neutral-500">
              No products found for the selected filter.
            </div>
          )}
        </div>
      )}

      {/* Quick Change Product Image Modal (Cloudinary Stream) */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-150 dark:border-neutral-850">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-card bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Update Product Photo
                  </h3>
                  <p className="text-[11px] font-semibold text-neutral-450">
                    {imageModalProduct.name} • <span className="text-primary-500">{imageModalProduct.category}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseImageModal}
                disabled={isUploadingModalImage}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Preview Comparison */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Current</span>
                  <div className="w-20 h-20 rounded-card overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 shadow-2xs">
                    <img 
                      src={imageModalProduct.images[0]} 
                      alt="Current" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = resolveProductImage(imageModalProduct.slug, imageModalProduct.categorySlug);
                      }}
                    />
                  </div>
                </div>

                <div className="text-neutral-300 dark:text-neutral-700 font-bold">➔</div>

                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider block">New Image</span>
                  <div className="w-20 h-20 rounded-card overflow-hidden border-2 border-primary-500 bg-neutral-100 dark:bg-neutral-800 shadow-2xs relative">
                    {modalImagePreview ? (
                      <img src={modalImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    {modalImageFile && (
                      <span className="absolute bottom-0 inset-x-0 bg-primary-500 text-white text-[8px] font-black uppercase text-center py-0.5">
                        Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={(e) => e.target.files?.[0] && handleModalFileSelect(e.target.files[0])}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
              />

              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => !isUploadingModalImage && modalFileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setModalDragOver(true); }}
                onDragLeave={() => setModalDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setModalDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleModalFileSelect(file);
                }}
                className={`border-2 border-dashed rounded-feature p-5 text-center cursor-pointer transition-all ${
                  modalDragOver
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-850/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-2">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-neutral-850 dark:text-white">
                  Click to browse or drop an image file
                </p>
                <p className="text-[10px] font-medium text-neutral-450 mt-0.5">
                  JPG, PNG, or WEBP up to 5MB • Uploads directly to Cloudinary
                </p>
              </div>

              {/* External Image URL Alternative */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Or paste external image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={modalImageUrlInput}
                    onChange={(e) => {
                      setModalImageUrlInput(e.target.value);
                      if (e.target.value.startsWith('http')) {
                        setModalImagePreview(e.target.value);
                        setModalImageFile(null);
                      }
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (modalImageUrlInput.startsWith('http')) {
                        setModalImagePreview(modalImageUrlInput);
                        setModalImageFile(null);
                        toast.success('Preview loaded from URL.');
                      } else {
                        toast.warning('Please enter a valid HTTP URL.');
                      }
                    }}
                    className="text-xs font-bold border border-neutral-250 dark:border-neutral-750"
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-150 dark:border-neutral-850">
              <span className="text-[10px] font-semibold text-neutral-450 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloudinary Storage
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseImageModal}
                  disabled={isUploadingModalImage}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveModalImage}
                  disabled={isUploadingModalImage || (!modalImageFile && !modalImageUrlInput && !modalImagePreview)}
                  className="text-xs font-bold min-w-[130px] justify-center"
                  leftIcon={
                    isUploadingModalImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {isUploadingModalImage ? 'Uploading to Cloudinary...' : 'Save & Publish'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
