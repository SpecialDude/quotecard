import { get, set, del, keys } from 'idb-keyval';
import { QuoteDraft } from '../types';

const STORE_KEY_PREFIX = 'quotecard_draft_';

export async function saveDraft(draft: QuoteDraft): Promise<void> {
  await set(`${STORE_KEY_PREFIX}${draft.id}`, draft);
}

export async function getDraft(id: string): Promise<QuoteDraft | undefined> {
  return await get(`${STORE_KEY_PREFIX}${id}`);
}

export async function deleteDraft(id: string): Promise<void> {
  await del(`${STORE_KEY_PREFIX}${id}`);
}

export async function getAllDrafts(): Promise<QuoteDraft[]> {
  const allKeys = await keys();
  const draftKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(STORE_KEY_PREFIX));
  const drafts = await Promise.all(draftKeys.map(k => get(k) as Promise<QuoteDraft>));
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
}
