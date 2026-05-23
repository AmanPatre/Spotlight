import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white p-6 selection:bg-white/10">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded border border-[#27272a] bg-[#141313] flex items-center justify-center shadow-2xl">
                    <Compass className="w-10 h-10 text-white" />
                </div>
            </div>

            <h1 className="text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 uppercase">404</h1>
            <h2 className="text-[18px] font-bold mb-4 uppercase tracking-[0.2em]" style={{ fontFamily: 'Geist, sans-serif' }}>Page Not Found</h2>
            <p className="text-[#c4c7c8] text-[12px] font-mono mb-10 max-w-sm text-center uppercase tracking-widest leading-relaxed">
                The enterprise spotlight couldn&apos;t identify the requested node. It may have been decommissioned or moved.
            </p>

            <Link href="/">
                <Button className="bg-white hover:bg-[#c6c6c7] text-[#141313] h-12 px-10 rounded-none font-bold text-[12px] tracking-[0.2em] uppercase shadow-lg transition-all active:scale-95">
                    Return to Dashboard
                </Button>
            </Link>
        </div>
    );
}
