"use server";

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createWishlist(userId: string, customSlug?: string) {
    const slug = customSlug && customSlug.trim().length > 0 ? customSlug : nanoid(10);

    // Create a new wishlist with default title and 4-digit numeric salt for future PIN hashing
    try {
        const wishlist = await prisma.wishlist.create({
            data: {
                slug,
                title: "Мой список желаний",
                ownerId: userId,
                salt: nanoid(16), // Random salt for security
            },
        });

        if (!wishlist) {
            throw new Error("Failed to create wishlist");
        }

        redirect(`/${slug}/edit`);

    } catch (e: any) {
        if (e.code === 'P2002') {
            throw new Error("Slug already taken");
        }
        throw e;
    }
}

export async function checkWishlistExists(slug: string) {
    const wishlist = await prisma.wishlist.findUnique({
        where: { slug },
        select: { id: true }
    });
    return !!wishlist;
}

export async function setWishlistPin(slug: string, pin: string) {
    // In a real app, use bcrypt. Here we'll use simple hashing with the salt.
    const wishlist = await prisma.wishlist.findUnique({ where: { slug } });
    if (!wishlist) throw new Error("Wishlist not found");

    const salt = wishlist.salt;
    // Simple hash for demo purposes: salt + pin (reversed)
    // In production, use crypto.pbkdf2 or bcrypt
    const pinHash = salt + pin.split('').reverse().join('');

    await prisma.wishlist.update({
        where: { slug },
        data: { pinHash }
    });
    return true;
}

export async function verifyWishlistPin(slug: string, pin: string) {
    const wishlist = await prisma.wishlist.findUnique({ where: { slug } });
    if (!wishlist) return false;

    // If no PIN is set, allow access (or handle as "needs setup")
    if (!wishlist.pinHash) return "NOT_SET";

    const salt = wishlist.salt;
    const computedHash = salt + pin.split('').reverse().join('');

    return computedHash === wishlist.pinHash;
}

export async function addItem(slug: string, itemData: { name: string; url?: string; price?: string; image?: string }) {
    const wishlist = await prisma.wishlist.findUnique({ where: { slug } });
    if (!wishlist) throw new Error("Wishlist not found");

    const newItem = await prisma.item.create({
        data: {
            wishlistId: wishlist.id,
            name: itemData.name,
            url: itemData.url,
            price: itemData.price,
            image: itemData.image,
        }
    });

    revalidatePath(`/${slug}`);
    return newItem;
}

export async function deleteItem(itemId: string, slug: string) {
    await prisma.item.delete({ where: { id: itemId } });
    revalidatePath(`/${slug}`);
}

export async function updateItem(itemId: string, slug: string, data: { name?: string; url?: string | null; price?: string | null; image?: string | null }) {
    await prisma.item.update({
        where: { id: itemId },
        data: {
            name: data.name,
            url: data.url,
            price: data.price,
            image: data.image,
        },
    });
    revalidatePath(`/${slug}`);
}

export async function getWishlist(slug: string) {
    const wishlist = await prisma.wishlist.findUnique({
        where: { slug },
        include: { items: true }
    });
    return wishlist;
}
