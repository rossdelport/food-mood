// Subscription / "Plus" entitlement. STUBBED for now so the whole paywall is
// testable in Expo Go — purchasePlan() just flips the local flag. At dev-build
// time, swap the three marked functions for RevenueCat (react-native-purchases).
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'foodmood:pro';

let isPro = false;
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export async function hydrateSubscription() {
  try {
    // ── RevenueCat: read Purchases.getCustomerInfo() entitlement here ──
    isPro = (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    // signed-out fallback
  } finally {
    hydrated = true;
    emit();
  }
}

export function usePro(): boolean {
  return useSyncExternalStore(subscribe, () => isPro);
}
export function useSubHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => hydrated);
}
export function getPro(): boolean {
  return isPro;
}

export type Plan = 'yearly' | 'lifetime';

// ── RevenueCat: Purchases.purchasePackage(pkg) → set isPro from entitlement ──
export async function purchasePlan(_plan: Plan): Promise<string | null> {
  isPro = true;
  await AsyncStorage.setItem(KEY, '1').catch(() => {});
  emit();
  return null; // return an error message on failure
}

// ── RevenueCat: Purchases.restorePurchases() → check entitlement ──
export async function restorePurchases(): Promise<boolean> {
  return isPro;
}

export async function resetSubscription() {
  isPro = false;
  await AsyncStorage.removeItem(KEY).catch(() => {});
  emit();
}
