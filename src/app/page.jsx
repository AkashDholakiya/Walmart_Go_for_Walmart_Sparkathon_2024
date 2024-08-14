"use client"

import { useEffect } from "react";

export default function Home() {


  // ask for video permission to allow user feed video
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const video = document.querySelector('video');
        video.srcObject = stream;
        video.onloadedmetadata = (e) => {
          video.play();
        };
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <section className="flex h-screen w-full">
      <div className="flex w-1/4 bg-gray-400" />
      <div className="flex w-3/4 py-3">  
        <video className="w-full -scale-x-100"/>
      </div>
    </section>
  );
}
 