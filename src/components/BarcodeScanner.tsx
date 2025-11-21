import React, { useRef, useEffect, useCallback } from 'react';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanner = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const scanBarcode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      onScan(code.data);
      stopScanner();
    }
  }, [onScan, stopScanner]);

  useEffect(() => {
    startScanner();

    const interval = setInterval(() => {
      scanBarcode();
    }, 500);

    return () => {
      clearInterval(interval);
      stopScanner();
    };
  }, [scanBarcode, stopScanner]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-64 bg-black rounded-lg"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 border-2 border-green-400 rounded-lg pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        Center the barcode in the frame to scan
      </div>
    </div>
  );
};

// Load jsQR library dynamically
const loadJsQR = async () => {
  if (typeof window !== 'undefined' && !(window as any).jsQR) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.async = true;
    document.head.appendChild(script);

    return new Promise((resolve) => {
      script.onload = resolve;
    });
  }
  return Promise.resolve();
};

// Export the scanner with jsQR dependency
export default BarcodeScanner;

// Helper function to scan a barcode using jsQR
declare const jsQR: any;