"use client";

import { auth } from '@/app/firebase';
import { GoogleAuthProvider, signInWithPopup  } from "firebase/auth";

export default function Home() {

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);

  }

  return (
    <section className="w-full h-full">
      <div className="flex w-full h-full py-3">
        <h1>sadoiasij</h1>
      </div>
    </section>
  );
}
