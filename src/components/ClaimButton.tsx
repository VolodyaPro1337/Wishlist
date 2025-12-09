"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";

interface Props {
    itemId: string;
    initialClaims: string[];
}

const LOCAL_STORAGE_KEY = "wishlist-anon-id";

export default function ClaimButton({ itemId, initialClaims }: Props) {
    const [userId, setUserId] = useState<string>("");
    const [claims, setClaims] = useState<string[]>(initialClaims);
    const [loading, setLoading] = useState(false);
    const isClaimedByMe = claims.includes(userId);
    const isClaimed = claims.length > 0 && !isClaimedByMe;

    useEffect(() => {
        const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (existing) {
            setUserId(existing);
        } else {
            const generated = nanoid(12);
            localStorage.setItem(LOCAL_STORAGE_KEY, generated);
            setUserId(generated);
        }
    }, []);

    const toggleClaim = async () => {
        if (!userId) return;
        setLoading(true);
        const action = isClaimedByMe ? "unclaim" : "claim";

        try {
            const response = await fetch(`/api/items/${itemId}/claim`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, userId }),
            });
            let data: any = null;
            try {
                // Attempt to parse JSON if present
                if (response.headers.get("content-type")?.includes("application/json")) {
                    data = await response.json();
                }
            } catch {
                data = null;
            }

            if (!response.ok || data?.error) {
                let message = data?.error;
                if (!message) {
                    try {
                        message = await response.text();
                    } catch {
                        // ignore
                    }
                }
                if (!message) message = "Не удалось обновить бронь";
                throw new Error(message);
            }

            setClaims(data?.claims || []);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleClaim}
            disabled={loading || isClaimed}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full transition-colors ${
                isClaimedByMe
                    ? "bg-neon-green text-black hover:bg-white"
                    : isClaimed
                        ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                        : "bg-neon-cyan text-black hover:bg-white"
            }`}
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : isClaimedByMe ? (
                <Unlock size={14} />
            ) : (
                <Lock size={14} />
            )}
            {isClaimedByMe ? "Бронь ваша" : isClaimed ? "Уже забрали" : "Забрать"}
        </button>
    );
}
