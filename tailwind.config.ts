import type { Config } from 'tailwindcss';
export default { content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink:'#18231f', muted:'#738078', line:'#e9ede9', canvas:'#f7f9f6', green:'#1f7a52', lime:'#d9f27a' }, boxShadow: { soft:'0 8px 28px rgba(22,40,31,.06)' } } }, plugins: [] } satisfies Config;
