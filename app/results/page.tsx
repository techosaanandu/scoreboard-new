"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';

export default function ResultsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchResults(debouncedSearch);
    }, [debouncedSearch]);

    async function fetchResults(query: string) {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if(query) params.set('q', query);
            const res = await fetch(`/api/results?${params.toString()}`);
            const data = await res.json();
            if(res.ok) setResults(data.data);
            console.log(data.data)
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    // Auto-scroll logic
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || loading || results.length === 0) return;

        let animationFrameId: number;
        let direction = 1; 
        let isPaused = false;
        const speed = 0.5; // Slower scroll for readability

        const scroll = () => {
            if (isPaused || !container) {
                animationFrameId = requestAnimationFrame(scroll);
                return; 
            }
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (direction === 1 && scrollTop + clientHeight >= scrollHeight - 1) {
                direction = -1;
                isPaused = true;
                setTimeout(() => { isPaused = false; }, 2000);
            } else if (direction === -1 && scrollTop <= 0) {
                direction = 1;
                isPaused = true;
                setTimeout(() => { isPaused = false; }, 2000);
            }
            container.scrollTop += direction * speed;
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [results, loading]);

    return (
        <div className="container py-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 shrink-0">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                   
                </h1>
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Student, School or Event..."
                        className="pl-8 bg-white/50 backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="flex-1 overflow-hidden shadow-2xl border-none bg-white/40 backdrop-blur-md">
                <CardContent className="p-0 h-full">
                    <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar">
                        <Table className="relative w-full">
                            <TableHeader className="bg-blue-900 text-white sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="text-white pl-6">Student</TableHead>
                                    <TableHead className="text-white">School</TableHead>
                                    <TableHead className="text-white">Event</TableHead>
                                    <TableHead className="text-white text-center">Grade</TableHead>
                                    <TableHead className="text-white text-right pr-6">Place</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && results.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="h-64 text-center">Loading...</TableCell></TableRow>
                                ) : results.map((r, index) => (
                                    <TableRow key={r._id} className={index % 2 === 0 ? "bg-white/20" : "bg-blue-50/20"}>
                                        <TableCell className="font-bold pl-6">{r.studentName}</TableCell>
                                        <TableCell className="text-blue-600 dark:text-blue-400">{r.school}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{r.eventName}</span>
                                                
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-xl">{r.grade || '-'}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            {r.place === 'First' && <span className="p-1 px-3 bg-yellow-100 text-yellow-700 rounded-full text-sm">🥇 1st</span>}
                                            {r.place === 'Second' && <span className="p-1 px-3 bg-gray-100 text-gray-700 rounded-full text-sm">🥈 2nd</span>}
                                            {r.place === 'Third' && <span className="p-1 px-3 bg-orange-100 text-orange-700 rounded-full text-sm">🥉 3rd</span>}
                                            {!['First','Second','Third'].includes(r.place) && r.place}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}