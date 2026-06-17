'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Cube,
  PaperPlaneTilt,
  Robot,
  Signature,
} from '@phosphor-icons/react';

/*
 * The non-custodial loop, shown as four steps. The key never crosses from
 * the signing step into the agent. Steps reveal in sequence on scroll
 * (opacity/transform only, IntersectionObserver, reduced-motion safe via
 * the .reveal stylesheet).
 */
const STEPS = [
  {
    icon: Robot,
    title: 'Agent asks',
    body: 'The agent calls a tool. No key in sight.',
    highlight: false,
  },
  {
    icon: Cube,
    title: 'Toolkit builds',
    body: 'Returns unsigned tx_bytes_base64.',
    highlight: false,
  },
  {
    icon: Signature,
    title: 'You sign',
    body: 'Locally, in agent-signer. The key stays put.',
    highlight: true,
  },
  {
    icon: PaperPlaneTilt,
    title: 'Toolkit submits',
    body: 'The signed bytes land on chain.',
    highlight: false,
  },
];

export function FlowDiagram() {
  const ref = useRef<HTMLOListElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ol
      ref={ref}
      className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
    >
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <li
            key={step.title}
            className="reveal relative pt-6"
            data-shown={shown ? 'true' : 'false'}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            {/* The step's segment of the rail. Accent on the signing step. */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-0.5 ${
                step.highlight ? 'bg-accent' : 'bg-line'
              }`}
            />
            <div className="flex items-center justify-between">
              <span
                className={`font-mono text-sm tabular-nums ${
                  step.highlight ? 'text-accent' : 'text-faint'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <Icon
                size={22}
                weight="duotone"
                className={step.highlight ? 'text-accent' : 'text-faint'}
              />
            </div>
            <h3
              className={`mt-4 text-base font-semibold tracking-tight ${
                step.highlight ? 'text-accent' : 'text-ink'
              }`}
            >
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {step.body}
            </p>
            {i < STEPS.length - 1 && (
              <ArrowRight
                size={18}
                weight="bold"
                aria-hidden="true"
                className="absolute -right-5 top-7 z-10 hidden text-line-strong lg:block"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
