"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Link as LinkIcon, Lock, Save, DollarSign, Sparkles, Loader2, Pencil, Check, X } from "lucide-react";
import { addItem, deleteItem, setWishlistPin, updateItem } from "@/lib/actions";

interface Item {
    id: string;
    name: string;
    url?: string | null;
    price?: string | null;
    image?: string | null;
}

interface WishlistEditorProps {
    initialItems: Item[];
    wishlistSlug: string;
    isPinSet: boolean;
}

export default function WishlistEditor({ initialItems, wishlistSlug, isPinSet }: WishlistEditorProps) {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [newItemName, setNewItemName] = useState("");
    const [newItemUrl, setNewItemUrl] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemImage, setNewItemImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiMessage, setAiMessage] = useState("");

    // PIN Setting State
    const [newPin, setNewPin] = useState("");
    const [showPinForm, setShowPinForm] = useState(!isPinSet);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editPrice, setEditPrice] = useState("");

    // Image Upload Handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItemImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItemImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        setIsSubmitting(true);
        try {
            const addedItem = await addItem(wishlistSlug, {
                name: newItemName,
                url: newItemUrl,
                price: newItemPrice,
                image: newItemImage || undefined
            });

            setItems([...items, addedItem]);
            setNewItemName("");
            setNewItemUrl("");
            setNewItemPrice("");
            setNewItemImage(null);
            setIsSubmitting(false);
        } catch (error) {
            console.error("Failed to add item", error);
            setIsSubmitting(false);
        }
    };

    const handleAiSearch = async () => {
        if (!newItemName.trim()) {
            setAiError("Введите название, чтобы AI понимал что искать");
            return;
        }

        setAiError("");
        setAiMessage("");
        setIsAiSearching(true);

        try {
            const response = await fetch("/api/ai/enrich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: newItemName }),
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || "AI запрос не удался");
            }

            const result = data.result || {};
            const changed =
                !!result.title ||
                !!result.url ||
                !!result.price ||
                !!result.image;

            if (result.title) setNewItemName(result.title);
            if (result.url) setNewItemUrl(result.url);
            if (result.price) setNewItemPrice(result.price);
            if (result.image) setNewItemImage(result.image);

            if (changed) {
                setAiMessage("AI заполнил карточку. Проверьте и сохраните!");
            } else {
                setAiError("AI не нашёл данные. Попробуйте уточнить название.");
            }
        } catch (error) {
            console.error("AI search error", error);
            const message = error instanceof Error ? error.message : "Не удалось получить ответ AI";
            setAiError(message);
        } finally {
            setIsAiSearching(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Удалить желание?")) return;
        try {
            await deleteItem(id, wishlistSlug);
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const startEdit = (item: Item) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditUrl(item.url || "");
        setEditPrice(item.price || "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditUrl("");
        setEditPrice("");
    };

    const handleUpdateItem = async () => {
        if (!editingId) return;
        const idx = items.findIndex((i) => i.id === editingId);
        if (idx === -1) return;
        const updated = {
            ...items[idx],
            name: editName || items[idx].name,
            url: editUrl || null,
            price: editPrice || null,
        };
        try {
            await updateItem(editingId, wishlistSlug, {
                name: updated.name,
                url: updated.url,
                price: updated.price,
            });
            const next = [...items];
            next[idx] = updated;
            setItems(next);
            cancelEdit();
        } catch (error) {
            console.error("Failed to update item", error);
            alert("Не удалось обновить элемент");
        }
    };

    const handleSetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length < 4) return alert("PIN должен быть не менее 4 цифр");

        try {
            await setWishlistPin(wishlistSlug, newPin);
            setShowPinForm(false);
            alert("PIN успешно установлен!");
            // window.location.reload(); // Optional
        } catch (error) {
            console.error("Failed to set PIN", error);
            alert("Ошибка установки PIN");
        }
    };

    if (showPinForm && !isPinSet) {
        return (
            <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-red to-neon-cyan" />
                <div className="text-center mb-8">
                    <Lock size={48} className="mx-auto text-neon-cyan mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Защитите ваш список</h2>
                    <p className="text-gray-400">Установите PIN-код, чтобы только вы могли редактировать желания.</p>
                </div>

                <form onSubmit={handleSetPin} className="space-y-4">
                    <input
                        type="password"
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:border-neon-cyan focus:outline-none transition-colors"
                        placeholder="0000"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-neon-cyan/20 text-neon-cyan font-bold py-3 rounded-xl hover:bg-neon-cyan/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> СОХРАНИТЬ PIN
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Control Panel Header */}
            <div className="flex items-center justify-between mb-8 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Lock size={20} className="text-neon-cyan" /> Панель управления
                </h2>
                <div className="text-xs text-gray-500 font-mono">
                    ID: {wishlistSlug}
                </div>
            </div>

            {/* Add Item Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-red/5 to-neon-cyan/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <form onSubmit={handleAddItem} className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                    {/* Image Upload Area */}
                    <div
                        className="w-full md:w-32 h-32 bg-black/50 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-neon-cyan transition-colors relative overflow-hidden"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                        {newItemImage ? (
                            <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Plus size={24} className="text-gray-500 mb-1" />
                                <span className="text-[10px] text-gray-500 text-center px-2">Фото (Drag & Drop)</span>
                            </>
                        )}
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        {newItemImage && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setNewItemImage(null); }}
                                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-neon-red"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 w-full space-y-4 self-end">
                        <div className="w-full space-y-2">
                            <label className="text-xs text-gray-400 ml-2">Название желания</label>
                            <input
                                type="text"
                                placeholder="PlayStation 5 Pro..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs text-gray-400 ml-2">Ссылка (опц.)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:border-neon-cyan focus:outline-none transition-colors"
                                        value={newItemUrl}
                                        onChange={(e) => setNewItemUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-32 space-y-2">
                                <label className="text-xs text-gray-400 ml-2">Цена (опц.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="700$"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white text-sm focus:border-neon-cyan focus:outline-none transition-colors"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                </div>
                    </div>

                    <div className="flex gap-2 self-end w-full md:w-auto">
                        <button
                            type="button"
                            onClick={handleAiSearch}
                            disabled={isAiSearching}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-cyan/20 to-neon-green/20 text-neon-cyan font-semibold border border-neon-cyan/40 hover:border-neon-green/60 transition-colors disabled:opacity-60 w-full md:w-auto"
                        >
                            {isAiSearching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Поиск с ИИ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-neon-cyan/20 text-neon-cyan px-4 py-3 rounded-xl hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 h-[52px]"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </form>

                {(aiError || aiMessage) && (
                    <div className="mt-3 text-sm">
                        {aiError && <p className="text-neon-red">{aiError}</p>}
                        {aiMessage && <p className="text-neon-green">{aiMessage}</p>}
                    </div>
                )}
            </motion.div>

            {/* Items List */}
            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-all"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 overflow-hidden relative">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">🎁</span>
                                )}
                            </div>
                            <div className="flex-1">
                                {editingId === item.id ? (
                                    <div className="space-y-2">
                                        <input
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                                                value={editUrl}
                                                onChange={(e) => setEditUrl(e.target.value)}
                                                placeholder="https://..."
                                            />
                                            <input
                                                className="w-32 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                placeholder="Цена"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleUpdateItem}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30 transition-colors"
                                            >
                                                <Check size={16} /> Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors"
                                            >
                                                <X size={16} /> Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                            {item.price && <span className="flex items-center gap-1 text-neon-green"><DollarSign size={12} /> {item.price}</span>}
                                            {item.url && <a href={item.url} target="_blank" className="flex items-center gap-1 hover:text-neon-cyan transition-colors truncate max-w-[200px]"><LinkIcon size={12} /> Ссылка</a>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingId !== item.id && (
                                <button
                                    onClick={() => startEdit(item)}
                                    className="p-2 text-gray-500 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
                                >
                                    <Pencil size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-gray-500 hover:text-neon-red hover:bg-neon-red/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-2xl">
                        Ваш список пока пуст. Добавьте первое желание!
                    </div>
                )}
            </div>
        </div>
    );
}
