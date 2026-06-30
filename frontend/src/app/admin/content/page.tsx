"use client";

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  HelpCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ArrowUpDown,
  Search,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

// Mock Banners
interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  sortOrder: number;
}
const initialBanners: Banner[] = [
  { id: 'b-1', title: 'Season Harvest Organic Fruits', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800', link: '/shop?category=fruits-vegetables', sortOrder: 1 },
  { id: 'b-2', title: 'A2 Cow Ghee Promo Sale', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800', link: '/shop/a2-cow-ghee', sortOrder: 2 }
];

// Mock Blogs
interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
}
const initialBlogs: BlogPost[] = [
  { id: 'blog-1', title: 'Why Choose A2 Cultured Ghee Over Regular Butter?', category: 'Nutrition', author: 'Dr. Ramesh Nathan', date: '28 Jun 2026' },
  { id: 'blog-2', title: 'Understanding Organic Crop Rotation Practices', category: 'Farming', author: 'Farm Lead Vijay', date: '15 Jun 2026' }
];

// Mock FAQs
interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}
const initialFAQs: FAQ[] = [
  { id: 'faq-1', category: 'Delivery', question: 'How long does delivery take inside Chennai?', answer: 'Orders placed before 12 PM are delivered on the next calendar day.' },
  { id: 'faq-2', category: 'Products', question: 'Is all Aether honey chemical free?', answer: 'Yes! We collect wild mountain honey that is certified organic.' }
];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'blogs' | 'faqs'>('banners');

  // Lists States
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [faqs, setFAQs] = useState<FAQ[]>(initialFAQs);

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form Fields Banners
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerOrder, setBannerOrder] = useState(1);

  // Form Fields Blogs
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCat, setBlogCat] = useState('Nutrition');
  const [blogAuthor, setBlogAuthor] = useState('Admin');

  // Form Fields FAQs
  const [faqCat, setFaqCat] = useState('Orders');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeTab === 'banners') {
      setBannerTitle('');
      setBannerImage('');
      setBannerLink('');
      setBannerOrder(banners.length + 1);
    } else if (activeTab === 'blogs') {
      setBlogTitle('');
      setBlogCat('Nutrition');
      setBlogAuthor('Admin');
    } else {
      setFaqCat('Orders');
      setFaqQuestion('');
      setFaqAnswer('');
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'banners') {
      setBannerTitle(item.title);
      setBannerImage(item.image);
      setBannerLink(item.link);
      setBannerOrder(item.sortOrder);
    } else if (activeTab === 'blogs') {
      setBlogTitle(item.title);
      setBlogCat(item.category);
      setBlogAuthor(item.author);
    } else {
      setFaqCat(item.category);
      setFaqQuestion(item.question);
      setFaqAnswer(item.answer);
    }
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item from content files?')) {
      if (activeTab === 'banners') setBanners(prev => prev.filter(b => b.id !== id));
      else if (activeTab === 'blogs') setBlogs(prev => prev.filter(b => b.id !== id));
      else setFAQs(prev => prev.filter(f => f.id !== id));
      toast.success('Content item deleted successfully.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'banners') {
      if (!bannerTitle || !bannerImage) return;
      if (editingItem) {
        setBanners(prev => prev.map(b => b.id === editingItem.id ? { ...b, title: bannerTitle, image: bannerImage, link: bannerLink, sortOrder: bannerOrder } : b));
        toast.success('Promo banner updated.');
      } else {
        const newBanner: Banner = { id: 'b-' + Math.floor(Math.random() * 100), title: bannerTitle, image: bannerImage, link: bannerLink, sortOrder: bannerOrder };
        setBanners([...banners, newBanner]);
        toast.success('Promo banner added!');
      }
    } else if (activeTab === 'blogs') {
      if (!blogTitle) return;
      if (editingItem) {
        setBlogs(prev => prev.map(b => b.id === editingItem.id ? { ...b, title: blogTitle, category: blogCat, author: blogAuthor } : b));
        toast.success('Blog metadata updated.');
      } else {
        const newBlog: BlogPost = { id: 'blog-' + Math.floor(Math.random() * 100), title: blogTitle, category: blogCat, author: blogAuthor, date: 'Today' };
        setBlogs([...blogs, newBlog]);
        toast.success('Blog article registered!');
      }
    } else {
      if (!faqQuestion || !faqAnswer) return;
      if (editingItem) {
        setFAQs(prev => prev.map(f => f.id === editingItem.id ? { ...f, question: faqQuestion, answer: faqAnswer, category: faqCat } : f));
        toast.success('FAQ card updated.');
      } else {
        const newFaq: FAQ = { id: 'faq-' + Math.floor(Math.random() * 100), question: faqQuestion, answer: faqAnswer, category: faqCat };
        setFAQs([...faqs, newFaq]);
        toast.success('FAQ created!');
      }
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Content Management
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Customize promo banners, editorial blog entries, and FAQ pages.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs font-bold"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Content
        </Button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-850 gap-4">
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
            activeTab === 'banners' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Banners ({banners.length})
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className={`pb-3 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
            activeTab === 'blogs' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Blog Posts ({blogs.length})
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`pb-3 text-xs font-black uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
            activeTab === 'faqs' ? 'border-primary-500 text-primary-500' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          FAQs ({faqs.length})
        </button>
      </div>

      {/* RENDER ACTIVE SUBSECTION */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm">
        
        {/* BANNERS SUBSECTION */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map(b => (
              <div key={b.id} className="border border-neutral-100 dark:border-neutral-800 rounded-card overflow-hidden bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between">
                <img src={b.image} alt={b.title} className="w-full h-40 object-cover border-b" />
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">{b.title}</h4>
                    <p className="text-[10px] text-neutral-500 mt-1">Order Index: {b.sortOrder} | Link: {b.link}</p>
                  </div>
                  <div className="flex gap-1.5 ml-3">
                    <button onClick={() => handleOpenEdit(b)} className="p-1 text-neutral-500 hover:text-primary-500 cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1 text-neutral-500 hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BLOGS SUBSECTION */}
        {activeTab === 'blogs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-neutral-450 uppercase font-black tracking-wider pb-2.5">
                  <th className="py-2.5">Blog Title</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Author</th>
                  <th className="py-2.5 text-right font-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
                {blogs.map(post => (
                  <tr key={post.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 font-bold text-neutral-850 dark:text-white">{post.title}</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[9px] bg-primary-500/10 text-primary-500 font-extrabold">{post.category}</span></td>
                    <td className="py-3 font-semibold text-neutral-500">{post.author}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(post)} className="p-1 text-neutral-500 hover:text-primary-500 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(post.id)} className="p-1 text-neutral-500 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FAQS SUBSECTION */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.id} className="p-4 border border-neutral-100 dark:border-neutral-800 rounded-card bg-neutral-50 dark:bg-neutral-950 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-primary-500">{f.category}</span>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{f.question}</h4>
                  <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">{f.answer}</p>
                </div>
                
                <div className="flex gap-1.5">
                  <button onClick={() => handleOpenEdit(f)} className="p-1 text-neutral-500 hover:text-primary-500 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(f.id)} className="p-1 text-neutral-500 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE / EDIT DIALOG FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer" />
          
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 space-y-4 z-10">
            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                {editingItem ? 'Edit Content' : 'Create Content'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-500 hover:text-primary-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* BANNERS FORM */}
              {activeTab === 'banners' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Banner Title *</label>
                    <input type="text" required value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Banner Image URL *</label>
                    <input type="url" required value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Redirect Link URL</label>
                    <input type="text" value={bannerLink} onChange={(e) => setBannerLink(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Sort Order</label>
                    <input type="number" min={1} value={bannerOrder} onChange={(e) => setBannerOrder(parseInt(e.target.value) || 1)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                </>
              )}

              {/* BLOGS FORM */}
              {activeTab === 'blogs' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Article Title *</label>
                    <input type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Category</label>
                    <select value={blogCat} onChange={(e) => setBlogCat(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none">
                      <option value="Nutrition">Nutrition</option>
                      <option value="Farming">Farming</option>
                      <option value="Recipes">Recipes</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Author Name</label>
                    <input type="text" value={blogAuthor} onChange={(e) => setBlogAuthor(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                </>
              )}

              {/* FAQS FORM */}
              {activeTab === 'faqs' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Category</label>
                    <select value={faqCat} onChange={(e) => setFaqCat(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none">
                      <option value="Orders">Orders</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Products">Products</option>
                      <option value="Payment">Payment</option>
                      <option value="Returns">Returns</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Question *</label>
                    <input type="text" required value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Answer *</label>
                    <textarea required value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} rows={3} className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none" />
                  </div>
                </>
              )}

              <Button type="submit" variant="primary" className="w-full font-bold text-xs py-2.5">
                Save Content Settings
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
