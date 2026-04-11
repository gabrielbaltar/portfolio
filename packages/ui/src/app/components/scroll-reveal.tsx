import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  id?: string;
  as?: "div" | "section" | "footer" | "header";
  style?: CSSProperties;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  id,
  as = "div",
  style,
}: ScrollRevealProps) {
  const initial: Record<string, number> = { opacity: 0 };
  const animate: Record<string, number> = { opacity: 1 };

  if (direction === "up") {
    initial.y = 28;
    animate.y = 0;
  } else if (direction === "left") {
    initial.x = -28;
    animate.x = 0;
  } else if (direction === "right") {
    initial.x = 28;
    animate.x = 0;
  }

  const Component = motion[as] as any;

  return (
    <Component
      id={id}
      className={className}
      style={style}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </Component>
  );
}

// Stagger children - wraps children to stagger their animations
interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({ children, className = "", staggerDelay = 0.08 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
