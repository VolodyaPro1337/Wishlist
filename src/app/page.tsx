"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import LandingInteraction from "@/components/LandingInteraction";
import Snowfall from "@/components/Snowfall";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-bg-dark">
            {/* Background Effects */}
            {/* Background Effects */}
            <Snowfall />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-20 text-center px-4 relative"
            >
                <div className="mb-6 inline-block">
                    <Gift size={64} className="text-neon-red mx-auto drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[var(--snow-white)] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    НОВОГОДНИЙ ВИШЛИСТ
                </h1>
                <p className="text-xl md:text-2xl text-[var(--snow-white)] opacity-80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                    Создай свой список желаний и поделись магией
                </p>
                <div className="flex justify-center">
                    <LandingInteraction />
                </div>
            </motion.div>
        </div>
    );
}
