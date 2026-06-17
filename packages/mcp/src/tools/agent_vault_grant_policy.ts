import { Transaction } from '@mysten/sui/transactions';
import { clientFor, type Network } from '../sui-client.js';
import { buildToB64 } from '../tx.js';

interface Args {
  owner: string;
  owner_cap_id: string;
  vault_id: string;
  agent: string;
  per_tx_limit_mist: string;
  daily_limit_mist: string;
  allowed_recipients?: string[];
  expires_at_ms: string;
  network: Network;
  vault_package?: string;
}

/**
 * Tier 2, step 3 - the moat. Build (do not sign) a tx that grants an agent
 * a spending policy on the vault. The owner signs it (needs the OwnerCap).
 *
 * The policy is enforced ON-CHAIN by the Move contract on every spend:
 *   - per_tx_limit_mist : max one spend can move
 *   - daily_limit_mist  : max across a rolling 24h window
 *   - allowed_recipients: empty = anywhere; non-empty = only these addresses
 *   - expires_at_ms     : after this, the policy is dead
 *
 * This is bounded autonomy that does not depend on trusting the agent or
 * its prompt: the chain rejects any spend that breaks the policy.
 */
export async function agentVaultGrantPolicy(raw: unknown): Promise<string> {
  const a = raw as Args;
  const pkg = a.vault_package ?? '0x0'; // Replaced at publish
  const recipients = a.allowed_recipients ?? [];

  const tx = new Transaction();
  tx.setSender(a.owner);
  tx.moveCall({
    target: `${pkg}::agent_vault::grant_policy`,
    arguments: [
      tx.object(a.owner_cap_id),
      tx.object(a.vault_id),
      tx.pure.address(a.agent),
      tx.pure.u64(BigInt(a.per_tx_limit_mist)),
      tx.pure.u64(BigInt(a.daily_limit_mist)),
      tx.pure.vector('address', recipients),
      tx.pure.u64(BigInt(a.expires_at_ms)),
      tx.object('0x6'), // Clock
    ],
  });

  const client = clientFor(a.network);
  const tx_bytes_base64 = await buildToB64(tx, client);

  return JSON.stringify({
    tx_bytes_base64,
    target: `${pkg}::agent_vault::grant_policy`,
    owner: a.owner,
    vault_id: a.vault_id,
    agent: a.agent,
    per_tx_limit_mist: a.per_tx_limit_mist,
    daily_limit_mist: a.daily_limit_mist,
    allowed_recipients: recipients,
    expires_at_ms: a.expires_at_ms,
    network: a.network,
    next_step:
      'Owner signs and submits. The agent can now agent_vault_spend within these limits; the chain enforces them. Revoke any time with the owner-signed revoke (kill switch).',
  });
}
