type AuthLayoutProps = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#09090b]">
            <div className="flex flex-col items-center gap-6">
                {/* Spotlight brand above Clerk card */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#fafafa] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#141313]">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                        </svg>
                    </div>
                    <span className="font-semibold text-[#fafafa] tracking-tight">Spotlight</span>
                </div>
                {children}
            </div>
        </div>
    );
}
