import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 selection:bg-purple-500/30">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-2xl">
                    <Compass className="w-12 h-12 text-purple-400" />
                </div>
            </div>

            <h1 className="text-7xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">404</h1>
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-zinc-500 text-lg mb-10 max-w-sm text-center leading-relaxed font-medium">
                The spotlight couldn&apos;t find what you were looking for. It might have been moved or doesn&apos;t exist.
            </p>

            <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white h-14 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-purple-600/20 transition-all hover:scale-105 active:scale-95">
                    Go back home
                </Button>
            </Link>
        </div>
    );
}
