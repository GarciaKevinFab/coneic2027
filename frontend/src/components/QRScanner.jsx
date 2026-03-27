import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { HiCamera, HiRefresh, HiLightBulb } from 'react-icons/hi';

export default function QRScanner({ onScan, onError, active = true }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !active) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (result?.data) {
          onScan(result.data);
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
        preferredCamera: 'environment',
      }
    );

    scannerRef.current = scanner;

    scanner.start().then(() => {
      setHasCamera(true);
    }).catch((err) => {
      setHasCamera(false);
      onError?.(err.message || 'No se pudo acceder a la camara');
    });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [active, onScan, onError]);

  const toggleFlash = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.toggleFlash();
        setFlashOn(!flashOn);
      } catch {
        // Flash not supported
      }
    }
  };

  if (!hasCamera) {
    return (
      <div className="bg-gray-900 rounded-2xl p-8 text-center">
        <HiCamera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-300 font-medium">No se encontro camara</p>
        <p className="text-gray-500 text-sm mt-2">
          Permite el acceso a la camara para escanear codigos QR
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
        <button
          onClick={toggleFlash}
          className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Alternar flash"
        >
          <HiLightBulb className={`w-5 h-5 ${flashOn ? 'text-accent' : ''}`} />
        </button>
      </div>
    </div>
  );
}
