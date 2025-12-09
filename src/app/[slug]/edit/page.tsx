"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { verifyWishlistPin } from "@/lib/actions";
import WishlistEditor from "@/components/WishlistEditor";
import Snowfall from "@/components/Snowfall";

export default function EditWishlistPage() {
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);

    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"LOADING" | "LOCKED" | "SETUP" | "AUTHORIZED">("LOADING");
    const [wishlistData, setWishlistData] = useState<{ items: any[]; isPinSet?: boolean } | null>(null);

    const loadWishlist = useCallback(async () => {
        if (!slug) {
            throw new Error("Неизвестный список");
        }

        const response = await fetch(`/api/wishlist/${slug}`);
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            const message = data?.error || "Не удалось загрузить список";
            throw new Error(message);
        }
        setWishlistData(data);
        return data;
    }, [slug]);

    const checkAuthStatus = useCallback(async () => {
        try {
            if (!slug) throw new Error("Неизвестный список");

            const data = await loadWishlist();
            const pinSet = data?.isPinSet;

            if (pinSet) {
                setStatus("LOCKED");
            } else {
                setStatus("AUTHORIZED");
            }
        } catch (err) {
            console.error(err);
            setStatus("LOCKED");
            setError("Список не найден или доступ ограничен");
        }
    }, [loadWishlist, slug]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const isValid = await verifyWishlistPin(slug, pin);
            if (isValid === true) {
                setStatus("AUTHORIZED");
                await loadWishlist();
            } else {
                setError("Неверный PIN код");
            }
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить список");
        }
    };

    if (status === "LOADING") {
        return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-neon-cyan">Загрузка...</div>;
    }

    if (status === "LOCKED") {
        return (
            <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <Snowfall />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl max-w-sm w-full text-center relative z-10"
                >
                    <div className="w-20 h-20 bg-neon-red/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-red/20 shadow-[0_0_30px_rgba(255,0,51,0.2)]">
                        <Lock size={40} className="text-neon-red" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Доступ ограничен</h1>
                    <p className="text-gray-400 mb-8 text-sm">Этот список защищен PIN-кодом. Введите его для редактирования.</p>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="****"
                            className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] text-white focus:outline-none focus:border-neon-red transition-all placeholder:tracking-normal"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-neon-red text-sm animate-pulse">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-neon-red hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            <Unlock size={20} className="group-hover:rotate-12 transition-transform" />
                            ОТКРЫТЬ
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark p-4 md:p-8 relative">
            <Snowfall />
            <div className="max-w-6xl mx-auto relative z-10 pt-8">
                <WishlistEditor
                    initialItems={wishlistData?.items || []}
                    wishlistSlug={slug}
                    isPinSet={!!wishlistData?.isPinSet}
                />
            </div>
        </div>
    );
}
