import { Transaction } from '@mysten/sui/transactions';
import { clientFor, type Network } from '../sui-client.js';
import { buildToB64 } from '../tx.js';

interface Args {
  agent: string;
  vault_id: string;
  amount_mist: string;
  recipient: string;
  network: Network;
  vault_package?: string;
}

/**
 * Tier 2, the star. Build (do not sign) a tx where the AGENT spends SUI
 * from the vault to a recipient. The agent signs this with its own key
 * (via agent-signer) - the owner's key is never involved.
 *
 * Every check lives in Move and runs on-chain when this executes:
 * per-tx limit, 24h rolling daily limit, recipient allowlist, expiry. A
 * spend that breaks the policy aborts - the agent literally cannot move
 * funds outside the bounds the owner set. That is the difference between
 * "we trust the agent" and "the chain enforces the agent".
 *
 * Dry-run this with sui_explain_tx first: an over-limit spend shows up as
 * a would-fail simulation before a key ever touches it.
 */
export async function agentVaultSpend(raw: unknown): Promise<string> {
  const a = raw as Args;
  const pkg = a.vault_package ?? '0x0'; // Replaced at publish

  const tx = new Transaction();
  tx.setSender(a.agent);
  tx.moveCall({
    target: `${pkg}::agent_vault::spend_sui`,
    arguments: [
      tx.object(a.vault_id),
      tx.pure.u64(BigInt(a.amount_mist)),
      tx.pure.address(a.recipient),
      tx.object('0x6'), // Clock
    ],
  });

  const client = clientFor(a.network);
  const tx_bytes_base64 = await buildToB64(tx, client);

  return JSON.stringify({
    tx_bytes_base64,
    target: `${pkg}::agent_vault::spend_sui`,
    agent: a.agent,
    vault_id: a.vault_id,
    amount_mist: a.amount_mist,
    recipient: a.recipient,
    network: a.network,
    next_step:
      'Agent signs with agent-signer, then sui_execute_signed_tx submits. If the amount breaks the policy (per-tx, daily, recipient, or expiry), the chain aborts the spend.',
  });
}
