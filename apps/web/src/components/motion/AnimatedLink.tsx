"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<typeof Link> & {
  children: ReactNode;
  className?: string;
};

/** Link with a subtle press + underline grow feel. */
export function AnimatedLink({ children, className, ...props }: Props) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="inline-flex"
    >
      <Link {...props} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
