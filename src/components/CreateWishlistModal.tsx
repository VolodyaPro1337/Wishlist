"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { createWishlist } from "@/lib/actions";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function CreateWishlistModal({ isOpen, onClose, userId }: Props) {
    const [customSlug, setCustomSlug] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await createWishlist(userId, customSlug);
            // Redirect happens in server action
        } catch (err: any) {
            console.error(err);
            if (err.message === "Slug already taken" || err.message.includes("Slug already taken")) {
                setError("Этот ID уже занят, попробуйте другой");
            } else {
                setError("Ошибка при создании. Попробуйте снова.");
            }
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6"
                    >
                        <div className="relative bg-bg-dark border border-neon-cyan/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,243,255,0.1)] overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-red/10 rounded-full blur-2xl" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-neon-white to-neon-cyan">
                                <Sparkles size={24} className="text-neon-cyan" />
                                Создание Списка
                            </h2>
                            <p className="text-gray-400 mb-6 text-sm">
                                Придумайте уникальный ID для вашей ссылки или оставьте пустым для автогенерации.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-wider">
                                        Уникальный ID (Опционально)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={customSlug}
                                            onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                                            placeholder="my-wishlist-2026"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors placeholder:text-gray-600 font-mono"
                                        />
                                    </div>
                                    {error && <p className="text-neon-red text-xs mt-2">{error}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-bold py-3 rounded-xl hover:bg-neon-cyan/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? "Магия..." : <>Создать <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
