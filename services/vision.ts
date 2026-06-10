// Vision: send a meal photo to the analyze-meal Edge Function (Claude vision)
// and get back estimated macros + calories.
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';
import type { DetectedMeal } from '../types';

// Resize + JPEG-encode to base64 to keep the request small and within limits.
async function encodeImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 768 } }], {
    compress: 0.6,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return result.base64 ?? '';
}

export async function detectMacros(imageUri: string): Promise<DetectedMeal> {
  const imageBase64 = await encodeImage(imageUri);
  const { data, error } = await supabase.functions.invoke('analyze-meal', {
    body: { imageBase64, mimeType: 'image/jpeg' },
  });
  if (error) throw new Error(error.message);
  if (!data || typeof data.protein !== 'number') {
    throw new Error(data?.error ? String(data.error) : 'Could not read this meal');
  }
  return data as DetectedMeal;
}
