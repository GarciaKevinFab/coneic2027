import { motion } from 'motion/react';

const WHATSAPP_URL =
  'https://wa.me/51999999999?text=Hola%20quiero%20informaci%C3%B3n%20sobre%20CONEIC%202027';

export default function WhatsAppFAB() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        Escríbenos por WhatsApp
      </span>

      {/* Ping / pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

      {/* Button circle */}
      <span
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-7 h-7"
          fill="white"
        >
          <path d="M16.004 2.002c-7.732 0-14.002 6.27-14.002 14.002 0 2.468.657 4.876 1.904 6.988L2 30l7.188-1.885A13.94 13.94 0 0 0 16.004 30c7.732 0 14.002-6.27 14.002-14.002S23.736 2.002 16.004 2.002zm0 25.63a11.6 11.6 0 0 1-5.918-1.62l-.424-.252-4.398 1.154 1.174-4.29-.276-.44A11.57 11.57 0 0 1 4.38 16.004c0-6.41 5.216-11.625 11.625-11.625 6.41 0 11.625 5.216 11.625 11.625 0 6.41-5.216 11.628-11.625 11.628zm6.375-8.71c-.35-.174-2.07-1.022-2.39-1.138-.32-.116-.554-.174-.787.174-.234.35-.906 1.138-1.11 1.372-.206.234-.41.262-.76.088-.35-.174-1.476-.544-2.812-1.736-1.04-.926-1.74-2.07-1.944-2.42-.206-.35-.022-.538.154-.712.158-.156.35-.408.524-.612.174-.206.232-.35.35-.584.116-.234.058-.438-.03-.612-.088-.174-.787-1.898-1.08-2.598-.284-.682-.572-.59-.787-.6-.206-.01-.438-.012-.672-.012s-.612.088-.932.438c-.32.35-1.224 1.196-1.224 2.918s1.254 3.386 1.428 3.62c.174.234 2.466 3.762 5.976 5.274.836.36 1.488.576 1.996.738.838.266 1.602.228 2.204.138.672-.1 2.07-.846 2.362-1.664.292-.816.292-1.516.204-1.664-.088-.146-.32-.232-.672-.408z" />
        </svg>
      </span>
    </motion.a>
  );
}
