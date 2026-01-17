"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dummy data for initial view or if fetch fails
const INITIAL_DATA = [
  { rank: 1, school: "Loading...", points: 0 },
];

export function LeaderboardTable() {
    const [data, setData] = useState<{rank:number, school:string, points:number}[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/leaderboard');
                if(res.ok) {
                    const json = await res.json();
                    setData(json.data);
                }
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || loading || data.length === 0) return;

        let animationFrameId: number;
        let direction = 1; 
        let isPaused = false;
        const speed = 1; // 1 pixel per frame (at 60fps = 60px/sec, smooth)
        const pauseDuration = 2000; 

        const scroll = () => {
             if (isPaused) {
                animationFrameId = requestAnimationFrame(scroll);
                return; 
            }

            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                
                // Check bounds
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

        // Start scrolling
        animationFrameId = requestAnimationFrame(scroll);

        return () => {
             cancelAnimationFrame(animationFrameId);
        };
    }, [data, loading]);

    return (
        <Card className="w-full h-full bg-white/50 backdrop-blur-sm border-none shadow-none bg-transparent">
             {/* Header removed from card to save space, or kept minimal */}
             {/* We want full screen table mostly */}
            
            <CardContent className="p-0 h-full">
                <div 
                    ref={scrollRef}
                    className="h-[calc(100vh-4rem)] overflow-y-auto w-full no-scrollbar relative"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style jsx global>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    <Table className="w-full h-full text-lg">
                        <TableHeader className="bg-blue-950/90 text-white sticky top-0 backdrop-blur-md z-10 shadow-md">
                            <TableRow className="hover:bg-blue-950/90 border-none">
                                <TableHead className="w-[100px] text-center font-bold text-white text-xl py-6">Rank</TableHead>
                                <TableHead className="font-bold text-white text-xl">School</TableHead>
                                <TableHead className="text-right font-bold text-white text-xl pr-10">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-96 text-center text-2xl animate-pulse">Loading live results...</TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-96 text-center text-muted-foreground text-2xl">No results yet</TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, index) => (
                                    <TableRow key={item.school} className={cn(
                                        "transition-colors border-b border-gray-200 dark:border-gray-800",
                                        "hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
                                        index % 2 === 0 ? "bg-white/40 dark:bg-slate-900/40" : "bg-slate-50/40 dark:bg-slate-800/40",
                                        item.rank === 1 && "bg-gradient-to-r from-yellow-100/80 to-amber-100/80 dark:from-yellow-900/30 dark:to-amber-900/30",
                                        item.rank === 2 && "bg-gradient-to-r from-gray-100/80 to-slate-200/80 dark:from-gray-800/30 dark:to-slate-700/30",
                                        item.rank === 3 && "bg-gradient-to-r from-orange-100/80 to-red-100/80 dark:from-orange-900/30 dark:to-red-900/30"
                                    )}>
                                        <TableCell className="text-center font-bold text-2xl py-6">
                                            {item.rank === 1 && <Trophy className="w-8 h-8 inline text-yellow-500 fill-yellow-500 drop-shadow-sm" />}
                                            {item.rank === 2 && <Medal className="w-8 h-8 inline text-coolgray-400 fill-gray-400 drop-shadow-sm" />}
                                            {item.rank === 3 && <Medal className="w-8 h-8 inline text-amber-600 fill-amber-600 drop-shadow-sm" />}
                                            {item.rank > 3 && <span className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-inner font-black">{item.rank}</span>}
                                        </TableCell>
                                        <TableCell className="text-2xl font-semibold tracking-tight">{item.school}</TableCell>
                                        <TableCell className="text-right font-black text-3xl pr-10 font-mono text-blue-900 dark:text-blue-300 drop-shadow-sm">{item.points}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
