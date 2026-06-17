import { Transaction } from '@mysten/sui/transactions';
import { clientFor, type Network } from '../sui-client.js';
import { buildToB64 } from '../tx.js';

interface Args {
  owner: string;
  owner_cap_id: string;
  vault_id: string;
  amount_mist: string;
  network: Network;
  vault_package?: string;
}

/**
 * Tier 2, step 2. Build (do not sign) a tx that deposits SUI into the
 * Policy Vault. The owner signs it: split `amount_mist` from the owner's
 * gas and join it into the vault balance. Requires the OwnerCap.
 *
 * This is the pool the agent later spends from - bounded by the policy,
 * never exceeding what the owner deposits here.
 */
export async function agentVaultDeposit(raw: unknown): Promise<string> {
  const a = raw as Args;
  const pkg = a.vault_package ?? '0x0'; // Replaced at publish

  const tx = new Transaction();
  tx.setSender(a.owner);
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(a.amount_mist))]);
  tx.moveCall({
    target: `${pkg}::agent_vault::deposit`,
    arguments: [tx.object(a.owner_cap_id), tx.object(a.vault_id), coin],
  });

  const client = clientFor(a.network);
  const tx_bytes_base64 = await buildToB64(tx, client);

  return JSON.stringify({
    tx_bytes_base64,
    target: `${pkg}::agent_vault::deposit`,
    owner: a.owner,
    vault_id: a.vault_id,
    amount_mist: a.amount_mist,
    network: a.network,
    next_step:
      'Owner signs and submits. Then bound an agent with agent_vault_grant_policy.',
  });
}
