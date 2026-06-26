import { RegulatoryMatter } from './types';
import { seedMatters } from './data';

declare global {
  // eslint-disable-next-line no-var
  var matterStore: Map<string, RegulatoryMatter> | undefined;
}

function getStore(): Map<string, RegulatoryMatter> {
  if (!global.matterStore) {
    global.matterStore = new Map();
    seedMatters.forEach((m) => global.matterStore!.set(m.id, m));
  }
  return global.matterStore;
}

export function getAllMatters(): RegulatoryMatter[] {
  const store = getStore();
  return Array.from(store.values()).sort((a, b) => b.riskScore - a.riskScore);
}

export function getMatterById(id: string): RegulatoryMatter | undefined {
  return getStore().get(id);
}

export function addMatter(matter: RegulatoryMatter): void {
  getStore().set(matter.id, matter);
}

export function updateMatter(id: string, updates: Partial<RegulatoryMatter>): void {
  const store = getStore();
  const existing = store.get(id);
  if (existing) store.set(id, { ...existing, ...updates });
}
