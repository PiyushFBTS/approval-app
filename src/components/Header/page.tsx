'use client';

import { RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function Header() {

    const router = useRouter();


    const onRefresh = () => {
        console.log("Refresh button clicked");
        router.refresh(); // Next.js soft refresh (App Router only)
    };



    return (
        <header className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 bg-white shadow-md z-50">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <Image src="/logo.jpg" alt="Logo" width={40} height={40} />
            </div>

            {/* Branch name - center on medium+ screens, inline on mobile */}
            <div className="text-center flex-1 mx-2 text-sm md:text-lg font-medium truncate">
                <h2>Flamboyant technologies</h2>
            </div>

            {/* Refresh Button */}
            <button
                onClick={onRefresh}
                className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                aria-label="Refresh"
            >
                <RefreshCcw className="w-6 h-6" />
            </button>
        </header>
    );
}
