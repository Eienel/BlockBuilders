import { clientFor, type Network } from '../sui-client.js';

interface Args {
  vault_id: string;
  agent?: string;
  network: Network;
}

const toSui = (mist: string | number | bigint) => Number(BigInt(mist)) / 1e9;

/** Pull a nested field out of a Sui object content shape, tolerantly. */
function field(obj: any, ...keys: string[]): any {
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

/**
 * Read the live state of a Policy Vault: its SUI balance and, if an agent
 * address is given, that agent's on-chain policy - per-tx limit, daily
 * limit, how much it has already spent in the current 24h window, the
 * allowed recipients, and when the policy expires. Read-only.
 *
 * This is the "show me the guardrails" view: it reads the actual policy
 * the chain will enforce on the next agent_vault_spend, not a copy.
 */
export async function agentVaultStatus(raw: unknown): Promise<string> {
  const a = raw as Args;
  const client = clientFor(a.network);

  const vault = await client.getObject({
    id: a.vault_id,
    options: { showContent: true },
  });
  const content: any = vault.data?.content;
  if (!content || content.dataType !== 'moveObject') {
    return JSON.stringify({
      vault_id: a.vault_id,
      network: a.network,
      error: 'Vault object not found or not a Move object. Check the id and network.',
    });
  }

  // Balance<SUI> renders as a bare u64 string in content.
  const rawBalance = field(content, 'fields', 'balance');
  const balanceMist =
    typeof rawBalance === 'string'
      ? rawBalance
      : String(field(rawBalance, 'fields', 'value') ?? rawBalance?.value ?? '0');

  const tableId = field(content, 'fields', 'policies', 'fields', 'id', 'id');

  const result: Record<string, unknown> = {
    vault_id: a.vault_id,
    network: a.network,
    balance_mist: balanceMist,
    balance_sui: toSui(balanceMist),
  };

  if (a.agent && tableId) {
    try {
      const policyField = await client.getDynamicFieldObject({
        parentId: tableId,
        name: { type: 'address', value: a.agent },
      });
      const pc: any = policyField.data?.content;
      const p = field(pc, 'fields', 'value', 'fields') ?? field(pc, 'fields', 'value');
      if (p) {
        const perTx = p.per_tx_limit ?? '0';
        const daily = p.daily_limit ?? '0';
        const dailySpent = p.daily_spent_mist ?? '0';
        const expiresAt = Number(p.expires_at_ms ?? '0');
        result.policy = {
          has_policy: true,
          agent: a.agent,
          per_tx_limit_mist: String(perTx),
          per_tx_limit_sui: toSui(perTx),
          daily_limit_mist: String(daily),
          daily_limit_sui: toSui(daily),
          daily_spent_mist: String(dailySpent),
          daily_spent_sui: toSui(dailySpent),
          daily_remaining_sui: toSui(BigInt(daily) - BigInt(dailySpent)),
          allowed_recipients: p.allowed_recipients ?? [],
          expires_at_ms: expiresAt,
          expired: expiresAt > 0 && expiresAt <= Date.now(),
        };
      } else {
        result.policy = { has_policy: false, agent: a.agent };
      }
    } catch {
      result.policy = {
        has_policy: false,
        agent: a.agent,
        note: 'No policy found for this agent on this vault.',
      };
    }
  }

  result.note =
    'balance is what the agent can draw from, bounded by its policy. The chain enforces per_tx_limit, daily_limit, allowed_recipients, and expiry on every agent_vault_spend.';

  return JSON.stringify(result);
}
