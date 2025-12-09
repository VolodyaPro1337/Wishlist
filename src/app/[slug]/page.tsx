import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gift, ExternalLink, DollarSign } from "lucide-react";
import Snowfall from "@/components/Snowfall";
import ClaimButton from "@/components/ClaimButton";

// Force dynamic behavior so it always fetches fresh data directly from DB
export const dynamic = 'force-dynamic';

export default async function WishlistPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const wishlist = await prisma.wishlist.findUnique({
        where: { slug },
        include: {
            items: {
                include: { claims: true },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!wishlist) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-bg-dark text-white relative flex flex-col">
            <Snowfall />

            <header className="py-8 px-4 text-center relative z-10">
                <div className="inline-block relative">
                    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neon-cyan to-white select-none pb-2">
                        {wishlist.title}
                    </h1>
                    <div className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 relative z-10 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.items.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 flex flex-col"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                                        🎁
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            className="bg-neon-cyan text-black text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1 hover:bg-white transition-colors ml-auto"
                                        >
                                            <ExternalLink size={12} /> Купить
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5 flex-1 flex flex-col gap-3">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-neon-cyan transition-colors">{item.name}</h3>
                                {item.price && (
                                    <p className="text-neon-green font-mono text-sm flex items-center gap-1">
                                        <DollarSign size={14} /> {item.price}
                                    </p>
                                )}
                                <div className="mt-auto flex items-center justify-start gap-3">
                                    <ClaimButton itemId={item.id} initialClaims={item.claims.map((c) => c.userId)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {wishlist.items.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <Gift size={48} className="mx-auto mb-4 opacity-30" />
                        <p>В этом списке пока пусто...</p>
                    </div>
                )}
            </main>

            <footer className="py-8 text-center text-gray-600 text-sm relative z-10">
                <Link href="/" className="hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5">
                    Создать свой список
                </Link>
            </footer>
        </div>
    );
}
