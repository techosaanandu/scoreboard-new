'use client'

import siteMetadata from '@/data/siteMetadata'
// import Logo from '@/data/logo1.png'
// import VenueLogo from '@/data/venuelogo.png'
import Link from 'next/link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Header = () => {
  const { data: session } = useSession()
  const router = useRouter()

  let headerClass = 'flex items-center w-full bg-blue-950 dark:bg-gray-950 px-4 py-2 sm:py-3 transition-colors duration-300'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50 shadow-xl border-b border-blue-900'
  }

  return (
    <header className={headerClass}>
      {/* Grid Layout: 
          - Left: 1/4 space (col-span-3)
          - Middle: 2/4 space (col-span-6)
          - Right: 1/4 space (col-span-3)
      */}
      <div className="grid grid-cols-12 w-full items-center gap-2">
        
        {/* --- PART 1: LOGO & NAME (25%) --- */}
        <div className="col-span-3 lg:col-span-3 col-span-2 flex items-center justify-start gap-3">
          <Link href="/" aria-label={siteMetadata.headerTitle} className="flex items-center gap-2">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
             {/* Use generated placeholder or public asset. Assuming /images/logo.png will exist */}
              <Image
                src={siteMetadata.siteLogo}
                alt="Logo"
                width={56}
                height={56}
                className="object-contain rounded-full"
              />
            </div>
            <span className="hidden xl:block text-lg font-bold text-white tracking-tighter uppercase leading-tight">
              {siteMetadata.headerTitle}
            </span>
          </Link>
        </div>

        {/* --- PART 2: THE "NAME BOARD" MARQUEE (50%) --- */}
        <div className="col-span-7 lg:col-span-6 flex items-center px-1 sm:px-4">
          <div className="flex items-center bg-blue-900/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 w-full overflow-hidden border border-blue-800 shadow-inner">
            
            
            {/* The Scrolling Container */}
            <div className="relative flex overflow-x-hidden flex-1">
              <div className="animate-marquee whitespace-nowrap flex items-center">
                <span className="text-xs sm:text-sm md:text-base font-bold text-white uppercase tracking-widest mx-4">
                  Venue: Mar Baselios Public School, Kaithacode — Welcome to the Event — Check out for Schedule —
                </span>
                {/* Duplicate for seamless loop */}
                <span className="text-xs sm:text-sm md:text-base font-bold text-white uppercase tracking-widest mx-4">
                  Venue: Mar Baselios Public School, Kaithacode — Welcome to the Event — Check out for Schedule —
                </span>
              </div>
            </div>
            </div>
          </div>


        {/* --- PART 3: NAV / USER (25%) --- */}
        <div className="col-span-3 lg:col-span-3 flex items-center justify-end gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/results" className="text-[10px] font-black text-white hover:text-blue-300 transition-colors tracking-widest">RESULTS</Link>
            {session && (
              <button
                onClick={() => router.push('/admin')}
                className="text-[10px] font-black text-white hover:text-blue-300 transition-colors tracking-widest"
              >
                DASHBOARD
              </button>
            )}
            
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[10px] font-black text-white hover:text-red-400 transition-colors tracking-widest"
              >
                LOGOUT
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-sm text-[10px] font-black transition-all tracking-widest backdrop-blur-sm"
              >
                LOGIN
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:ml-2">
            <ThemeSwitch />
            <MobileNav />
          </div>
        </div>

      </div>

      {/* Required CSS for the Marquee Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  )
}

export default Header
