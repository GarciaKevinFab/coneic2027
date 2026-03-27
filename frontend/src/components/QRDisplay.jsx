import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { HiArrowsExpand, HiX } from 'react-icons/hi';
import clsx from 'clsx';

export default function QRDisplay({ value, size = 200, title = 'Tu codigo QR' }) {
  const [fullscreen, setFullscreen] = useState(false);

  if (!value) return null;

  return (
    <>
      {/* Regular display */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <QRCodeSVG
            value={value}
            size={size}
            bgColor="#ffffff"
            fgColor="#1A3A6B"
            level="H"
            includeMargin={false}
          />
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-700 font-medium transition-colors"
        >
          <HiArrowsExpand className="w-4 h-4" />
          Pantalla completa
        </button>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-600" />
          </button>
          <h3 className="text-xl font-display font-bold text-primary mb-6">{title}</h3>
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200">
            <QRCodeSVG
              value={value}
              size={Math.min(window.innerWidth - 100, 350)}
              bgColor="#ffffff"
              fgColor="#1A3A6B"
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-sm text-gray-500 mt-6">Toca en cualquier lugar para cerrar</p>
        </div>
      )}
    </>
  );
}
