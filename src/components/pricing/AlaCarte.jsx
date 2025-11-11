import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AlaCarte({ data, performers }) {
    const [activePerformer, setActivePerformer] = useState('johnny');
    const performerDetails = performers.find(p => p.id === activePerformer);

    const renderOptions = (type) => {
        const options = data[type].filter(opt => opt.performer_id === activePerformer);
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {options.map(option => (
                    <div key={option.id} className="bg-black/20 p-6 rounded-lg text-center">
                        <p className="text-lg font-semibold text-text-primary">{option.duration_minutes} Minutes</p>
                        <p className="text-3xl font-bold text-accent-gold-text mt-2">${option.price.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="bg-card border-border card-glow p-8">
            <div className="flex justify-center mb-8">
                <div className="bg-black/20 p-1 rounded-full flex space-x-1">
                    {performers.map(p => (
                         <Button
                            key={p.id}
                            onClick={() => setActivePerformer(p.id)}
                            variant={activePerformer === p.id ? 'default' : 'ghost'}
                            className={`w-32 rounded-full font-bold ${activePerformer === p.id ? 'bg-accent-gold text-bg' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                        >
                            {p.name}
                        </Button>
                    ))}
                </div>
            </div>

            <Tabs defaultValue="close_up" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/20 p-1 h-auto mb-8">
                    <TabsTrigger value="close_up" className="py-2 text-base data-[state=active]:bg-card data-[state=active]:text-accent-gold-text data-[state=active]:shadow-md">Close-Up Magic</TabsTrigger>
                    <TabsTrigger value="stage" className="py-2 text-base data-[state=active]:bg-card data-[state=active]:text-accent-gold-text data-[state=active]:shadow-md">Stage Show</TabsTrigger>
                </TabsList>
                <TabsContent value="close_up">
                    {renderOptions('close_up')}
                </TabsContent>
                <TabsContent value="stage">
                    {renderOptions('stage')}
                </TabsContent>
            </Tabs>
        </Card>
    );
}