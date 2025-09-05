import fs from 'node:fs';
import path from 'node:path';

const DOC_DIRS = ['docs', 'README.md'].map(p => path.resolve(process.cwd(), p));

export function loadDocs(): Array<{id:string; path:string; content:string}> {
  const out: Array<{id:string; path:string; content:string}> = [];
  const pushFile = (p: string) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      for (const f of fs.readdirSync(p)) pushFile(path.join(p, f));
    } else if (/\.(md|mdx|txt)$/i.test(p)) {
      out.push({ id: p, path: p, content: fs.readFileSync(p, 'utf8') });
    }
  };
  for (const p of DOC_DIRS) if (fs.existsSync(p)) pushFile(p);
  return out;
}

