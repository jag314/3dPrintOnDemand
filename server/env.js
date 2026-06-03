// Must be the first import in any server module that reads process.env.
// Loads .env and .env.local from the project root using an explicit absolute
// path so this works regardless of the cwd when Node.js starts.
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

config({ path: resolve(root, '.env') });
config({ path: resolve(root, '.env.local'), override: false });
