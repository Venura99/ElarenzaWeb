"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Payzy's logo, falling back to its wordmark in brand colours if the asset
 * hasn't been added to public/images yet, so checkout never shows a broken
 * image.
 */
export default function PayzyMark({ height = 20 }: { height?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-base font-bold leading-none tracking-tight text-[#29ABE2]">
        Pay<span className="text-[#333F48]">Zy</span>
      </span>
    );
  }

  return (
    <Image
      src="/images/payzy-logo.png"
      alt="Payzy"
      width={height * 3}
      height={height}
      className="h-5 w-auto"
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
