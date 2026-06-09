// Vision API for macro detection.
// TODO: replace the mock with a real image -> macros model/API call.
import type { Macros } from '../types';

// Mock: returns plausible macros so the capture → breakdown flow works
// end-to-end before the real vision model is wired in.
export async function detectMacros(_imageUri: string): Promise<Macros> {
  await new Promise((r) => setTimeout(r, 600)); // simulate inference latency
  const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  return {
    protein: rand(12, 40),
    carbs: rand(18, 55),
    fat: rand(8, 24),
  };
}
