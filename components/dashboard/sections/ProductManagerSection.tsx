
import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { YouTubeIcon, ShopeeIcon, PlusIcon, TrashIcon, CheckCircleIcon, SpinnerIcon, TagIcon } from '../Icons';

interface BusinessProduct {
  id: string;
  name: string;
  type: 'Product' | 'Service';
  price: number;
  syncedYouTube: boolean;
  syncedShopee: boolean;
}

const ProductManagerSection: React.FC = () => {
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductType, setNewProductType] = useState<'Product' | 'Service'>('Product');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [isSyncingYouTube, setIsSyncingYouTube] = useState(false);
  const [isSyncingShopee, setIsSyncingShopee] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const savedProducts = localStorage.getItem('businessProducts');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Default mock data
      setProducts([
        { id: '1', name: 'Custom Logo Design', type: 'Service', price: 150, syncedYouTube: true, syncedShopee: false },
        { id: '2', name: 'Handmade Tote Bag', type: 'Product', price: 35, syncedYouTube: false, syncedShopee: true },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('businessProducts', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice) return;

    const newProduct: BusinessProduct = {
      id: Date.now().toString(),
      name: newProductName,
      type: newProductType,
      price: parseFloat(newProductPrice),
      syncedYouTube: false,
      syncedShopee: false,
    };

    setProducts([...products, newProduct]);
    setNewProductName('');
    setNewProductPrice('');
    addToast('Item added to inventory!', 'success');
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSync = (platform: 'YouTube' | 'Shopee') => {
    const setSyncing = platform === 'YouTube' ? setIsSyncingYouTube : setIsSyncingShopee;
    const syncKey = platform === 'YouTube' ? 'syncedYouTube' : 'syncedShopee';

    setSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProducts(prev => prev.map(p => ({ ...p, [syncKey]: true })));
      setSyncing(false);
      addToast(`Inventory synced with ${platform} successfully!`, 'success');
    }, 2000);
  };

  return (
    <div className="bento-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <TagIcon className="h-7 w-7 text-[var(--primary)]" />
                My Business Offerings
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">Manage your products & services and sync them to sales channels.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => handleSync('YouTube')}
                disabled={isSyncingYouTube || products.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    isSyncingYouTube 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isSyncingYouTube ? <SpinnerIcon className="h-4 w-4" /> : <YouTubeIcon className="h-4 w-4" />}
                {isSyncingYouTube ? 'Syncing...' : 'Sync to YouTube'}
            </button>
            <button 
                onClick={() => handleSync('Shopee')}
                disabled={isSyncingShopee || products.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    isSyncingShopee
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' 
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isSyncingShopee ? <SpinnerIcon className="h-4 w-4" /> : <ShopeeIcon className="h-4 w-4" />}
                {isSyncingShopee ? 'Syncing...' : 'Sync to Shopee'}
            </button>
        </div>
      </div>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="mb-6 p-4 bg-[var(--secondary)]/30 rounded-xl border border-[var(--border)]">
        <h3 className="font-semibold text-[var(--foreground)] mb-3">Add New Entry</h3>
        <div className="flex flex-col md:flex-row gap-3">
            <input 
                type="text" 
                placeholder="Item Name" 
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="flex-[2] px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <select 
                value={newProductType}
                onChange={(e) => setNewProductType(e.target.value as 'Product' | 'Service')}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
                <option value="Product">Product</option>
                <option value="Service">Service</option>
            </select>
            <div className="flex-1 relative">
                <span className="absolute left-3 top-2 text-[var(--muted)]">RM</span>
                <input 
                    type="number" 
                    placeholder="Price" 
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
            </div>
            <button 
                type="submit"
                disabled={!newProductName || !newProductPrice}
                className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <PlusIcon className="h-5 w-5" />
                Add
            </button>
        </div>
      </form>

      {/* Product List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-sm text-[var(--muted)] border-b border-[var(--border)]">
                    <th className="py-3 pl-2">Name</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Price</th>
                    <th className="py-3 text-center">YouTube</th>
                    <th className="py-3 text-center">Shopee</th>
                    <th className="py-3 text-right pr-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {products.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="py-8 text-center text-[var(--muted)]">
                            No items in your inventory yet. Add one above!
                        </td>
                    </tr>
                ) : (
                    products.map(product => (
                        <tr key={product.id} className="border-b border-[var(--border)] last:border-none hover:bg-[var(--secondary)]/20 transition-colors">
                            <td className="py-3 pl-2 font-semibold text-[var(--foreground)]">{product.name}</td>
                            <td className="py-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.type === 'Product' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'}`}>
                                    {product.type}
                                </span>
                            </td>
                            <td className="py-3 text-[var(--foreground)]">RM {product.price.toFixed(2)}</td>
                            <td className="py-3 text-center">
                                {product.syncedYouTube ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                        <CheckCircleIcon className="h-3 w-3" /> Synced
                                    </span>
                                ) : (
                                    <span className="text-xs text-[var(--muted)]">Pending</span>
                                )}
                            </td>
                            <td className="py-3 text-center">
                                {product.syncedShopee ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                        <CheckCircleIcon className="h-3 w-3" /> Synced
                                    </span>
                                ) : (
                                    <span className="text-xs text-[var(--muted)]">Pending</span>
                                )}
                            </td>
                            <td className="py-3 text-right pr-2">
                                <button 
                                    onClick={() => handleDelete(product.id)}
                                    className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagerSection;
