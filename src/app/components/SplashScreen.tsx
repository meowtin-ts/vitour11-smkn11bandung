import { motion } from "motion/react";
import schoolLogo from "../../imports/logo_smkn11bdg.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Memphis Design shapes data
  const memphisShapes = [
    { type: "circle", size: 120, x: "10%", y: "15%", color: "#3b82f6", delay: 0 },
    { type: "triangle", size: 100, x: "85%", y: "20%", color: "#ec4899", delay: 0.1 },
    { type: "square", size: 80, x: "15%", y: "75%", color: "#06b6d4", delay: 0.2 },
    { type: "circle", size: 60, x: "80%", y: "70%", color: "#f59e0b", delay: 0.3 },
    { type: "line", size: 150, x: "50%", y: "10%", color: "#8b5cf6", delay: 0.4 },
    { type: "dots", size: 70, x: "90%", y: "50%", color: "#10b981", delay: 0.5 },
    { type: "zigzag", size: 90, x: "5%", y: "45%", color: "#f472b6", delay: 0.6 },
  ];

  const renderMemphisShape = (shape: any, index: number) => {
    const baseStyle = {
      position: "absolute" as const,
      left: shape.x,
      top: shape.y,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
    };

    switch (shape.type) {
      case "circle":
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0, 0.4, 0.3],
            }}
            transition={{
              duration: 2,
              delay: shape.delay,
              ease: "easeOut",
            }}
          >
            <div
              className="w-full h-full rounded-full border-4"
              style={{ borderColor: shape.color }}
            />
          </motion.div>
        );

      case "triangle":
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, -180, -360],
              opacity: [0, 0.5, 0.4],
            }}
            transition={{
              duration: 2,
              delay: shape.delay,
              ease: "easeOut",
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full" fill={shape.color}>
              <polygon points="50,10 90,90 10,90" />
            </svg>
          </motion.div>
        );

      case "square":
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.3, 1],
              rotate: [0, 90, 45],
              opacity: [0, 0.5, 0.35],
            }}
            transition={{
              duration: 2,
              delay: shape.delay,
              ease: "easeOut",
            }}
          >
            <div
              className="w-full h-full border-4 rounded-lg"
              style={{ borderColor: shape.color }}
            />
          </motion.div>
        );

      case "line":
        return (
          <motion.div
            key={index}
            style={{
              ...baseStyle,
              height: "6px",
              width: `${shape.size}px`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1.2, 1],
              rotate: [0, 10, -5],
              opacity: [0, 0.6, 0.4],
            }}
            transition={{
              duration: 2,
              delay: shape.delay,
              ease: "easeOut",
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: shape.color }}
            />
          </motion.div>
        );

      case "zigzag":
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 20, 0],
              opacity: [0, 0.5, 0.35],
            }}
            transition={{
              duration: 2,
              delay: shape.delay,
              ease: "easeOut",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              stroke={shape.color}
              strokeWidth="5"
            >
              <path d="M 10,50 L 30,20 L 50,50 L 70,20 L 90,50" />
            </svg>
          </motion.div>
        );

      case "dots":
        return (
          <motion.div
            key={index}
            style={baseStyle}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.3, 1],
              rotate: [0, 360],
              opacity: [0, 0.6, 0.4],
            }}
            transition={{
              duration: 2,
              delay: shape.delay,
              ease: "easeOut",
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="20" cy="20" r="10" fill={shape.color} />
              <circle cx="80" cy="20" r="10" fill={shape.color} />
              <circle cx="20" cy="80" r="10" fill={shape.color} />
              <circle cx="80" cy="80" r="10" fill={shape.color} />
              <circle cx="50" cy="50" r="12" fill={shape.color} />
            </svg>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 3000);
      }}
    >
      {/* Memphis Design Animated Shapes Background */}
      <div className="absolute inset-0">
        {memphisShapes.map((shape, index) => renderMemphisShape(shape, index))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* School Logo/Icon with Memphis Style */}
        <motion.div
          className="relative mx-auto mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.5 }}
        >
          <div className="relative w-32 h-32 mx-auto">
            {/* Layered Memphis circles */}
            <motion.div
              className="absolute inset-0 rounded-full border-8 border-cyan-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-8 border-pink-400"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full bg-white flex items-center justify-center overflow-hidden"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img src={schoolLogo} alt="Logo SMKN 11 Bandung" className="w-full h-full object-contain p-1" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text with Memphis Style */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black text-white mb-4 relative"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
            style={{
              textShadow: "4px 4px 0px rgba(236, 72, 153, 0.5), 8px 8px 0px rgba(59, 130, 246, 0.3)",
            }}
          >
            Jelajah
          </motion.h1>
          <motion.h2
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-300 to-pink-300 relative"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
          >
            SMKN 11 Bandung
          </motion.h2>
        </motion.div>

        {/* Memphis Style Loading Indicator */}
        <motion.div
          className="mt-16 flex justify-center items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="relative"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: ["#3b82f6", "#ec4899", "#06b6d4"][i],
                  boxShadow: `0 4px 12px ${["rgba(59, 130, 246, 0.5)", "rgba(236, 72, 153, 0.5)", "rgba(6, 182, 212, 0.5)"][i]}`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="mt-8 text-blue-100 font-medium text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.7] }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          Memuat pengalaman virtual tour...
        </motion.p>
      </div>

      {/* Decorative Bottom Wave */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 0.3 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-24"
        >
          <path
            d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
            fill="rgba(255, 255, 255, 0.1)"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
