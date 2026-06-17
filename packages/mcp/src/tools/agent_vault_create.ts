import { Transaction } from '@mysten/sui/transactions';
import { clientFor, type Network } from '../sui-client.js';
import { buildToB64 } from '../tx.js';

interface Args {
  owner: string;
  network: Network;
  vault_package?: string;
}

/**
 * Tier 2, step 1. Build (do not sign) a tx that creates a Policy Vault.
 * The owner signs it; on success a shared Vault object is created and an
 * OwnerCap lands in the owner's wallet. The OwnerCap is the authority to
 * deposit, grant/revoke agent policies, and withdraw.
 *
 * After this: fund it with agent_vault_deposit, then bound an agent with
 * agent_vault_grant_policy. The agent then spends via agent_vault_spend,
 * within limits the chain enforces - the owner's key never goes near it.
 */
export async function agentVaultCreate(raw: unknown): Promise<string> {
  const a = raw as Args;
  const pkg = a.vault_package ?? '0x0'; // Replaced at publish

  const tx = new Transaction();
  tx.setSender(a.owner);
  tx.moveCall({
    target: `${pkg}::agent_vault::create_vault`,
    arguments: [],
  });

  const client = clientFor(a.network);
  const tx_bytes_base64 = await buildToB64(tx, client);

  return JSON.stringify({
    tx_bytes_base64,
    target: `${pkg}::agent_vault::create_vault`,
    owner: a.owner,
    network: a.network,
    next_step:
      'Owner signs and submits. The created tx shares a Vault object and sends you an OwnerCap. Find the Vault id and OwnerCap id in the tx effects (sui_get_transaction), then agent_vault_deposit to fund it.',
  });
}
