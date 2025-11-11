import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, Star } from 'lucide-react';

export default function Resources({ resources }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.items.map(item => (
        <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.label} className="block group">
            <Card className="bg-card border-border p-6 h-full transition-all duration-300 group-hover:bg-highlight-bg card-glow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{item.label}</h3>
                        <p className="text-sm text-text-secondary mt-1">{item.sub}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-text-secondary transform transition-transform duration-300 group-hover:rotate-45 group-hover:text-accent-gold-text" />
                </div>
            </Card>
        </a>
      ))}
    </div>
  );
}