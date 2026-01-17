"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

export default function ResultsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<{
        _id: string;
        studentName: string;
        school: string;
        eventName: string;
        category: string;
        grade: string;
        place: string;
    }[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Initial load - show all or recent (handled by API defaulting to limit if no query)
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
            if(res.ok) {
                setResults(data.data);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    // Auto-scroll logic (Same as Leaderboard)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || loading || results.length === 0) return;

        // If user is searching, maybe pause scrolling? 
        // User didn't specify, but for usability usually we pause on interaction.
        // However, user asked "auto scroll feature here tooo". Assuming always on unless interacting.
        // For simple implementation, let's keep it running but maybe slow.

        let animationFrameId: number;
        let direction = 1; 
        let isPaused = false;
        const speed = 1; 
        const pauseDuration = 2000; 

        const scroll = () => {
            if (isPaused) {
                animationFrameId = requestAnimationFrame(scroll);
                return; 
            }

            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                
                if (direction === 1 && scrollTop + clientHeight >= scrollHeight - 0.5) {
                    direction = -1;
                    isPaused = true;
                    setTimeout(() => { isPaused = false; }, pauseDuration);
                } else if (direction === -1 && scrollTop <= 0) {
                    direction = 1;
                    isPaused = true;
                    setTimeout(() => { isPaused = false; }, pauseDuration);
                }

                if (!isPaused) {
                    container.scrollTop += direction * speed;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [results, loading]);

    return (
        <div className="container py-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 shrink-0">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                    
                </h1>
                
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find Student, School or ID..."
                            className="pl-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* <Button onClick={() => fetchResults(searchTerm)} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                    </Button> */}
                </div>
            </div>

            <Card className="flex-1 overflow-hidden shadow-2xl border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
                <CardContent className="p-0 h-full">
                    <div 
                        ref={scrollRef}
                        className="h-full overflow-y-auto w-full no-scrollbar relative"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <style jsx global>{`
                            .no-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>
                        <Table className="relative w-full">
                            <TableHeader className="bg-blue-950/90 text-white sticky top-0 backdrop-blur-md z-10 shadow-md">
                                <TableRow className="hover:bg-blue-950/90 border-none">
                                    <TableHead className="font-bold text-white text-lg py-4 pl-6">Student Name</TableHead>
                                    <TableHead className="font-bold text-white text-lg">School</TableHead>
                                    <TableHead className="font-bold text-white text-lg">Event & Category</TableHead>
                                    <TableHead className="text-center font-bold text-white text-lg">Grade</TableHead>
                                    <TableHead className="text-right font-bold text-white text-lg pr-8">Place</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && results.length === 0 ? (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-96 text-center text-xl animate-pulse text-muted-foreground">Searching results...</TableCell>
                                    </TableRow>
                                ) : results.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-96 text-center text-xl text-muted-foreground">
                                            {debouncedSearch ? "No results found matching your query." : "Use the search bar to find results."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    results.map((r: {
                                        _id: string;
                                        studentName: string;
                                        school: string;
                                        eventName: string;
                                        category: string;
                                        grade: string;
                                        place: string;
                                    }, index: number) => (
                                        <TableRow key={r._id} className={`
                                            transition-colors border-b border-gray-100 dark:border-gray-800
                                            hover:bg-blue-50/50 dark:hover:bg-blue-900/20
                                            ${index % 2 === 0 ? "bg-white/40 dark:bg-slate-900/40" : "bg-blue-50/30 dark:bg-slate-800/40"}
                                        `}>
                                            <TableCell className="font-bold text-lg text-slate-900 dark:text-slate-100 pl-6">{r.studentName}</TableCell>
                                            <TableCell className="font-medium text-base text-blue-700 dark:text-blue-300">{r.school}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base">{r.eventName}</span>
                                                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full w-fit mt-1">{r.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-xl">{r.grade || '-'}</TableCell>
                                            <TableCell className="text-right font-bold text-lg pr-6">
                                                {(r.place === 'First' || r.place === '1') && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">🥇 First</span>}
                                                {(r.place === 'Second' || r.place === '2') && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">🥈 Second</span>}
                                                {(r.place === 'Third' || r.place === '3') && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800">🥉 Third</span>}
                                                {!['First','Second','Third','1','2','3'].includes(r.place) && r.place}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
