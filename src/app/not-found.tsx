"use client";

import Link from "next/link";
import Snowfall from "@/components/Snowfall";
import { Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Snowfall />

            <div className="text-center relative z-10 max-w-md w-full">
                <div className="text-[120px] font-bold text-white leading-none opacity-20 select-none">
                    404
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-neon-red mb-4 -mt-8 relative z-20">
                    Список не найден
                </h2>

                <p className="text-gray-400 mb-8">
                    Кажется, такого списка желаний не существует. Проверьте адрес или создайте новый!
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-neon-cyan/50 text-white px-8 py-3 rounded-full transition-all group"
                >
                    <Search size={18} className="group-hover:text-neon-cyan transition-colors" />
                    <span>Вернуться на главную</span>
                </Link>
            </div>

            {/* Decorative gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-neon-red/10 to-neon-cyan/10 blur-[100px] -z-10" />
        </div>
    );
}
