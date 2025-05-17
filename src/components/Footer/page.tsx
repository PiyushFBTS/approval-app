'use client';

export default function Footer() {
    return (
        <footer className="w-full bg-white shadow-inner border-t mt-auto">
            <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                {/* Left side */}
                <div className=" flex items-center  space-x-4 mb-2">
                    <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                </div>

                {/* Right side */}
                <div className="text-center md:text-left  md:mb-0">
                    © {new Date().getFullYear()} Flamboyant Technologies. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
