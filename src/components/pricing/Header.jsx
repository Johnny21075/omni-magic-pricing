import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ logoUrl, navigation }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80, // header height
                behavior: 'smooth',
            });
        }
        setMobileMenuOpen(false);
    };

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-bg/80 backdrop-blur-lg border-b border-divider' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <a href="#" onClick={(e) => {e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'})}} className="flex items-center gap-3">
                            <img className="h-10 w-auto grayscale invert" src={logoUrl} alt="Omni Magic Entertainment" />
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navigation.map((item) => (
                                <button key={item.name} onClick={() => scrollTo(item.href)} className="text-text-secondary hover:text-accent-gold-text px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <Button className="bg-accent-gold text-bg hover:bg-accent-gold/90 font-bold">Request a Date</Button>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-white hover:bg-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => (
                            <button key={item.name} onClick={() => scrollTo(item.href)} className="text-text-secondary hover:text-accent-gold-text block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors">
                                {item.name}
                            </button>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-divider px-5">
                         <Button className="w-full bg-accent-gold text-bg hover:bg-accent-gold/90 font-bold">Request a Date</Button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </header>
    );
}