/**
 * Sparkline — Canvas-based mini chart
 */
import React, { useRef, useEffect } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
}

export function Sparkline({ data, width = 80, height = 36, positive, strokeWidth = 1.5 }: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 3;

    // Determine color
    const isPositive = positive !== undefined ? positive : data[data.length - 1] >= data[0];
    const color = isPositive ? '#26A69A' : '#EF5350';

    // Build path
    const getX = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
    const getY = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2);

    // Fill gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isPositive ? 'rgba(38,166,154,0.18)' : 'rgba(239,83,80,0.18)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    data.forEach((v, i) => {
      if (i === 0) return;
      ctx.lineTo(getX(i), getY(v));
    });
    ctx.lineTo(getX(data.length - 1), height);
    ctx.lineTo(getX(0), height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(data[0]));
    data.forEach((v, i) => {
      if (i === 0) return;
      ctx.lineTo(getX(i), getY(v));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [data, width, height, positive, strokeWidth]);

  if (data.length < 2) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px`, display: 'block' }}
    />
  );
}

// Generate plausible sparkline data from current price + change
export function generateSparkline(currentPrice: number, changePct: number, points = 20): number[] {
  const result: number[] = [];
  const prev = currentPrice - (currentPrice * changePct / 100);
  const step = (currentPrice - prev) / (points - 1);
  let price = prev;
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * currentPrice * 0.003;
    price = prev + step * i + noise;
    result.push(Math.max(0, price));
  }
  result[result.length - 1] = currentPrice;
  return result;
}
