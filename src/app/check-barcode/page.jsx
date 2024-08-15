"use client";

import { useEffect, useRef } from "react";
import Quagga from "quagga";

export default function Home() {
  const videoRef = useRef(null);
  const width = 640;
  const height = 480;

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
      })
      .catch((err) => {
        console.log(err);
      });

    // Initialize QuaggaJS with specific dimensions
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          width: width,
          height: height,
          facingMode: "environment", // Use the back camera
        },
      },
      locator: {
        patchSize: "medium", // x-small, small, medium, large, x-large
        halfSample: false,
      },
      decoder: {
        readers: ["code_128_reader", "ean_reader"], // Add your barcode type here
      },
      locate: true,
      area: { // defines rectangle of the detection area
        top: "20%",    // top offset (20% from top)
        right: "20%",  // right offset (20% from right)
        left: "20%",   // left offset (20% from left)
        bottom: "20%"  // bottom offset (20% from bottom)
      },
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((data) => {
      console.log("Barcode detected:", data.codeResult.code);
    });

    return () => {
      Quagga.stop();
    };
  }, []);

  return (
    <section className="flex h-screen w-full">
      <div className="flex w-1/4 bg-gray-400" />
      <div className="flex w-3/4 py-3 relative">
        <video ref={videoRef} className="w-full -scale-x-100" />
        {/* Rectangle Overlay */}
        <div
          className="absolute top-1/2 left-1/2 border-4 border-green-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-70"
          style={{ width: `${width * 0.6}px`, height: `${height * 0.6}px` }} // 60% of video dimensions
        />
      </div>
    </section>
  );
}
