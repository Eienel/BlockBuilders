import {
  ArrowUpRight,
  CheckCircle,
  Circle,
  GithubLogo,
  Key,
  Lock,
  Package,
  Plus,
} from '@phosphor-icons/react/dist/ssr';
import { Reveal } from '@/components/Reveal';
import { RotatingEyebrow } from '@/components/RotatingEyebrow';
import { AnimatedTerminal } from '@/components/AnimatedTerminal';
import { Clients } from '@/components/Clients';
import { SlotImage } from '@/components/SlotImage';
import { ToolDirectory } from '@/components/ToolDirectory';
import { toolCount } from '@/lib/tools';

const GITHUB = 'https://github.com/eienel/suisei';
const NPM_MCP = 'https://www.npmjs.com/package/@suisei-mcp/mcp';
const NPM_SIGNER = 'https://www.npmjs.com/package/@suisei-mcp/agent-signer';
const SUBMIT =
  'https://github.com/eienel/suisei/issues/new?labels=showcase&title=%5BShowcase%5D+';
const BADGE_PKG =
  '0x8dcb044c983362378234c6c12c5b0fb7ae83f81b63b2e2b0a8b38d63b3e5269f';
const BADGE_EXPLORER = `https://suiscan.xyz/testnet/object/${BADGE_PKG}`;

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Clients />
        <Stats />
        <Moat />
        <Security />
        <Tools />
        <Built />
        <Roadmap />
      </main>
      <Footer />
    </>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-semibold tracking-tight">Suisei</span>
          <span
            lang="ja"
            className="text-sm text-faint"
            title="suisei, comet"
          >
            彗星
          </span>
        </a>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a href="#security" className="hidden transition-colors hover:text-ink sm:inline">
            Security
          </a>
          <a href="#tools" className="hidden transition-colors hover:text-ink sm:inline">
            Tools
          </a>
          <a href="#showcase" className="hidden transition-colors hover:text-ink sm:inline">
            Showcase
          </a>
          <a
            href={GITHUB}
            className="flex items-center gap-1.5 transition-colors hover:text-ink"
            aria-label="Suisei on GitHub"
          >
            <GithubLogo size={18} weight="fill" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header
      id="top"
      className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pt-12 pb-14 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pt-20 md:pb-20"
    >
      <div className="min-w-0">
        <RotatingEyebrow />
        <h1 className="mt-5 text-[2.1rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.75rem] lg:leading-[1.04]">
          The Sui Stack as{' '}
          <span className="ink-underline text-accent">one-line tools</span>.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Suisei puts Sui behind the Model Context Protocol, so any AI agent
          can read, build, simulate, sign, and submit on chain. Full portfolio
          visibility, persistent memory, transaction safety, and boundless agent
          autonomy. All non-custodial.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={GITHUB}
            className="btn-shine elevate-accent inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover active:translate-y-0"
          >
            <GithubLogo size={18} weight="fill" />
            Get started on GitHub
          </a>
          <a
            href={NPM_MCP}
            className="elevate-hover group inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-paper-raised px-5 py-3 text-sm font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent active:translate-y-0"
          >
            <Package
              size={18}
              className="transition-transform duration-300 group-hover:-rotate-12"
            />
            View on npm
          </a>
        </div>
      </div>

      {/* Right column: the comet sits above and to the right as a clear
          visual, the terminal below it. They overlap only slightly so the
          comet stays legible. Contained so nothing overflows on mobile. */}
      <Reveal className="relative min-w-0 md:self-start">
        <div
          aria-hidden="true"
          className="float pointer-events-none mx-auto mb-[-1rem] w-full max-w-sm select-none md:mb-[-1.5rem] md:max-w-md"
        >
          <SlotImage
            src="/images/hero-comet-trim.png"
            alt=""
            aspect="653 / 339"
            fit="contain"
            label="comet"
            className="border-0 bg-transparent shadow-none"
          />
        </div>
        <div className="smoke">
          <AnimatedTerminal />
        </div>
      </Reveal>
    </header>
  );
}

