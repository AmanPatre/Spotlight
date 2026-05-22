'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 selection:bg-purple-500/30">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
            </div>

            <h1 className="text-4xl font-black mb-4 tracking-tight">Something went wrong</h1>
            <p className="text-zinc-400 text-lg mb-10 max-w-md text-center leading-relaxed">
                We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </p>

            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    variant="outline"
                    className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white gap-2 h-12 px-8 rounded-xl font-bold transition-all active:scale-95"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Try again
                </Button>
                <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-purple-600 hover:bg-purple-500 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                >
                    Return Home
                </Button>
            </div>
        </div>
    );
}
