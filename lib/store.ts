import { RegulatoryMatter } from './types';
import { seedMatters } from './data';

declare global {
  var matterStore: Map<string, RegulatoryMatter> | undefined;
}

function getStore(): Map<string, RegulatoryMatter> {
  if (!global.matterStore) {
    global.matterStore = new Map();
    for (const matter of seedMatters) {
      global.matterStore.set(matter.id, matter);
    }
  }
  return global.matterStore;
}

async function useKV(): Promise<boolean> {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function getAllMatters(): Promise<RegulatoryMatter[]> {
  if (await useKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      const keys = await kv.keys('matter:*');
      if (keys.length === 0) {
        for (const matter of seedMatters) {
          await kv.set(`matter:${matter.id}`, matter);
        }
        return seedMatters;
      }
      const matters = await Promise.all(keys.map(k => kv.get<RegulatoryMatter>(k)));
      return matters.filter(Boolean) as RegulatoryMatter[];
    } catch (e) {
      console.error('KV error, falling back to memory', e);
    }
  }
  return Array.from(getStore().values());
}

export async function getMatterById(id: string): Promise<RegulatoryMatter | null> {
  if (await useKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      return await kv.get<RegulatoryMatter>(`matter:${id}`);
    } catch (e) {
      console.error('KV error', e);
    }
  }
  return getStore().get(id) ?? null;
}

export async function addMatter(matter: RegulatoryMatter): Promise<void> {
  if (await useKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`matter:${matter.id}`, matter);
      return;
    } catch (e) {
      console.error('KV error', e);
    }
  }
  getStore().set(matter.id, matter);
}

export async function updateMatter(id: string, updates: Partial<RegulatoryMatter>): Promise<RegulatoryMatter | null> {
  const existing = await getMatterById(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
  await addMatter(updated);
  return updated;
}
