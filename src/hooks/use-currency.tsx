import { useState, useEffect } from "react";

type CurrencyInfo = {
  symbol: string;
  rate: number;
  convert: (ghcPrice: number) => number;
  format: (ghcPrice: number) => string;
};

const CURRENCY_MAP: Record<string, { symbol: string; rate: number }> = {
  GH: { symbol: "₵", rate: 1 },
  NG: { symbol: "₦", rate: 100 },
  US: { symbol: "$", rate: 0.067 },
  GB: { symbol: "£", rate: 0.053 },
  KE: { symbol: "KSh", rate: 8.7 },
};

const DEFAULT: { symbol: string; rate: number } = { symbol: "$", rate: 0.067 };

const SESSION_KEY = "mbshop_currency";

export function useCurrency(): CurrencyInfo {
  const [info, setInfo] = useState<{ symbol: string; rate: number }>(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT;
  });

  useEffect(() => {
    // Already cached in sessionStorage — no need to re-fetch
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const detect = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const country: string = data?.country_code || "";
        const match = CURRENCY_MAP[country] ?? DEFAULT;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(match));
        setInfo(match);
      } catch {
        // Fall back to default on any error
        setInfo(DEFAULT);
      }
    };

    detect();
  }, []);

  const convert = (ghcPrice: number) =>
    parseFloat((ghcPrice * info.rate).toFixed(2));

  const format = (ghcPrice: number) => {
    const converted = convert(ghcPrice);
    return `${info.symbol}${converted.toFixed(2)}`;
  };

  return { symbol: info.symbol, rate: info.rate, convert, format };
}
