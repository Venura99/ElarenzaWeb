"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const dims = size === "lg" ? 88 : size === "sm" ? 40 : 56;

  return (
    <Link href="/" className="flex items-center gap-3 select-none">
      {!imageFailed ? (
        <Image
          src="/images/logo.png"
          alt={BUSINESS.name}
          width={dims}
          height={dims}
          className="rounded-full object-contain"
          onError={() => setImageFailed(true)}
          priority
        />
      ) : (
        <span
          className="flex items-center justify-center rounded-full border-2 border-gold text-gold font-serif"
          style={{ width: dims, height: dims, fontSize: dims * 0.42 }}
        >
          E
        </span>
      )}
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-serif text-xl tracking-wide text-ink sm:text-2xl">
          {BUSINESS.name.toUpperCase()}
        </span>
        <span className="hidden text-[10px] tracking-[0.25em] text-gold-dark uppercase sm:block">
          {BUSINESS.tagline}
        </span>
      </span>
    </Link>
  );
}
