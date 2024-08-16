"use client";

import { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import { rdb } from "@/app/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";


export default function Home() {
  const videoRef = useRef(null);
  const bboxRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const croppedCanvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const router = useRouter();
  const width = 900;
  const height = 600;

  const checkIfProductExist = async (prediction) => {
    const labelContainer = document.getElementById("label-answer");

    const maxProb = Math.max(...prediction.map((p) => p.probability));
    const maxProbIndex = prediction.findIndex((p) => p.probability === maxProb);

    const productName = prediction[maxProbIndex].className.toLowerCase();
    
    const dbRef = ref(rdb, `products/${productName}`);
    const snapshot = await get(dbRef);
    const product = snapshot.val();
    console.log(product);
    if (product > 0) {
      labelContainer.innerHTML = `Product: ${productName}`;
      router.push(`/check-barcode/${productName}`);
    }else{
      labelContainer.innerHTML = `Product: Not Found`;
    }

  };

  useEffect(() => {
    const video = videoRef.current;
    const loadModel = async () => {
      const modelURL = "/model.json";
      const metadataURL = "/metadata.json";
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
    };

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
      };
    }).catch((err) => {
      console.error("Error accessing webcam:", err);
    });

    loadModel();

    return () => {
      if (video && video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!model) return;

    const cropVideo = () => {
      const video = videoRef.current;
      const bbox = bboxRef.current;
      const cropCanvas = cropCanvasRef.current;
      const croppedCanvas = croppedCanvasRef.current;
      const ctx = cropCanvas.getContext("2d");
      const croppedCtx = croppedCanvas.getContext("2d");

      if (!video.videoWidth || !video.videoHeight) return;

      ctx.drawImage(video, 0, 0, cropCanvas.width, cropCanvas.height);

      const bboxRect = bbox.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();
      const bboxX = bboxRect.left - videoRect.left;
      const bboxY = bboxRect.top - videoRect.top;
      const bboxWidth = bboxRect.width;
      const bboxHeight = bboxRect.height;

      if (bboxWidth === 0 || bboxHeight === 0) return;

      croppedCanvas.width = bboxWidth;
      croppedCanvas.height = bboxHeight;
      croppedCtx.clearRect(0, 0, bboxWidth, bboxHeight);
      croppedCtx.drawImage(cropCanvas, bboxX, bboxY, bboxWidth, bboxHeight, 0, 0, bboxWidth, bboxHeight);
    };

    const predict = async () => {
      if (!model) return;
      const video = videoRef.current;
      const prediction = await model.predict(video);
      const labelContainer = document.getElementById("label-container");
      labelContainer.innerHTML = "";
      prediction.forEach(({ className, probability }) => {
        const div = document.createElement("div");
        div.innerHTML = `${className}: ${probability.toFixed(2)}`;
        labelContainer.appendChild(div);
      });

      checkIfProductExist(prediction);
    };

    const loop = () => {
      cropVideo();
      predict();
    };

    loop(); // Call once for the initial prediction

    const intervalId = setInterval(loop, 3000); // Repeat every 1 second

    return () => clearInterval(intervalId);
  }, [model]);

  return (
    <div className="h-full">
        <Navbar />
        <section className="w-full h-[85%]">
        <div className="flex w-full h-full py-3">
            <video ref={videoRef} className="w-full h-full" style={{ objectFit: 'cover' }} />
            <div
            ref={bboxRef}
            className="absolute top-1/2 left-1/2 border-4 border-green-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-70"
            style={{ width: `${width * 0.6}px`, height: `${height * 0.6}px` }}
            />
            <canvas ref={cropCanvasRef} className="hidden"></canvas>
            <canvas ref={croppedCanvasRef} className="hidden"></canvas>
            <div id="label-container" className="absolute bottom-10 left-0 p-4 text-xl font-bold text-black"></div>
            <div id="label-answer" className="absolute bottom-0 left-0 p-4 text-xl font-bold text-black"></div>
        </div>
        </section>
    </div>
  );
}
