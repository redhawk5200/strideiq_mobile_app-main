import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboarding:progress"; // stores { sessionId, step, total, updatedAt }

export type Progress = { sessionId: string; step: number; total: number; updatedAt: number };

export async function loadProgress(): Promise<Progress | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProgress(p: Progress) {
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
}