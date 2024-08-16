"use client"

import { useEffect, useRef } from 'react';
import '../../dynamsoft.config.js';
import { CameraEnhancer, CameraView } from 'dynamsoft-camera-enhancer';
import { CaptureVisionRouter } from 'dynamsoft-capture-vision-router';
import { MultiFrameResultCrossFilter } from 'dynamsoft-utility';
import { rdb } from '@/app/firebase.js';
import { get, ref } from 'firebase/database';
import { useRouter } from 'next/navigation';
import './VideoCapture.css';

const strErrorDestroyed = 'videoCapture component destroyed';

function VideoCapture({ params }) {
  const uiContainer = useRef(null);
  const resultsContainer = useRef(null);
  const router = useRouter();

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

        const CheckInDB = async (barcode) => {

          const dbRef = ref(rdb, `barcodes/${params.productName}/${barcode}`);
          const snap = await get(dbRef);
          if (snap.exists()) {
            const prod = snap.val();
            if(prod > 0){
              alert('Product found in database');
              router.push(`/cart`);
            }
          } else {
            console.log('Barcode not found');
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
  }, []);

  return (
    <div>
      <div ref={uiContainer} className="div-ui-container"></div>
      <p>Results:</p>
      <div ref={resultsContainer} className="div-results-container"></div>
    </div>
  );
}

export default VideoCapture;
