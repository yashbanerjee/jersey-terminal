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
    <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className="inline-flex">
      <Link {...props} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
