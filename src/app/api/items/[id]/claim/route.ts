import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const ctx = await params;
        const rawId = (ctx as any)?.id;
        let itemId = Array.isArray(rawId) ? rawId[0] : rawId;

        // Fallback: pull from path if params missing
        if (!itemId && request?.url) {
            const url = new URL(request.url);
            const segments = url.pathname.split("/").filter(Boolean);
            const maybeId = segments[segments.length - 2]; // .../items/:id/claim
            if (maybeId && maybeId !== "claim") itemId = maybeId;
        }

        if (!itemId) {
            return NextResponse.json({ error: "itemId is required" }, { status: 400 });
        }

        const body = await request.json().catch(() => null);
        const action = body?.action as "claim" | "unclaim" | undefined;
        const userId = body?.userId as string | undefined;

        if (!action || !userId) {
            return NextResponse.json({ error: "action and userId required" }, { status: 400 });
        }

        const item = await prisma.item.findUnique({
            where: { id: itemId },
            include: { claims: true, wishlist: true },
        });

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (action === "claim") {
            // If already claimed by someone else, block
            const existingClaim = item.claims[0];
            if (existingClaim && existingClaim.userId !== userId) {
                return NextResponse.json({ error: "Этот подарок уже забрали" }, { status: 409 });
            }

            await prisma.claim.deleteMany({ where: { itemId: item.id } });
            await prisma.claim.create({ data: { itemId: item.id, userId } });
        } else if (action === "unclaim") {
            await prisma.claim.deleteMany({
                where: { itemId: item.id, userId },
            });
        }

        const updated = await prisma.item.findUnique({
            where: { id: itemId },
            include: { claims: true },
        });

        return NextResponse.json({
            claims: updated?.claims.map((c) => c.userId) || [],
        });
    } catch (error) {
        console.error("POST /api/items/[id]/claim error", error);
        const message = error instanceof Error ? error.message : "Server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
