"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useSession, signOut } from "next-auth/react"

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)
  const { data: session } = useSession()

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        // Prevent scrolling
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="ml-1 mr-1 h-8 w-8 rounded py-1"
        aria-label="Toggle Menu"
        onClick={onToggleNav}
      >
        <Menu className="h-6 w-6 text-white" />
      </button>
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full transform bg-white dark:bg-gray-950 opacity-95 duration-300 ease-in-out ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-5 mt-11 h-8 w-8 rounded"
            aria-label="Toggle Menu"
            onClick={onToggleNav}
          >
            <X className="h-6 w-6 text-gray-900 dark:text-gray-100" />
          </button>
        </div>
        <nav className="fixed mt-8 h-full">
          <div className="px-12 py-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
              onClick={onToggleNav}
            >
              Home
            </Link>
          </div>
          <div className="px-12 py-4">
            <Link
              href="/results"
              className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
              onClick={onToggleNav}
            >
              Results
            </Link>
          </div>
          <div className="px-12 py-4">
             {session ? (
                 <button 
                    onClick={() => { signOut(); onToggleNav(); }}
                    className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                 >
                    Logout
                 </button>
             ) : (
                <Link
                    href="/api/auth/signin"
                    className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                    onClick={onToggleNav}
                >
                    Login
                </Link>
             )}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default MobileNav
