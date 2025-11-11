import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CompareTable({ data }) {
    const { columns, rows } = data;
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
            <div className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-divider">
                    <TableHeader>
                        <TableRow className="hover:bg-card">
                            {columns.map(col => (
                                <TableHead key={col.key} className="px-6 py-5 text-left text-xs font-medium text-accent-gold-text uppercase tracking-wider">
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-divider">
                        {rows.map(row => (
                            <TableRow key={row.id} className={`hover:bg-black/20 transition-colors duration-200 ${row.highlight ? 'bg-highlight-bg' : ''}`}>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{row.label}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{row.price}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{row.performer}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{row.choice}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{row.differentiator}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}