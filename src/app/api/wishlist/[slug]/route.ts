import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeError(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Server error";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const ctx = await params;
        const rawSlug = (ctx as any)?.slug;
        const slugValue = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
        let slugParam = slugValue != null ? String(slugValue) : "";

        // Fallback: try to read from URL path if params are missing
        if (!slugParam && request?.url) {
            const url = new URL(request.url);
            const segments = url.pathname.split("/").filter(Boolean);
            const last = segments[segments.length - 1];
            if (last && last !== "wishlist") {
                slugParam = decodeURIComponent(last);
            }
        }

        // Fallback: query param ?slug=
        if (!slugParam) {
            const fromQuery = request.nextUrl.searchParams.get("slug");
            if (fromQuery) slugParam = fromQuery;
        }

        if (!slugParam || typeof slugParam !== "string") {
            console.warn("GET /api/wishlist/[slug] missing slug param", params);
            return NextResponse.json({ error: "slug is required" }, { status: 400 });
        }

        const slug = slugParam;
        const wishlist = await prisma.wishlist.findUnique({
            where: { slug },
            include: {
                items: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!wishlist) {
            return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
        }

        return NextResponse.json({
            slug: wishlist.slug,
            title: wishlist.title,
            isPinSet: !!wishlist.pinHash,
            items: wishlist.items.map((item) => ({
                id: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                url: item.url,
                claims: [], // claims not needed in editor payload
            })),
        });
    } catch (error) {
        console.error("GET /api/wishlist/[slug] error", error);
        return NextResponse.json({ error: normalizeError(error) }, { status: 500 });
    }
}
