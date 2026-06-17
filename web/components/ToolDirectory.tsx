'use client';

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { toolGroups } from '@/lib/tools';

const INITIAL = 4;

export function ToolDirectory() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? toolGroups : toolGroups.slice(0, INITIAL);
  const hiddenCount = toolGroups.length - INITIAL;

  return (
    <div>
      <ol className="border-t border-line">
        {shown.map((group, i) => (
          <li
            key={group.label}
            className="group grid grid-cols-[auto_1fr] gap-x-5 border-b border-line py-7 transition-colors hover:bg-paper-raised/50 md:gap-x-8"
          >
            <span className="font-mono text-sm tabular-nums text-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  {group.label}
                </h3>
                <span className="font-mono text-xs text-faint">
                  {group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                {group.blurb}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.tools.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent active:translate-y-px"
          >
            {expanded
              ? 'Show fewer categories'
              : `Show all ${toolGroups.length} categories`}
            <CaretDown
              size={15}
              weight="bold"
              className="transition-transform"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            />
          </button>
        </div>
      )}
    </div>
  );
}
