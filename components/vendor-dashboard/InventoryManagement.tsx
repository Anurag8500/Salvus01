import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Edit2, PackageOpen } from 'lucide-react';
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
        <div className="glass-card rounded-2xl p-6 md:p-8 min-h-[600px] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Inventory</h2>
                    <p className="text-gray-400 text-sm">Manage {items.length} listed items</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-darker border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent text-dark-darker font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-accent/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Add Item</span>
                    </motion.button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 rounded-xl border border-white/5 bg-black/20 overflow-hidden relative">
                {items.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <PackageOpen className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Inventory is empty</h3>
                        <p className="text-gray-400 max-w-sm mb-6">Your store is currently offline. Add items to start receiving orders from relief campaigns.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-accent hover:text-accent-light font-medium underline underline-offset-4"
                        >
                            Add your first item
                        </button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No items found matching "{searchTerm}"
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                                    <th className="px-6 py-4 font-semibold">Item Details</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Unit</th>
                                    <th className="px-6 py-4 font-semibold">Price</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {filteredItems.map((item) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            layout
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{item.name}</div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{item.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-300 border border-white/10 group-hover:border-white/20 transition-all">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300 text-sm">{item.unit}</td>
                                            <td className="px-6 py-4 font-mono text-accent-light font-medium">{item.price.toFixed(2)} USDC</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 rounded-lg hover:bg-white/10 text-blue-400 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
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
