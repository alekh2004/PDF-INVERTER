"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
    className?: string;
    style?: React.CSSProperties;
    dataAdSlot: string;
    dataAdFormat?: "auto" | "fluid" | "rectangle";
    dataFullWidthResponsive?: boolean;
}

export const AdUnit = ({
    className,
    style,
    dataAdSlot,
    dataAdFormat = "auto",
    dataFullWidthResponsive = true
}: AdUnitProps) => {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;

        try {
            // @ts-ignore
            if (window.adsbygoogle) {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                initialized.current = true;
            }
        } catch (e) {
            console.error("AdSense Error", e);
        }
    }, []);

    return (
        <div className={`overflow-hidden rounded-xl bg-white/5 border border-white/10 ${className}`} style={style}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider text-center py-1">Advertisement</div>
            <ins
                className="adsbygoogle"
                style={{ display: "block", minHeight: "100px" }}
                data-ad-client="ca-pub-8824779015703781" // My Real ID
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
            />
        </div>
    );
};
