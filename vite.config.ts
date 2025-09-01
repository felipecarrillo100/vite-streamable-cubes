import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from "fs";

const hexLoader = {
  name: 'hex-loader',
  // @ts-ignore
  transform(code: any, id: string) {
    const [path, query] = id.split('?');
    if (query != 'raw-txt')
      return null;

    const data = fs.readFileSync(path,'utf-8');
    return `export default \`${data}\`;`;
  }
};


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), hexLoader],
})
