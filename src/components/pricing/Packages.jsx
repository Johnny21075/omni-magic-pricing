import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const PackageCard = ({ pkg, isHighlighted }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`h-full ${isHighlighted ? 'highlight-glow' : 'card-glow'}`}
        >
            <Card className={`bg-card border-border h-full flex flex-col relative overflow-hidden ${isHighlighted ? 'border-accent-gold' : ''}`}>
                {isHighlighted && (
                    <Badge className="absolute top-0 right-0 -mr-1 -mt-1 transform bg-accent-gold text-bg font-bold text-sm py-1 px-3" variant="default">
                        Most Popular
                    </Badge>
                )}
                <CardHeader className="p-8">
                    <CardTitle className={`font-serif text-3xl font-bold ${pkg.style.title_gold ? 'text-accent-gold-text' : ''}`}>{pkg.name}</CardTitle>
                    <p className="text-4xl font-bold mt-4">${pkg.price.toLocaleString()}</p>
                    <p className="text-text-secondary mt-1">with {pkg.performer}</p>
                </CardHeader>
                <CardContent className="flex-grow px-8 pb-8">
                    <div className="border-t border-divider pt-6">
                        <p className="font-semibold text-accent-gold-text mb-2">Includes Your Choice Of:</p>
                        <p className="text-text-secondary">{pkg.choice}</p>
                    </div>
                    <div className="mt-6">
                        <p className="font-semibold text-accent-gold-text mb-3">What Makes It Different:</p>
                        <ul className="space-y-2">
                            {pkg.what_makes_it_different.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle2 className="h-5 w-5 text-accent-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-text-secondary">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="p-8 bg-black/20 mt-auto">
                    <Button size="lg" className="w-full font-bold bg-accent-gold text-bg hover:bg-accent-gold/90">Select {pkg.name}</Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

const DylanPackage = ({ pkg }) => {
    return (
        <Card className="bg-card border-border card-glow col-span-1 md:col-span-3 lg:col-span-1">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="p-8 hover:no-underline">
                        <div className="text-left">
                            <CardTitle className="font-serif text-3xl font-bold">{pkg.name}</CardTitle>
                             <p className="text-text-secondary mt-1">{pkg.note}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8">
                        <div className="border-t border-divider pt-6 space-y-4">
                            {pkg.tiers.map(tier => (
                                <div key={tier.id} className="p-4 bg-black/20 rounded-lg">
                                    <p className="font-bold text-lg">{tier.label}</p>
                                    <p className="text-text-secondary text-sm">Your Choice of: {tier.choice}</p>
                                </div>
                            ))}
                        </div>
                         <Button size="lg" className="w-full font-bold bg-gray-600 hover:bg-gray-500 mt-6">Select Dylan</Button>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}

export default function Packages({ packages }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {packages.filter(p => !p.collapsible).map(pkg => (
        <div key={pkg.id} className="lg:col-span-1">
            <PackageCard pkg={pkg} isHighlighted={pkg.style.highlight} />
        </div>
      ))}
      {packages.filter(p => p.collapsible).map(pkg => (
        <div key={pkg.id} className="lg:col-span-1">
            <DylanPackage pkg={pkg} />
        </div>
      ))}
    </div>
  );
}