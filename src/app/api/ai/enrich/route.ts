import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3-pro-preview";

const sanitizePriceToRub = (price?: string | null) => {
    if (!price) return null;
    if (/₽|руб/i.test(price)) return price.trim();

    const numeric = Number(price.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(numeric)) return `${price} ₽`;

    // Rough USD → RUB conversion fallback when the model replies in dollars
    const rubles = Math.round(numeric * 95);
    return `${rubles.toLocaleString("ru-RU")} ₽`;
};

const allowedHosts = [
    "dns-shop.ru",
    "www.dns-shop.ru",
    "www.ozon.ru",
    "ozon.ru",
    "www.wildberries.ru",
    "wildberries.ru",
    "www.1c-interes.ru",
    "www.mvideo.ru",
    "mvideo.ru",
    "www.citilink.ru",
    "citilink.ru",
    "www.onlinetrade.ru",
    "onlinetrade.ru",
    "market.yandex.ru",
];

const filterUrlByHost = (url?: string | null) => {
    if (!url) return null;
    try {
        const u = new URL(url);
        if (allowedHosts.includes(u.hostname)) {
            return url;
        }
        return null;
    } catch {
        return null;
    }
};

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const query = body?.query as string | undefined;

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ error: "Введите название желания" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY не задан. Добавьте ключ в .env" },
            { status: 500 },
        );
    }

    try {
        const prompt = [
            "Ты ассистент для вишлиста, нужен быстрый ресёрч по товару.",
            "Найди актуальное предложение на российских сайтах: DNS, ОнлайнТрейд, ОЗОН, Wildberries, Яндекс Маркет, М.Видео, Ситилинк.",
            "Дай конкретные данные: рабочий URL карточки, реальную ссылку на картинку товара, цену в рублях.",
            "Ответ строго JSON одной строкой без текста и Markdown:",
            '{\"title\":\"...\",\"image\":\"https://...\",\"url\":\"https://...\",\"price\":\"123 000 ₽\"}',
            "Требования:",
            "- title: лаконичное русское название по запросу.",
            "- image: ссылка на фото товара (jpeg/png/webp) с перечисленных площадок.",
            "- url: прямая ссылка на карточку товара на русском маркетплейсе.",
            "- price: цена только в рублях с символом ₽, без долларов.",
            "- Если точных данных нет, всё равно верни лучший вариант из перечисленных площадок.",
            `Запрос пользователя: ${query}`,
        ].join("\n");

        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                    ],
                }),
            },
        );

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("Gemini error:", errorText);
            return NextResponse.json({ error: "AI запрос не удался" }, { status: 500 });
        }

        const aiJson = await aiResponse.json();
        const parts = aiJson?.candidates?.[0]?.content?.parts || [];
        const rawText = parts.map((p: { text?: string }) => p.text).filter(Boolean).join("\n");

        let parsed: { title?: string; image?: string; url?: string; price?: string } | null = null;
        try {
            parsed = JSON.parse(rawText) as typeof parsed;
        } catch {
            // Attempt to extract JSON from possible prose
            const match = rawText.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]) as typeof parsed;
            }
        }

        if (!parsed) {
            return NextResponse.json({ error: "Не удалось распарсить ответ AI" }, { status: 500 });
        }

        const price = sanitizePriceToRub(parsed?.price);
        const safeUrl = filterUrlByHost(parsed?.url);
        const safeImage = filterUrlByHost(parsed?.image) || parsed?.image || null;

        return NextResponse.json({
            result: {
                title: parsed?.title || query,
                image: safeImage,
                url: safeUrl,
                price,
            },
        });
    } catch (error) {
        console.error("AI enrich error:", error);
        return NextResponse.json({ error: "Ошибка AI" }, { status: 500 });
    }
}
