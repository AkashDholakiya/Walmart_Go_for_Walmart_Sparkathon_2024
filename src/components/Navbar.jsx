"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/app/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe(); 
  }, []);

  const signInWithGoogle = async () => {    
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  
  } 
  
  const handleLogout = async () => {
    await signOut(auth);
  
  }
  console.log(currentUser);
  return ( 
    <div>
      <nav className="flex py-3 justify-between w-full items-center bg-[#0071dc]">
        <Link href={'/'} className="flex items-center justify-center ml-10">
          <div>
            <Image className="mr-5" width={70} height={70} src={'/walmart-icon.svg'} alt="logo" />
          </div>
          <h1 className="font-bold text-white text-5xl">Walmart Go</h1>
        </Link>
        <div className="flex items-center justify-center mr-10">
          <Link href={'/cart'} className="flex justify-center items-center p-2 hover:border-2 hover:border-black bg-white text-white rounded-full">
            <Image className="cursor-pointer" width={30} height={30} src={'/cart.png'} alt="logo" />
          </Link>
          {!currentUser ? 
            <Image 
              className="ml-5 cursor-pointer hover:border-2 hover:border-black bg-white text-white rounded-full" 
              width={50} 
              height={50} 
              src={'/user.png'} 
              alt="logo" 
              onClick={signInWithGoogle} 
            /> 
            : 
            <div 
              className='ml-5 py-2 px-5 font-semibold text-black cursor-pointer hover:border-2 hover:border-black bg-white rounded-full' 
              onClick={handleLogout}
            >
              Logout
            </div>
          }
        </div>
      </nav>
    </div>
  )
}

export default Navbar
