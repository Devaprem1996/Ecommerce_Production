"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search as SearchIcon, 
  Filter, 
  Grid2X2, 
  Grid3X3, 
  List, 
  X, 
  Star, 
  RotateCcw, 
  ShoppingBag, 
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Check,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { mockProducts, mockCategories } from "@/constants/mockData";
import { ProductCard } from "@/components/ui/ProductCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "@/components/ui/Toast";
import { ProductType } from "@/types";
import { slugify } from "@/utils/slugify";

// Static mapping of spelling typos to correct queries
const spellingSuggestions: Record<string, string> = {
  honeyy: "honey",
  hony: "honey",
  tomat: "tomato",
  tomatoe: "tomato",
  spinac: "spinach",
  millets: "millet",
  oils: "oil",
  sweetner: "sweetener",
  graine: "grains",
  ricee: "rice",
};

function SearchContent() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stores
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  // Search input state
  const queryParam = searchParams.get("q") || "";
  const [searchVal, setSearchVal] = useState(queryParam);

  // Sync state when query parameter changes
  useEffect(() => {
    setSearchVal(queryParam);
  }, [queryParam]);

  // Filtering & Sorting States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  // Pagination & Loading
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Simulate initial loading
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [queryParam]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  // Add to Cart
  const handleAddToCart = (product: ProductType) => {
    addItem(product);
    const displayName = currentLang === "ta" && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(displayName);
  };

  // Wishlist Toggle
  const handleWishlistToggle = (product: ProductType) => {
    const wasWishlisted = hasItem(product.id);
    toggleItem(product);
    const displayName = currentLang === "ta" && product.nameTamil ? product.nameTamil : product.name;
    if (!wasWishlisted) {
      toast.success(
        currentLang === "ta" 
          ? `${displayName} விருப்பப்பட்டியலில் சேர்க்கப்பட்டது!` 
          : `${displayName} added to wishlist!`
      );
    } else {
      toast.info(
        currentLang === "ta" 
          ? `${displayName} விருப்பப்பட்டியலில் இருந்து நீக்கப்பட்டது` 
          : `${displayName} removed from wishlist`
      );
    }
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(1000);
    setSelectedRating(null);
    setInStockOnly(false);
    setSortBy("featured");
  };

  // Spelling suggestions check
  const suggestedQuery = useMemo(() => {
    if (!queryParam) return null;
    const words = queryParam.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (spellingSuggestions[word]) {
        return spellingSuggestions[word];
      }
    }
    return null;
  }, [queryParam]);

  // Basic Filtered Results
  const filteredProducts = useMemo(() => {
    const cleanQuery = queryParam.toLowerCase().trim();
    if (!cleanQuery) return [];

    let result = mockProducts.filter((product) => {
      const matchName = product.name.toLowerCase().includes(cleanQuery);
      const matchNameTamil = product.nameTamil ? product.nameTamil.toLowerCase().includes(cleanQuery) : false;
      const matchCat = product.category.toLowerCase().includes(cleanQuery);
      const matchDesc = product.description.toLowerCase().includes(cleanQuery);
      const matchDescTamil = product.descriptionTamil ? product.descriptionTamil.toLowerCase().includes(cleanQuery) : false;
      
      return matchName || matchNameTamil || matchCat || matchDesc || matchDescTamil;
    });

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }

    // Price Filter
    result = result.filter((product) => product.price >= minPrice && product.price <= maxPrice);

    // Rating Filter
    if (selectedRating !== null) {
      result = result.filter((product) => product.rating >= selectedRating);
    }

    // Availability Filter
    if (inStockOnly) {
      result = result.filter((product) => product.stock > 0);
    }

    // Sort Logic
    if (sortBy === "price-low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [queryParam, selectedCategories, minPrice, maxPrice, selectedRating, inStockOnly, sortBy]);

  // Recommendations for Empty State (Popular items)
  const popularRecommendations = useMemo(() => {
    return [...mockProducts]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, []);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const loadMoreProducts = () => {
    setIsFilterLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsFilterLoading(false);
    }, 450);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockProducts.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      
      {/* Search Header Container */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-4">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t("shop.breadcrumb_home", "Home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              {t("search_page.title", "Search Results")}
            </span>
          </nav>

          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
              {queryParam ? (
                <>
                  {t("search_page.title", "Search results for")} <span className="text-primary-600 dark:text-primary-400">"{queryParam}"</span>
                </>
              ) : (
                t("nav.search", "Search Products")
              )}
            </h1>
            
            {queryParam && !isPageLoading && (
              <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">
                {t("search_page.showing_results", "Showing {{count}} results", { count: filteredProducts.length })}
              </p>
            )}

            {/* In-page Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={t("nav.search", "Search Products...")}
                className="w-full h-11 text-sm pl-4 pr-12 rounded-card border border-neutral-250 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:outline-none focus:border-primary-500 text-neutral-900 dark:text-white transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-card text-neutral-500 hover:text-primary-600 transition-colors"
                aria-label="Submit search query"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>

            {/* Spelling Typos suggestion alert */}
            {suggestedQuery && (
              <div className="mt-4 p-3.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-card flex items-start gap-2.5 text-xs text-yellow-805 dark:text-yellow-400">
                <HelpCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{t("search_page.did_you_mean", "Did you mean: ")}</span>
                  <Link 
                    href={`/search?q=${encodeURIComponent(suggestedQuery)}`}
                    className="font-bold underline text-primary-600 dark:text-primary-400 hover:text-primary-500 ml-1"
                  >
                    {suggestedQuery}
                  </Link>
                  <p className="mt-0.5 text-neutral-500">
                    Showing results for "{queryParam}" instead.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Results Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isPageLoading ? (
          /* STATE 3 — LOADING */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonLoader key={idx} variant="card" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* STATE 2 — NO RESULTS */
          <div className="space-y-12">
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-450 mb-6">
                <SearchIcon className="w-9 h-9 text-neutral-400" />
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                {t("search_page.no_results", "No results for ")} "{queryParam}"
              </h3>
              
              <div className="text-left bg-neutral-50 dark:bg-neutral-950 p-5 rounded-card max-w-md w-full border border-neutral-150 dark:border-neutral-800/60 mt-4 space-y-2">
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest mb-3">
                  {t("search_page.check_spelling", "Try these suggestions:")}
                </p>
                <ul className="text-xs text-neutral-505 dark:text-neutral-400 space-y-1.5 list-disc list-inside">
                  <li>{t("search_page.check_spelling", "Check your spelling")}</li>
                  <li>{t("search_page.fewer_keywords", "Use fewer or different keywords")}</li>
                  <li>{t("search_page.browse_instead", "Browse our categories instead")}</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button
                  variant="secondary"
                  onClick={() => router.push("/shop")}
                  className="font-bold text-xs"
                >
                  {t("search_page.browse_all", "Browse All Products")}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push("/")}
                  className="font-bold text-xs"
                >
                  {t("search_page.go_home", "Go to Home")}
                </Button>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-150 dark:border-neutral-800 pb-3">
                <h3 className="text-lg font-bold font-heading text-neutral-900 dark:text-white">
                  {t("search_page.you_might_like", "You Might Also Like")}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {popularRecommendations.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={hasItem(prod.id)}
                    onClick={() => router.push(`/shop/${slugify(prod.name)}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* STATE 1 — HAS RESULTS */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sticky top-24 self-start max-h-[85vh] overflow-y-auto shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary-500" />
                  {t("shop.filter_title", "Filters")}
                </h3>
                {(selectedCategories.length > 0 || minPrice > 0 || maxPrice < 1000 || selectedRating !== null || inStockOnly) && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("shop.clear_all", "Clear All")}
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {t("shop.category", "Categories")}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {mockCategories.map((cat) => {
                    const displayName = currentLang === "ta" && cat.nameTamil ? cat.nameTamil : cat.name;
                    const isChecked = selectedCategories.includes(cat.name);
                    return (
                      <label key={cat.id} className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer group select-none">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategory(cat.name)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-500 accent-primary-500"
                          />
                          <span className="group-hover:text-primary-500 transition-colors font-medium">
                            {displayName}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-500 font-semibold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                          {categoryCounts[cat.name] || 0}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {t("shop.price_range", "Price Range")}
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-white">
                    <span>₹{minPrice}</span>
                    <span>₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="20"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {t("shop.rating", "Customer Rating")}
                </h4>
                <div className="flex flex-col gap-2">
                  {[5, 4, 3, 2].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setSelectedRating(selectedRating === stars ? null : stars)}
                      className={`flex items-center justify-between w-full px-3 py-1.5 rounded-card text-left transition-colors cursor-pointer text-sm font-medium ${
                        selectedRating === stars
                          ? "bg-primary-500/10 text-primary-500 font-bold border border-primary-500/20"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 text-secondary-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < stars ? "fill-current" : "text-neutral-200 dark:text-neutral-800"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {selectedRating === stars && <Check className="w-4 h-4 text-primary-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock availability */}
              <div>
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {t("shop.availability", "Availability")}
                </h4>
                <label className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={() => setInStockOnly(!inStockOnly)}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-500 accent-primary-500"
                  />
                  <span className="font-medium">{t("shop.in_stock", "Hide Out of Stock")}</span>
                </label>
              </div>
            </aside>

            {/* Products Main Grid */}
            <main className="col-span-1 lg:col-span-3 flex flex-col">
              
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature px-4 py-3 mb-6 shadow-sm">
                
                {/* Mobile Filter Toggle */}
                <div className="flex items-center gap-2 sm:hidden w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    leftIcon={<Filter className="w-4 h-4" />}
                    className="flex-1 text-xs py-2 h-9 border border-neutral-200 dark:border-neutral-850"
                  >
                    {t("shop.filter_title", "Filters")}
                  </Button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                    {t("shop.sort_by", "Sort By")}:
                  </span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none text-xs font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 border border-neutral-250 dark:border-neutral-700 pl-3 pr-8 py-1.5 rounded-card focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                    >
                      <option value="featured">{t("shop.sort_featured", "Featured")}</option>
                      <option value="price-low-high">{t("shop.sort_price_asc", "Price: Low to High")}</option>
                      <option value="price-high-low">{t("shop.sort_price_desc", "Price: High to Low")}</option>
                      <option value="rating">{t("shop.sort_rating", "Top Rated")}</option>
                      <option value="newest">{t("shop.sort_newest", "Newest")}</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-650 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* View Mode controls */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setViewMode("grid"); setGridCols(4); }}
                      className={`p-1.5 rounded-card transition-colors ${
                        viewMode === "grid" && gridCols === 4
                          ? "bg-primary-500/10 text-primary-500"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <Grid3X3 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => { setViewMode("grid"); setGridCols(2); }}
                      className={`p-1.5 rounded-card transition-colors ${
                        viewMode === "grid" && gridCols === 2
                          ? "bg-primary-500/10 text-primary-500"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <Grid2X2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-card transition-colors ${
                        viewMode === "list"
                          ? "bg-primary-500/10 text-primary-500"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <List className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <span className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                    {filteredProducts.length} {t("category.items", "items")}
                  </span>
                </div>
              </div>

              {/* Product Listing Grid */}
              <motion.div
                layout
                className={
                  viewMode === "list"
                    ? "flex flex-col gap-4"
                    : gridCols === 2
                    ? "grid grid-cols-2 gap-4 sm:gap-6"
                    : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                }
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                {paginatedProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                    className="flex animate-fade-in"
                  >
                    {viewMode === "list" ? (
                      <div
                        onClick={() => router.push(`/shop/${slugify(product.name)}`)}
                        className="flex flex-col sm:flex-row gap-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-feature w-full group cursor-pointer hover:shadow-card-hover transition-all duration-normal"
                      >
                        <div className="relative aspect-square w-full sm:w-44 bg-neutral-50 dark:bg-neutral-800 rounded-card overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={product.images[0]}
                            alt={currentLang === "ta" && product.nameTamil ? product.nameTamil : product.name}
                            className="object-cover w-full h-full transition-transform duration-slow group-hover:scale-105"
                          />
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-error px-2.5 py-1 rounded-badge">
                                {t("badge.sold-out", "Sold Out")}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-between flex-1 py-1">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                              {product.category}
                            </span>
                            <h3 className="text-base font-bold font-heading text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
                              {currentLang === "ta" && product.nameTamil ? product.nameTamil : product.name}
                            </h3>
                            <div className="flex items-center gap-1.5 pt-1">
                              <div className="flex items-center text-secondary-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-current" : "text-neutral-200 dark:text-neutral-800"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold">
                                ({product.reviewsCount})
                              </span>
                            </div>
                            <p className="text-xs text-neutral-650 dark:text-neutral-405 line-clamp-2 leading-relaxed pt-2">
                              {currentLang === "ta" && product.descriptionTamil ? product.descriptionTamil : product.description}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-end justify-between gap-4 mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
                            <div>
                              <span className="text-[10px] text-neutral-650 line-through">
                                ₹{Math.round(product.price * 1.25)}
                              </span>
                              <div className="text-lg font-black text-primary-750 dark:text-primary-400 leading-tight">
                                ₹{product.price}
                                <span className="text-[10px] text-neutral-600 font-normal ml-0.5">/ {product.unit}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWishlistToggle(product);
                                }}
                                className={`p-2 rounded-card border border-neutral-200 dark:border-neutral-850 ${
                                  hasItem(product.id) ? "text-red-500" : "text-neutral-605 hover:text-red-500"
                                }`}
                              >
                                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </Button>
                              <Button
                                variant={product.stock === 0 ? "secondary" : "primary"}
                                size="sm"
                                disabled={product.stock === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                leftIcon={<ShoppingBag className="w-4.5 h-4.5" />}
                                className="font-bold text-[11px]"
                              >
                                {product.stock === 0 ? t("products.out_of_stock", "Sold Out") : t("products.add_to_cart", "Add")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isWishlisted={hasItem(product.id)}
                        onClick={() => router.push(`/shop/${slugify(product.name)}`)}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Products */}
              {filteredProducts.length > visibleCount && (
                <div className="flex items-center justify-center mt-12">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={loadMoreProducts}
                    disabled={isFilterLoading}
                    className="min-w-[150px] border border-neutral-200 dark:border-neutral-800"
                    leftIcon={isFilterLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary-500" /> : undefined}
                  >
                    {isFilterLoading ? t("shop.checking", "Loading...") : t("shop.load_more", "Load More")}
                  </Button>
                </div>
              )}

            </main>
          </div>
        )}
      </div>

      {/* Mobile Drawer Filter panel */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white dark:bg-neutral-900 z-50 rounded-t-feature shadow-2xl flex flex-col font-sans"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4.5 h-4.5 text-primary-500" />
                  {t("shop.filter_title", "Filters")}
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={handleClearAll} className="text-xs font-semibold text-neutral-500">
                    {t("shop.clear_all", "Reset")}
                  </button>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-neutral-100">
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Categories */}
                <div className="pb-5 border-b border-neutral-100 dark:border-neutral-800">
                  <h4 className="font-bold text-xs text-neutral-905 dark:text-white uppercase tracking-wider mb-3">
                    {t("shop.category", "Categories")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mockCategories.map((cat) => {
                      const displayName = currentLang === "ta" && cat.nameTamil ? cat.nameTamil : cat.name;
                      const isChecked = selectedCategories.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.name)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-badge border ${
                            isChecked
                              ? "bg-primary-500/10 text-primary-500 border-primary-500"
                              : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {displayName} ({categoryCounts[cat.name] || 0})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price range */}
                <div className="pb-5 border-b border-neutral-100 dark:border-neutral-800">
                  <h4 className="font-bold text-xs text-neutral-905 dark:text-white uppercase tracking-wider mb-3">
                    {t("shop.price_range", "Price Range")}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-white">
                      <span>₹{minPrice}</span>
                      <span>₹{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="20"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-bold text-xs text-neutral-905 dark:text-white uppercase tracking-wider mb-3">
                    {t("shop.availability", "Availability")}
                  </h4>
                  <button
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-card border ${
                      inStockOnly
                        ? "bg-primary-500/10 text-primary-500 border-primary-500 font-bold"
                        : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span className="text-xs">{t("shop.in_stock", "Hide Out of Stock")}</span>
                    {inStockOnly && <Check className="w-4 h-4 text-primary-500" />}
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full font-bold text-sm"
                >
                  {t("shop.apply_filters", "Apply Filters")}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
