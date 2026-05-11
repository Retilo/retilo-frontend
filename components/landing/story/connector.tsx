"use client";

import { motion } from "motion/react";

interface ConnectorData {
  from: string;
  to: string;
  line: string;
}

interface ConnectorProps {
  data: ConnectorData;
  idx: number;
}

export function Connector({ data, idx }: ConnectorProps) {
  return (
    <motion.div
      className="s-connector"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="s-step">{`0${idx + 1}.5`}</span>
      <p className="s-thread">
        <em>{data.from}</em> → <em>{data.to}</em>&nbsp;&nbsp;{data.line}
      </p>
      <span className="s-arrow">scroll</span>
    </motion.div>
  );
}
