"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, Plus, Search, ArrowRight, X } from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { createWishlist, checkWishlistExists } from "@/lib/actions";

export default function LandingInteraction() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [friendId, setFriendId] = useState("");
    const [searchError, setSearchError] = useState("");

    // Create Mode State
    const [customCreateId, setCustomCreateId] = useState("");
    const [createError, setCreateError] = useState("");

    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setCreateError("");
        try {
            const result = await signInAnonymously(auth);
            const user = result.user;
            await createWishlist(user.uid, customCreateId);
            // Redirect handled by server action
        } catch (error: any) {
            console.error(error);
            setCreateError(error.message === "Slug already taken" ? "Этот ID уже занят" : "Ошибка создания");
            setIsLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!friendId.trim()) return;

        setIsLoading(true);
        setSearchError("");

        try {
            const exists = await checkWishlistExists(friendId.trim());
            if (exists) {
                router.push(`/${friendId.trim()}`);
            } else {
                setSearchError("Список не найден");
                setIsLoading(false);
            }
        } catch (e) {
            setSearchError("Ошибка поиска");
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Main Trigger Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
                <div className="absolute inset-0 border border-neon-cyan group-hover:bg-neon-cyan/10 transition-colors" />
                <div className="absolute inset-0 bg-neon-cyan/5 blur-xl group-hover:bg-neon-cyan/20 transition-colors" />
                <span className="relative font-bold text-neon-cyan text-xl flex items-center justify-center gap-2">
                    НАЧАТЬ <Snowflake size={20} />
                </span>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4"
                        >
                            <div className="bg-bg-dark border border-white/10 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-neon-white to-neon-cyan">
                                    Выберите действие
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Block 1: Create New */}
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-neon-cyan/5 transition-all duration-300 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-neon-cyan/20 rounded-full flex items-center justify-center mb-4">
                                            <Plus size={32} className="text-neon-cyan" />
                                        </div>
                                        <h3 className="text-xl font-bold text-[var(--snow-white)] mb-2">Новый Список</h3>
                                        <p className="text-[var(--snow-white)] opacity-70 text-sm mb-4">Создайте свой уникальный вишлист и поделитесь им</p>

                                        <form onSubmit={handleCreate} className="w-full relative flex flex-col gap-3">
                                            <input
                                                type="text"
                                                placeholder="придумайте-id"
                                                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-white text-center focus:outline-none focus:border-neon-cyan transition-colors font-mono placeholder:text-gray-600 text-sm"
                                                value={customCreateId}
                                                onChange={(e) => setCustomCreateId(e.target.value)}
                                            />
                                            {createError && <p className="text-neon-red text-xs">{createError}</p>}

                                            <button
                                                type="submit"
                                                className="w-full bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "ЗАГРУЗКА..." : <>СОЗДАТЬ <ArrowRight size={16} /></>}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Block 2: Join Existing */}
                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mb-4">
                                            <Search size={32} className="text-neon-green" />
                                        </div>
                                        <h3 className="text-xl font-bold text-[var(--snow-white)] mb-2">Найти по ID</h3>
                                        <p className="text-[var(--snow-white)] opacity-70 text-sm mb-4">Введите уникальный ID списка друга</p>

                                        <form onSubmit={handleJoin} className="w-full relative">
                                            <input
                                                type="text"
                                                placeholder="my-wishlist-2026"
                                                className={`w-full bg-black/50 border ${searchError ? 'border-neon-red' : 'border-white/20'} rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-neon-green transition-colors font-mono placeholder:text-gray-600`}
                                                value={friendId}
                                                onChange={(e) => { setFriendId(e.target.value); setSearchError(""); }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!friendId.trim() || isLoading}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-green hover:bg-neon-green/20 p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                        </form>
                                        {searchError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-neon-red text-xs mt-2 absolute bottom-2"
                                            >
                                                {searchError}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
