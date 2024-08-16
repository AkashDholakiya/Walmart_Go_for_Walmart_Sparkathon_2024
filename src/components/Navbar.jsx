"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/app/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {  
  const router  = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }
  
  return (
    <div className='w-full h-[15%]'>
      <nav className="flex sticky top-0 py-3 justify-between w-full items-center bg-[#0071dc]">
        <Link href={'/dashboard'} className="flex items-center justify-center ml-10">
          <h1 className="font-bold flex justify-center items-center text-white text-5xl">Walmart &nbsp; <Image className="mr-5" width={70} height={70} src={'/walmart-icon.svg'} alt="logo" /> Go</h1>
        </Link> 
        <div className="flex items-center justify-center mr-10">
          <Link href={'/cart'} className="flex justify-center items-center p-2 hover:border-2 hover:border-black bg-white text-white rounded-full">
            <Image className="cursor-pointer" width={30} height={30} src={'/cart.png'} alt="logo" />
          </Link>
            <div
              className='ml-5 py-2 px-5 font-semibold text-black cursor-pointer hover:border-2 hover:border-black bg-white rounded-full'
              onClick={handleLogout}
            >
              Logout
            </div>
        </div>
      </nav>
    </div>

  )
}

export default Navbar
