import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
        return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
    }

    const wishlists = await prisma.wishlist.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { items: true },
            },
        },
    });

    return NextResponse.json({
        wishlists: wishlists.map((wishlist) => ({
            slug: wishlist.slug,
            title: wishlist.title,
            createdAt: wishlist.createdAt.toISOString(),
            itemsCount: wishlist._count.items,
        })),
    });
}
