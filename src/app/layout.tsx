import type { Metadata } from 'next';import './globals.css';import {Shell} from '@/components/shell';
export const metadata:Metadata={title:'WorkVault — Good work, fairly rewarded',description:'A trusted marketplace for professional work. Find meaningful projects and get paid in USD.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Shell>{children}</Shell></body></html>}
