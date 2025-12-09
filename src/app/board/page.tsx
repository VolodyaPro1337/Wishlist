"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Gift, Sparkles, ArrowRight, Clock, ListChecks } from "lucide-react";
import CreateWishlistModal from "@/components/CreateWishlistModal";

interface WishlistCard {
    slug: string;
    title: string;
    createdAt: string;
    itemsCount: number;
}

export default function Board() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [wishlists, setWishlists] = useState<WishlistCard[]>([]);
    const [isLoadingLists, setIsLoadingLists] = useState(true);
    const [listsError, setListsError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const loadWishlists = async () => {
            if (!user) return;
            setIsLoadingLists(true);
            setListsError("");
            try {
                const response = await fetch(`/api/wishlists?ownerId=${user.uid}`);
                if (!response.ok) throw new Error("failed");
                const data = await response.json();
                setWishlists(data.wishlists || []);
            } catch (error) {
                console.error("Failed to fetch wishlists", error);
                setListsError("Не удалось загрузить ваши списки");
            } finally {
                setIsLoadingLists(false);
            }
        };

        loadWishlists();
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-bg-dark text-white p-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none" />

            <CreateWishlistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user.uid}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto relative z-10"
            >
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-green flex items-center gap-3">
                            <Gift className="text-neon-cyan" /> Мои Списки
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            ID: <span className="font-mono text-neon-cyan opacity-80">{user.uid.slice(0, 5)}...</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-neon-red to-pink-600 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} /> СОЗДАТЬ СПИСОК
                    </button>
                </div>

                {listsError && (
                    <div className="mb-6 text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-xl px-4 py-3">
                        {listsError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingLists &&
                        Array.from({ length: 3 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="border border-white/5 rounded-2xl p-6 bg-white/5 animate-pulse h-48"
                            />
                        ))}

                    {!isLoadingLists && wishlists.map((wishlist) => (
                        <motion.div
                            key={wishlist.slug}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ translateY: -4 }}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black/40 to-black/60 p-6 backdrop-blur-md cursor-pointer group"
                            onClick={() => router.push(`/${wishlist.slug}/edit`)}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-neon-cyan/10 to-neon-green/10" />
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide">
                                    <ListChecks size={14} className="text-neon-cyan" />
                                    {wishlist.itemsCount} желаний
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-neon-cyan transition-colors">
                                    {wishlist.title}
                                </h3>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    <Clock size={14} />
                                    {new Date(wishlist.createdAt).toLocaleDateString("ru-RU", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </p>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-xs text-gray-500 font-mono">/{wishlist.slug}</div>
                                    <div className="flex items-center gap-1 text-neon-cyan text-sm font-semibold">
                                        Управлять <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {!isLoadingLists && wishlists.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-neon-cyan/30 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-black/40 backdrop-blur-sm min-h-[300px] group hover:border-neon-cyan/60 transition-colors">
                            <div className="bg-neon-cyan/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles size={48} className="text-neon-cyan" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Здесь пока пусто</h3>
                            <p className="text-gray-400 mb-8 max-w-md">Ваши списки желаний будут отображаться здесь. Создайте свой первый список и поделитесь магией!</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-neon-cyan hover:text-white transition-colors underline underline-offset-4 decoration-neon-cyan font-bold">
                                Создать первый вишлист →
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