function Stats() {
  const stats = [
    { value: toolCount.toString(), label: 'tools, one install', accent: true },
    { value: '2', label: 'packages on npm' },
    { value: '0', label: 'keys held by the toolkit' },
    { value: '100%', label: 'on real testnet' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:py-16">
      <div className="grid grid-cols-2 border-y border-line md:grid-cols-4 md:divide-x md:divide-line">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 70}>
            <div className="px-1 py-8 md:px-7">
              <p
                className={`font-mono text-4xl font-semibold tracking-tight tabular-nums md:text-5xl ${
                  s.accent ? 'text-accent' : 'text-ink'
                }`}
              >
                {s.value}
              </p>
              <p className="mt-3 text-sm leading-snug text-muted">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Moat() {
  const rows = [
    {
      tool: 'agent-first',
      claim: 'The agent builds, not you.',
      detail:
        'Structured JSON in, structured JSON out. No React, no wallet adapter, no human in the build loop.',
    },
    {
      tool: 'sui_get_portfolio',
      claim: 'A whole wallet in one call.',
      detail:
        'Coins, stakes, rewards, and total SUI exposure in a single read. The hand-joined fan-out everyone else writes does not exist here.',
    },
    {
      tool: 'sui_explain_tx',
      claim: 'It looks before it signs.',
      detail:
        'Decode, simulate, and judge any transaction before a key ever touches it. No other Sui SDK ships this.',
    },
    {
      tool: 'mnemosui_*',
      claim: 'Memory that outlives the session.',
      detail:
        'Indexed on Sui, stored on Walrus, portable between clients. The agent remembers what it did and why.',
    },
    {
      tool: 'agent_vault',
      claim: 'Autonomy you can bound.',
      detail:
        'On-chain spend limits, recipient allowlists, and expiry. Hand an agent real funds without handing it your keys.',
    },
    {
      tool: 'MCP',
      claim: 'Any agent, one install.',
      detail:
        'Claude Desktop, Cursor, Claude web and mobile, or your own bot. Not locked to one client, not locked to Sui tooling.',
    },
  ];
  return (
    <section className="border-y border-line bg-paper-raised/40 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-16 gap-y-12 px-5 md:grid-cols-[0.85fr_1.15fr]">
        {/* Left: the thesis. Sticky on desktop so it anchors the list. */}
        <div className="md:sticky md:top-24 md:self-start">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              The difference
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight md:text-[2.6rem]">
              Built for agents,
              <br />
              <span className="text-muted">not for humans</span>
              <br />
              writing app code.
            </h2>
            <p className="mt-6 max-w-sm leading-relaxed text-muted">
              A human SDK hands you primitives and expects you to assemble them.
              Suisei hands the agent the whole Sui Stack as one-line tools, so it
              reasons, decides, and acts on its own.
            </p>
            <div className="elevate mt-8 space-y-px overflow-hidden rounded-xl border border-line text-sm">
              <div className="flex items-center gap-3 bg-paper px-4 py-3">
                <span className="font-mono text-xs text-faint">others</span>
                <span className="text-muted">you assemble the primitives</span>
              </div>
              <div className="flex items-center gap-3 bg-accent-soft px-4 py-3">
                <span className="font-mono text-xs text-accent">suisei</span>
                <span className="font-medium text-ink">the agent assembles itself</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right: editorial numbered rows on hairlines. */}
        <ol className="border-t border-line">
          {rows.map((r, i) => (
            <Reveal key={r.tool} delay={i * 60}>
              <li className="group grid grid-cols-[auto_1fr] gap-x-5 border-b border-line py-6 transition-colors hover:bg-paper/60 md:gap-x-8 md:py-7">
                <span className="font-mono text-sm tabular-nums text-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight md:text-xl">
                      {r.claim}
                    </h3>
                    <code className="font-mono text-xs text-accent">{r.tool}</code>
                  </div>
                  <p className="mt-2 max-w-xl leading-relaxed text-muted">
                    {r.detail}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Security() {
  const rules = [
    {
      icon: Lock,
      title: 'The toolkit never holds keys.',
      body: (
        <>
          Every transaction-building tool returns unsigned{' '}
          <code className="font-mono text-sm text-ink">tx_bytes_base64</code>.
          The host signs, the toolkit submits. A tool that holds a key is a
          tool that can spend money.
        </>
      ),
    },
    {
      icon: Key,
      title: 'Keys never enter an agent.',
      body: (
        <>
          Key generation is not a tool, because that would land the secret in
          the model prompt and logs. Signing lives in{' '}
          <code className="font-mono text-sm text-ink">agent-signer</code>, a
          separate local process.
        </>
      ),
    },
  ];
  return (
    <section id="security" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Non-negotiable
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          A toolkit you would trust an agent with.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Two rules hold the whole design together. They are why an agent can
          act on chain without ever holding the keys that move money.
        </p>
      </Reveal>
      <div className="mt-14 space-y-px">
        {rules.map((rule, i) => {
          const Icon = rule.icon;
          return (
            <Reveal key={rule.title} delay={i * 90}>
              <article className="group grid grid-cols-[auto_1fr] items-start gap-x-6 border-t border-line py-9 md:grid-cols-[auto_auto_1fr] md:gap-x-10 md:py-11">
                <span className="font-mono text-5xl font-semibold leading-none tabular-nums text-line-strong transition-colors group-hover:text-accent md:text-7xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent md:flex">
                  <Icon size={26} weight="duotone" />
                </div>
                <div className="border-l border-line pl-6 md:pl-8">
                  <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
                    {rule.title}
                  </h3>
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                    {rule.body}
                  </p>
                </div>
              </article>
            </Reveal>
          );
        })}
        <div className="border-t border-line" />
      </div>
    </section>
  );
}

function Tools() {
  return (
    <section id="tools" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {toolCount} tools, ready the moment you connect.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Portfolio snapshots. Transaction safety. Persistent agent memory.
          Validator comparisons. Everything agents need to act autonomously. All
          read-only until explicitly signed.
        </p>
      </Reveal>
      <div className="mt-12">
        <ToolDirectory />
      </div>
    </section>
  );
}

function Built() {
  return (
    <section
      id="showcase"
      className="border-t border-line bg-paper-raised/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="elevate smoke flex flex-col items-start gap-6 rounded-2xl border border-line bg-paper-raised px-7 py-12 text-center sm:items-center md:py-16">
            <div className="sm:max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Build the first thing on Suisei.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                The toolkit is live and the canvas is open. Ship something an
                agent does on Sui, then put your name on it.
              </p>
            </div>
            <a
              href={SUBMIT}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine elevate-accent inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover active:translate-y-0"
            >
              <Plus size={17} weight="bold" />
              Submit your project
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Roadmap() {
  const live = [
    'MCP server and non-custodial signer on npm',
    'Remote endpoint, add it to Claude on web and mobile',
    'Soulbound badge module published on Sui testnet',
  ];
  const next = [
    'Mainnet deployment of the badge module',
    'TxLens browser extension, the verdict inline at sign time',
    'TxRiskRegistry, a community signal for risky packages on-chain',
  ];
  return (
    <section id="roadmap" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Where it is, where it goes.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          The toolkit ships today. The path to mainnet and a safer agentic
          web is already mapped.
        </p>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
        <Reveal>
          <div className="border-t-2 border-accent pt-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Live now
            </p>
            <ul className="mt-6 space-y-5">
              {live.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="leading-relaxed text-ink">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={BADGE_EXPLORER}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-accent transition-colors hover:text-accent-hover"
            >
              View the badge package on Suiscan
              <ArrowUpRight size={13} />
            </a>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="border-t-2 border-line pt-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
              Next
            </p>
            <ul className="mt-6 space-y-5">
              {next.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Circle
                    size={20}
                    weight="regular"
                    className="mt-0.5 shrink-0 text-faint"
                  />
                  <span className="leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="font-semibold tracking-tight">Suisei</span>
            <span lang="ja" className="text-sm text-faint" title="suisei, comet">
              彗星
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Sui&apos;s agent toolkit. 彗星 means comet. MIT licensed, built for
            Sui Overflow 2026.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <FooterLink href={GITHUB} icon>
            GitHub
          </FooterLink>
          <FooterLink href={`${GITHUB}#readme`}>How to use</FooterLink>
          <FooterLink href={NPM_MCP}>mcp on npm</FooterLink>
          <FooterLink href={NPM_SIGNER}>agent-signer on npm</FooterLink>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  icon = false,
}: {
  href: string;
  children: React.ReactNode;
  icon?: boolean;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
    >
      {icon && <GithubLogo size={15} weight="fill" />}
      {children}
      <ArrowUpRight size={13} className="text-faint" />
    </a>
  );
}

/* The Suisei mark: the real comet, cropped from the hero render. */
function Mark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/comet-logo.png"
      alt=""
      width={26}
      height={26}
      aria-hidden="true"
      className="h-6 w-6 shrink-0 select-none"
    />
  );
}
