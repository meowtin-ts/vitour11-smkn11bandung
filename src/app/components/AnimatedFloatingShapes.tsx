import { motion } from "motion/react";
import { useDarkMode } from "../contexts/DarkModeContext";

interface Shape {
  id: number;
  type: "circle" | "triangle" | "square" | "line" | "zigzag" | "dots";
  size: number;
  color: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
  rotation: number;
}

export function AnimatedFloatingShapes() {
  const { isDarkMode } = useDarkMode();

  // Memphis Design Color Palette
  const colors = isDarkMode
    ? [
        "#3b82f6", // blue-500
        "#06b6d4", // cyan-500
        "#8b5cf6", // violet-500
        "#ec4899", // pink-500
        "#f59e0b", // amber-500
        "#10b981", // emerald-500
      ]
    : [
        "#60a5fa", // blue-400
        "#22d3ee", // cyan-400
        "#a78bfa", // violet-400
        "#f472b6", // pink-400
        "#fbbf24", // amber-400
        "#34d399", // emerald-400
      ];

  // Generate random shapes with Memphis Design style
  const shapes: Shape[] = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    type: ["circle", "triangle", "square", "line", "zigzag", "dots"][
      Math.floor(Math.random() * 6)
    ] as Shape["type"],
    size: Math.random() * 100 + 30,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 10 + 15,
    rotation: Math.random() * 360,
  }));

  const renderShape = (shape: Shape) => {
    const baseClass = `absolute ${isDarkMode ? "opacity-30" : "opacity-25"}`;
    const style = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
    };

    switch (shape.type) {
      case "circle":
        return (
          <motion.div
            key={shape.id}
            className={baseClass}
            style={style}
            initial={{ rotate: shape.rotation, scale: 0 }}
            animate={{
              rotate: [shape.rotation, shape.rotation + 360],
              scale: [0, 1, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
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
            key={shape.id}
            className={baseClass}
            style={style}
            initial={{ rotate: shape.rotation }}
            animate={{
              rotate: [shape.rotation, shape.rotation - 360],
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill={shape.color}
            >
              <polygon points="50,10 90,90 10,90" />
            </svg>
          </motion.div>
        );

      case "square":
        return (
          <motion.div
            key={shape.id}
            className={baseClass}
            style={style}
            initial={{ rotate: shape.rotation }}
            animate={{
              rotate: [shape.rotation, shape.rotation + 180, shape.rotation],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
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
            key={shape.id}
            className={baseClass}
            style={{
              ...style,
              height: "4px",
              width: `${shape.size * 2}px`,
            }}
            initial={{ rotate: shape.rotation }}
            animate={{
              rotate: [shape.rotation, shape.rotation + 90, shape.rotation],
              x: [0, 50, 0],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
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
            key={shape.id}
            className={baseClass}
            style={style}
            initial={{ rotate: shape.rotation }}
            animate={{
              rotate: [shape.rotation, shape.rotation - 180, shape.rotation],
              y: [0, 40, 0],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              stroke={shape.color}
              strokeWidth="4"
            >
              <path d="M 10,50 L 30,20 L 50,50 L 70,20 L 90,50" />
            </svg>
          </motion.div>
        );

      case "dots":
        return (
          <motion.div
            key={shape.id}
            className={baseClass}
            style={style}
            initial={{ scale: 0 }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="25" cy="25" r="8" fill={shape.color} />
              <circle cx="75" cy="25" r="8" fill={shape.color} />
              <circle cx="25" cy="75" r="8" fill={shape.color} />
              <circle cx="75" cy="75" r="8" fill={shape.color} />
              <circle cx="50" cy="50" r="8" fill={shape.color} />
            </svg>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => renderShape(shape))}
    </div>
  );
}
