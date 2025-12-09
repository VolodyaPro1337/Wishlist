"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SnowflakeData {
    id: number;
    x: number;
    y: number;
    opacity: number;
    duration: number;
    delay: number;
}

export default function Snowfall() {
    const [snowflakes, setSnowflakes] = useState<SnowflakeData[]>([]);

    useEffect(() => {
        const flakes = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10,
            opacity: Math.random(),
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
        }));
        setSnowflakes(flakes);
    }, []);

    if (snowflakes.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {snowflakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    className="snowflake w-1 h-1 md:w-2 md:h-2"
                    initial={{ x: `${flake.x}vw`, y: flake.y, opacity: flake.opacity }}
                    animate={{ y: "100vh" }}
                    transition={{
                        duration: flake.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: flake.delay,
                    }}
                />
            ))}
        </div>
    );
}
