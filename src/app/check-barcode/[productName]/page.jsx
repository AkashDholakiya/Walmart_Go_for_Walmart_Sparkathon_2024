"use client"

import { useEffect, useRef, useState } from 'react';
import '../../dynamsoft.config.js';
import { CameraEnhancer, CameraView } from 'dynamsoft-camera-enhancer';
import { CaptureVisionRouter } from 'dynamsoft-capture-vision-router';
import { MultiFrameResultCrossFilter } from 'dynamsoft-utility';
import { rdb } from '@/app/firebase.js';
import { get, ref, push, update, set  } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase.js';
import Navbar from "@/components/Navbar";
import './VideoCapture.css';

const strErrorDestroyed = 'videoCapture component destroyed';

function VideoCapture({ params }) {
  const [results, setResults] = useState(""); 
  const uiContainer = useRef(null);
  const resultsContainer = useRef(null);
  const router = useRouter();
  const decodedString = decodeURIComponent(params.productName);


  useEffect(() => {
    let resolveInit;
    const pInit = new Promise((r) => {
      resolveInit = r;
    });
    let bDestroyed = false;
    let cvRouter;
    let cameraEnhancer;
    (async () => {
      try {
        // Create a `CameraEnhancer` instance for camera control and a `CameraView` instance for UI control.
        const cameraView = await CameraView.createInstance();
        if (bDestroyed) throw new Error(strErrorDestroyed); // Check if component is destroyed after every async operation

        cameraEnhancer = await CameraEnhancer.createInstance(cameraView);
        if (bDestroyed) throw new Error(strErrorDestroyed);

        // Get default UI and append it to DOM.
        if (uiContainer.current) {
          uiContainer.current.appendChild(cameraView.getUIElement());
        }

        // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
        cvRouter = await CaptureVisionRouter.createInstance();
        if (bDestroyed) throw new Error(strErrorDestroyed);
        cvRouter.setInput(cameraEnhancer);

        const AddToUserCart = async (decodedString) => {
          // Reference to the user's product in the Realtime Database
          const dbRef = ref(rdb, `userProducts/${auth.currentUser.uid}/${decodedString}`);
          console.log(auth.currentUser.uid);
          try {
            // Get the current data at the reference
            const snap = await get(dbRef);
            
            if (snap.exists()) {
              // If the product already exists, update its quantity and other properties
              await update(dbRef, {
                quantity: snap.val().quantity + 1, // Increment the quantity
                price: 10 // Update the price if necessary, or keep the same
              });
            } else {
              // If the product doesn't exist, set a new entry
              await set(dbRef, {
                productName: decodedString,
                quantity: 1,
                price: 10
              });
            }
          } catch (error) {
            console.error("Error updating the user cart:", error);
          }
        };
 
        const CheckInDB = async (barcode) => {
          
          const dbRef = ref(rdb, `barcodes/${decodedString}/${barcode}`);
          const snap = await get(dbRef);
          if (snap.exists()) {
            const prod = snap.val();
            if(prod > 0){
              
              AddToUserCart(decodedString);

              alert('Product added to cart');
              router.push(`/cart`);
            }
          } else {
            console.log('Barcode not found');
            setResults('Product not found with this barcode');
          }
        };

        // Define a callback for results.
        cvRouter.addResultReceiver({
          onDecodedBarcodesReceived: (result) => {
            if (!result.barcodeResultItems.length) return;

            if (resultsContainer.current) {
              resultsContainer.current.textContent = '';
              CheckInDB(result.barcodeResultItems[0].text);
              result.barcodeResultItems.forEach((item) => {
                resultsContainer.current.append(
                  `${item.formatString}: ${item.text}`,
                  document.createElement('br'),
                  document.createElement('hr')
                );
              });
            }
          },
        });

        // Filter out unchecked and duplicate results.
        const filter = new MultiFrameResultCrossFilter();
        // Filter out unchecked barcodes.
        filter.enableResultCrossVerification('barcode', true);
        // Filter out duplicate barcodes within 3 seconds.
        filter.enableResultDeduplication('barcode', true);
        await cvRouter.addResultFilter(filter);
        if (bDestroyed) throw new Error(strErrorDestroyed);

        // Open camera and start scanning a single barcode.
        await cameraEnhancer.open();
        if (bDestroyed) throw new Error(strErrorDestroyed);
        await cvRouter.startCapturing('ReadSingleBarcode');
        if (bDestroyed) throw new Error(strErrorDestroyed);

      } catch (ex) {
        if (ex.message === strErrorDestroyed) {
          console.log(strErrorDestroyed);
        } else {
          const errMsg = ex.message || ex;
          console.error(errMsg);
          alert(errMsg);
        }
      }
    })();

    // Resolve the promise after initialization
    resolveInit();

    // Clean-up function on component unmount
    return async () => {
      bDestroyed = true;
      try {
        await pInit;
        if (cvRouter) cvRouter.dispose();
        if (cameraEnhancer) cameraEnhancer.dispose();
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className='h-full'>
      <Navbar />
      <div ref={uiContainer} className="div-ui-container"></div>
      <p>Results:</p>
      <div ref={resultsContainer} className="div-results-container"></div>
      <div>{results}</div>
    </div>
  );
}

export default VideoCapture;
