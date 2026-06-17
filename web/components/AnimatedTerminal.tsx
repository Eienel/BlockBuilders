'use client';

import { useEffect, useRef, useState } from 'react';
import { CopyButton } from './CopyButton';
import { toolCount } from '@/lib/tools';

/*
 * A terminal that cycles through a real Suisei sequence: read, build, sign,
 * submit. Each step types its result, holds, then advances. This is the
 * "carousel of previews" idea, but with genuine tool output rather than
 * fake screenshots. Motion is opacity/transform only and is disabled under
 * prefers-reduced-motion (it then shows the full sequence statically).
 */

interface Step {
  prompt: string;
  tool: string;
  result: string;
}

const STEPS: Step[] = [
  {
    prompt: 'what is the balance of alice.sui?',
    tool: 'sui_get_balance',
    result: `{
  "address": "0x9a1f...c20e",
  "balance": "42.738601200",
  "coin": "SUI"
}`,
  },
  {
    prompt: 'build a tx staking 1 SUI to the top validator',
    tool: 'sui_stake',
    result: `{
  "tx_bytes_base64": "AAACAQDnL2...8gE=",
  "note": "unsigned. the host signs."
}`,
  },
  {
    prompt: 'sign it with my agent key',
    tool: 'agent-signer',
    result: `{
  "signature": "AQ4f9k...Lp2w=="
}`,
  },
  {
    prompt: 'submit it',
    tool: 'sui_execute_signed_tx',
    result: `{
  "digest": "8mР2...kQ",
  "status": "success"
}`,
  },
];

const INSTALL = 'claude mcp add suisei -- npx -y @suisei-mcp/mcp';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function AnimatedTerminal() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return;
    timer.current = setTimeout(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, 2600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, reduced]);

  // Under reduced motion, render every step at once, statically.
  const visible = reduced ? STEPS.map((_, i) => i) : [active];

  return (
    <div className="elevate w-full min-w-0 overflow-hidden rounded-2xl border border-line-strong bg-term-bg font-mono text-[12px] leading-relaxed sm:text-[13px]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
        </div>
        <span className="text-xs text-term-muted">suisei</span>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-term-ink">
            <span className="text-term-teal">$</span> {INSTALL}
          </p>
          <CopyButton value={INSTALL} label="Copy install command" />
        </div>
        <p className="text-term-muted">Added MCP server suisei. {toolCount} tools.</p>

        <div className="relative min-h-[200px] pt-1">
          {STEPS.map((step, i) => (
            <div
              key={i}
              aria-hidden={!visible.includes(i)}
              className={
                reduced
                  ? 'mb-5'
                  : `absolute inset-0 transition-opacity duration-500 ${
                      i === active
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0'
                    }`
              }
            >
              <p className="text-term-muted">
                you:{' '}
                <span className="text-term-ink">{step.prompt}</span>
              </p>
              <p className="mt-2 text-term-blue">{step.tool}</p>
              <pre className="mt-1 whitespace-pre-wrap break-all text-term-ink">
                {step.result}
              </pre>
            </div>
          ))}
        </div>

        {!reduced && (
          <div className="flex gap-1.5 pt-1" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === active
                    ? 'w-6 bg-term-teal'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
