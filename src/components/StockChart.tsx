"use client";

import { useEffect, useRef } from "react";

/**
 * Live AAPL candlestick + volume chart (Highcharts Stock, demo dataset),
 * restyled to the site's palette. Minimal chrome: no tooltip, no
 * navigator, no range selector — candles, volume and the axes only.
 */

const UP = "#26c463";
const DOWN = "#ff6e6e";
const SUB = "#706e68";

export default function StockChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any;

    (async () => {
      const Highcharts = (await import("highcharts/highstock"))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .default as any;
      /* live feed with a bundled snapshot as fallback, so the card never
         renders empty if the demo endpoint is unreachable */
      const data = await fetch(
        "https://demo-live-data.highcharts.com/aapl-ohlcv.json",
        { signal: AbortSignal.timeout(6000) },
      )
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .catch(() => fetch("/data/aapl-fallback.json").then((r) => r.json()))
        .catch(() => null);
      if (cancelled || !ref.current || !data) return;

      const ohlc = [];
      const volume = [];
      for (let i = 0; i < data.length; i += 1) {
        ohlc.push([data[i][0], data[i][1], data[i][2], data[i][3], data[i][4]]);
        volume.push([data[i][0], data[i][5]]);
      }

      chart = Highcharts.stockChart(ref.current, {
        accessibility: { enabled: false },
        lang: {
          accessibility: { defaultChartTitle: "AAPL Stock Price" },
        },
        chart: {
          backgroundColor: "transparent",
          style: { fontFamily: "inherit" },
          spacingBottom: 10,
        },
        credits: { enabled: false },
        xAxis: {
          crosshair: { enabled: true, color: "rgba(10,10,10,0.25)" },
          labels: { style: { color: SUB, fontSize: "11px" } },
          lineColor: "rgba(10,10,10,0.15)",
          tickColor: "rgba(10,10,10,0.15)",
        },
        yAxis: [
          {
            title: { text: "price (USD)", style: { color: SUB } },
            crosshair: {
              snap: false,
              enabled: true,
              color: "rgba(10,10,10,0.25)",
              label: { enabled: false },
            },
            labels: { align: "left", style: { color: SUB, fontSize: "11px" } },
            height: "70%",
            gridLineColor: "rgba(10,10,10,0.07)",
          },
          {
            title: { text: "volume", style: { color: SUB } },
            crosshair: {
              snap: false,
              enabled: true,
              color: "rgba(10,10,10,0.25)",
              label: { enabled: false },
            },
            labels: { align: "left", style: { color: SUB, fontSize: "11px" } },
            top: "70%",
            height: "30%",
            offset: 0,
            gridLineColor: "rgba(10,10,10,0.07)",
          },
        ],
        tooltip: { enabled: false },
        series: [
          {
            type: "candlestick",
            id: "aapl-ohlc",
            name: "AAPL Stock Price",
            color: DOWN,
            lineColor: DOWN,
            upColor: UP,
            upLineColor: UP,
            lastPrice: { enabled: false },
            data: ohlc,
          },
          {
            type: "column",
            id: "aapl-volume",
            name: "AAPL Volume",
            color: "rgba(10,10,10,0.25)",
            lastPrice: { enabled: false },
            data: volume,
            yAxis: 1,
          },
        ],
        rangeSelector: { enabled: false },
        navigator: { enabled: false },
        scrollbar: { enabled: false },
      });
    })();

    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, []);

  return <div ref={ref} style={{ height: 360 }} />;
}
