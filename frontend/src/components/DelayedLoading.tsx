"use client";

import { useEffect, useState } from "react";

export default function DelayedLoading({
  children,
  delay = 300,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) {
    return null;
  }

  return <>{children}</>;
}
