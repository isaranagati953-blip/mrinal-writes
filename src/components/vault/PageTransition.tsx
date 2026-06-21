"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [visible, setVisible] = useState(true);
    const prevPath = useRef(pathname);

    useEffect(() => {
        if (prevPath.current !== pathname) {
            // Briefly hide, then fade in new content
            setVisible(false);
            const t = setTimeout(() => {
                setVisible(true);
                prevPath.current = pathname;
            }, 40);
            return () => clearTimeout(t);
        }
    }, [pathname]);

    return (
        <div
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(5px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                willChange: "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}