import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, PackageOpen, Layers } from 'lucide-react';
import AddItemModal, { NewItem } from './AddItemModal';

interface InventoryManagementProps {
    allowedCategories: string[];
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ allowedCategories }) => {
    const [items, setItems] = useState<NewItem[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await fetch('/api/vendor-inventory')
                if (!res.ok) return
                const data = await res.json()
                if (!mounted) return
                setItems(Array.isArray(data.items) ? data.items : [])
            } catch (e) {
                console.error('Failed to load inventory', e)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const handleAddItem = async (item: NewItem) => {
        try {
            const res = await fetch('/api/vendor-inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    price: item.price,
                    description: item.description,
                })
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Failed to add item')
            }
            const created = await res.json()
            setItems(prev => [created, ...prev])
        } catch (e) {
            console.error('Add item failed', e)
            alert('Failed to add item')
        }
    };

    const handleRemoveItem = async (id: string) => {
        const ok = confirm('Are you sure you want to remove this item?')
        if (!ok) return
        try {
            const res = await fetch(`/api/vendor-inventory/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.message || 'Failed to delete item')
            }
            setItems(prev => prev.filter(item => item.id !== id))
        } catch (e) {
            console.error('Delete item failed', e)
            alert('Failed to delete item')
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 relative overflow-hidden group/container">
            {/* Subtle Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            Store Inventory
                        </h2>
                        <p className="text-gray-400 text-sm mt-2 ml-1">Manage your active listings and stock</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-lg shadow-white/5"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden md:inline">Add Item</span>
                        </motion.button>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-white/10 rounded-2xl bg-[#0A0A0A]/50">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                                <PackageOpen className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Inventory is empty</h3>
                            <p className="text-gray-500 max-w-sm mb-6">Your store is currently offline. Add items to start receiving orders.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                            >
                                Add your first item &rarr;
                            </button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                            No items found matching "{searchTerm}"
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            <AnimatePresence>
                                {filteredItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        className="group p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-[#151515] transition-all duration-200 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-white text-lg truncate">{item.name}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 text-gray-400 border border-white/10">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description || 'No description provided'}</p>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Price</div>
                                                <div className="text-white font-mono font-medium">₹{item.price} <span className="text-gray-600 text-xs">/ {item.unit}</span></div>
                                            </div>

                                            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                                                <button className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-colors" title="Edit Item">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                                    title="Delete Item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            <AddItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddItem}
                allowedCategories={allowedCategories}
            />
        </div>
    );
};

export default InventoryManagement;
