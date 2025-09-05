const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
import { deepseek } from '@ai-sdk/deepseek';

type Provider = 'hf' | 'hf_local' | 'deepseek';
const PROVIDER = (process.env.EMBEDDING_PROVIDER as Provider) || 'deepseek';

console.log('EMBEDDING_PROVIDER (global):', PROVIDER);

const HF_URL = process.env.HF_INFERENCE_API_URL; // e.g., https://.../embeddings or http://localhost:8501/embed
const HF_TOKEN = process.env.HF_API_TOKEN;       // optional (hosted)
const DEEPSEEK_MODEL = process.env.DEEPSEEK_EMBED_MODEL || 'deepseek-embedding'; // DeepSeek embedding model

const BATCH_SIZE = Number(process.env.RAG_BATCH_SIZE || 64);
const MAX_RETRIES = 3;

async function embedDeepSeek(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    let lastErr: any;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await deepseek.embed({
          model: DEEPSEEK_MODEL,
          input: batch,
        });
        out.push(...res.embeddings);
        break;
      } catch (e: any) {
        lastErr = e;
        await delay(300 * (attempt + 1));
      }
    }
    if (out.length < Math.min(texts.length, i + BATCH_SIZE) && lastErr) {
      throw new Error(`DeepSeek embedding failed: ${lastErr?.message || lastErr}`);
    }
  }
  return out;
}

async function embedHF(texts: string[]): Promise<number[][]> {
  if (!HF_URL) throw new Error('HF_INFERENCE_API_URL is not set');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (HF_TOKEN) headers['Authorization'] = `Bearer ${HF_TOKEN}`;

  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    let lastErr: any;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const resp = await fetch(HF_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ inputs: batch }),
        });
        if (!resp.ok) {
          const body = await resp.text();
          throw new Error(`HF server error ${resp.status}: ${body}`);
        }
        const json = await resp.json() as { embeddings: number[][] } | number[][];
        // Accept both {embeddings:[...]} and bare [[...], ...]
        const embs = Array.isArray(json) ? (json as number[][]) : (json as any).embeddings;
        if (!Array.isArray(embs) || !Array.isArray(embs[0])) {
          throw new Error('HF response shape invalid. Expected embeddings: number[][]');
        }
        out.push(...embs);
        break;
      } catch (e: any) {
        lastErr = e;
        await delay(300 * (attempt + 1));
      }
    }
    if (out.length < Math.min(texts.length, i + BATCH_SIZE) && lastErr) {
      throw new Error(`HF embedding failed: ${lastErr?.message || lastErr}`);
    }
  }
  return out;
}

export async function embed(texts: string[]): Promise<number[][]> {
  console.log('EMBEDDING_PROVIDER (inside embed function):', PROVIDER);
  if (!texts?.length) return [];
  if (PROVIDER === 'hf' || PROVIDER === 'hf_local') return embedHF(texts);
  return embedDeepSeek(texts);
}

