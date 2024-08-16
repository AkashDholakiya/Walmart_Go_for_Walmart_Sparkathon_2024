"use client";

import { auth } from '@/app/firebase';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Ensure the CSS module is imported

export default function Home() {
  const router = useRouter(); // Define the router instance

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User signed in: ", result.user);
      router.push('/dashboard'); // Navigate to the dashboard after successful sign-in
    } catch (error) {
      console.error("Error during sign-in: ", error);
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.box}>
        <p className={styles.text}>Please log in to continue</p>
        <button 
          onClick={signInWithGoogle} 
          className={styles.signInButton}>
          Sign in with Google
        </button>
      </div>
    </section>
  );
}
