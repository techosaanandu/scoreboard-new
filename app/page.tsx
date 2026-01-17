import { LeaderboardTable } from '@/components/leaderboard-table';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        {/* Header Removed - moved to layout */}
        <div className="pt-6"></div>

        

        {/* Leaderboard Section */}
        <section className="container py-8 md:py-12 lg:py-2">
            <div className="mx-auto min-w-full mt-10">
                <LeaderboardTable />
            </div>
        </section>
    </main>
  );
}
