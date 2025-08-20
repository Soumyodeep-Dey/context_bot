"use client"

import { FaGithub, FaLinkedin, FaDev, FaEnvelope, FaTwitter } from "react-icons/fa"

export function Footer() {
    return (
        <footer className="bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-slate-700 dark:text-gray-300 py-8 mt-12 border-t dark:border-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                {/* About */}
                <p className="text-sm font-medium tracking-wide">
                    © 2025 Soumyodeep Dey · Built with Next.js, LangChain, and Tailwind CSS
                </p>

                {/* Social Links */}
                <div className="flex space-x-6 text-xl">
                    <a href="https://github.com/Soumyodeep-Dey" aria-label="GitHub" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:scale-125 transform">
                        <FaGithub />
                    </a>
                    <a href="https://www.linkedin.com/in/soumyodeepdey-s-d-2a125b1a7" aria-label="LinkedIn" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:scale-125 transform">
                        <FaLinkedin />
                    </a>
                    <a href="https://dev.to/soumyodeep_dey" aria-label="DEV" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:scale-125 transform">
                        <FaDev />
                    </a>
                    <a href="mailto:soumyodeepdey2003@gmail.com" aria-label="Email" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:scale-125 transform">
                        <FaEnvelope />
                    </a>
                    <a href="https://twitter.com/soumyodeep_dey" aria-label="Twitter" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:scale-125 transform">
                        <FaTwitter />
                    </a>
                </div>
            </div>
        </footer>
    )
}
