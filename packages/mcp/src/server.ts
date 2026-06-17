/**
 * @suisei-mcp/mcp - server factory.
 *
 * Builds the Suisei MCP server with the full Sui-stack tool registry.
 * Transport is chosen by the entrypoint: `index.ts` (stdio) for local
 * hosts like Claude Desktop and Cursor; `http.ts` (Streamable HTTP) for
 * remote hosts like Claude's Custom Connectors (web + mobile). Both call
 * createServer() so there is exactly one tool registry.
 *
 * Write tools never hold keys - they return unsigned tx bytes for the
 * host to sign, then sui_execute_signed_tx submits the signed result.
 *
 * The server identifies itself as "suisei" over the MCP protocol; tool
 * names keep the sui_ prefix because they wrap the Sui chain, not the
 * Suisei brand. Suisei is the agent toolkit; Sui is the chain it speaks.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { suiResolveAddress } from './tools/sui_resolve_address.js';
import { suiGetBalance } from './tools/sui_get_balance.js';
import { suiGetAllBalances } from './tools/sui_get_all_balances.js';
import { suiGetObject } from './tools/sui_get_object.js';
import { suiGetOwnedObjects } from './tools/sui_get_owned_objects.js';
import { suiGetOwnedBadges } from './tools/sui_get_owned_badges.js';
import { suiGetCoins } from './tools/sui_get_coins.js';
import { suiGetTransaction } from './tools/sui_get_transaction.js';
import { suiGetReferenceGasPrice } from './tools/sui_get_reference_gas_price.js';
import { suiGetDynamicFields } from './tools/sui_get_dynamic_fields.js';
import { suiGetStakes } from './tools/sui_get_stakes.js';
import { suiGetValidatorsApy } from './tools/sui_get_validators_apy.js';
import { suiGetValidators } from './tools/sui_get_validators.js';
import { suiMintBadge } from './tools/sui_mint_badge.js';
import { suiMoveCall } from './tools/sui_move_call.js';
import { suiTransfer } from './tools/sui_transfer.js';
import { suiStake } from './tools/sui_stake.js';
import { suiUnstake } from './tools/sui_unstake.js';
import { suiDeepbookQuote } from './tools/sui_deepbook_quote.js';
import { suiDeepbookSwap } from './tools/sui_deepbook_swap.js';
import { suiQueryEvents } from './tools/sui_query_events.js';
import { suiGetCoinMetadata } from './tools/sui_get_coin_metadata.js';
import { suiResolveCoin } from './tools/sui_resolve_coin.js';
import { suiGetValidator } from './tools/sui_get_validator.js';
import { suiPayMany } from './tools/sui_pay_many.js';
import { suiDecodeTxBytes } from './tools/sui_decode_tx_bytes.js';
import { agentWalletFund } from './tools/agent_wallet_fund.js';
import { agentWalletSweep } from './tools/agent_wallet_sweep.js';
import { agentWalletStatus } from './tools/agent_wallet_status.js';
import { agentVaultCreate } from './tools/agent_vault_create.js';
import { agentVaultDeposit } from './tools/agent_vault_deposit.js';
import { agentVaultGrantPolicy } from './tools/agent_vault_grant_policy.js';
import { agentVaultSpend } from './tools/agent_vault_spend.js';
import { agentVaultStatus } from './tools/agent_vault_status.js';
import { suiDryRun } from './tools/sui_dry_run.js';
import { suiExplainTx } from './tools/sui_explain_tx.js';
import { suiGetPortfolio } from './tools/sui_get_portfolio.js';
import { suiExecuteSignedTx } from './tools/sui_execute_signed_tx.js';
import { walrusPublish } from './tools/walrus_publish.js';
import { walrusFetch } from './tools/walrus_fetch.js';
import { mnemosuiCreate } from './tools/mnemosui_create.js';
import { mnemosuiSave } from './tools/mnemosui_save.js';

export const PKG_VERSION = '0.1.0';

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodObject<z.ZodRawShape>;
  handler: (args: unknown) => Promise<string>;
}

/** Shared network selector - every tool defaults to testnet. */
const networkSchema = z
  .enum(['testnet', 'mainnet', 'devnet'])
  .default('testnet')
  .describe('Sui network to query.');

const tools: ToolDef[] = [
  {
    name: 'sui_resolve_address',
    description:
      'Resolve a Sui address from a SuiNS name (e.g. "alice.sui") or echo back a 0x address if already canonical. Use this whenever the user gives you a human-readable name.',
    inputSchema: z.object({
      name_or_address: z.string().describe('A SuiNS name or 0x... address.'),
      network: networkSchema,
    }),
    handler: suiResolveAddress,
  },
  {
    name: 'sui_get_balance',
    description:
      'Get the SUI balance of an address. Returns balance in MIST (1 SUI = 10^9 MIST) and a human-readable SUI value.',
    inputSchema: z.object({
      address: z.string().describe('A 0x Sui address.'),
      network: networkSchema,
    }),
    handler: suiGetBalance,
  },
  {
    name: 'sui_get_all_balances',
    description:
      'List every coin balance an address holds (not just SUI). Returns coin type, balance in MIST, and object count per coin. Use when a wallet may hold tokens beyond the native coin.',
    inputSchema: z.object({
      address: z.string().describe('A 0x Sui address.'),
      network: networkSchema,
    }),
    handler: suiGetAllBalances,
  },
  {
    name: 'sui_get_portfolio',
    description:
      "A wallet's whole financial picture in one read: every coin balance plus every active stake (principal + accrued rewards), with a single SUI-exposure summary (liquid + staked + rewards). Fuses sui_get_all_balances and sui_get_stakes so 'show me my position' is one call instead of a hand-joined fan-out. Read-only. Non-SUI coins come back raw; resolve symbols with sui_get_coin_metadata as needed.",
    inputSchema: z.object({
      address: z.string().describe('Wallet address whose portfolio to summarize.'),
      network: networkSchema,
    }),
    handler: suiGetPortfolio,
  },
  {
    name: 'sui_get_object',
    description:
      "Read any on-chain object: its Move type, owner, version, content fields, and Display metadata. The general read primitive - use it to inspect any object id.",
    inputSchema: z.object({
      object_id: z.string().describe('The 0x object id to read.'),
      network: networkSchema,
    }),
    handler: suiGetObject,
  },
  {
    name: 'sui_get_owned_objects',
    description:
      'List objects owned by an address, optionally filtered to one Move struct type (e.g. "0x2::coin::Coin<0x2::sui::SUI>"). Paginated - pass the returned next_cursor to continue.',
    inputSchema: z.object({
      address: z.string().describe('Wallet address whose objects to list.'),
      struct_type: z
        .string()
        .optional()
        .describe('Fully-qualified Move struct type to filter by.'),
      cursor: z.string().optional().describe('Pagination cursor from a previous call.'),
      limit: z.number().int().min(1).max(50).default(50),
      network: networkSchema,
    }),
    handler: suiGetOwnedObjects,
  },
  {
    name: 'sui_get_owned_badges',
    description:
      "Lists Suisei badges (soulbound quest-completion NFTs) owned by an address. Each badge proves the user completed a specific Suisei quest. Useful for showing a wallet's curriculum progress.",
    inputSchema: z.object({
      address: z.string().describe('Wallet address whose badges to list.'),
      badge_package: z
        .string()
        .optional()
        .describe(
          'Badge package id (the Move package with the badge module). Defaults to the canonical Suisei package on the chosen network.',
        ),
      network: networkSchema,
    }),
    handler: suiGetOwnedBadges,
  },
  {
    name: 'sui_get_coins',
    description:
      'List individual coin objects of one type held by an address (not a summed balance). Returns the concrete coin_object_id values an agent needs to spend or split in a transaction. Defaults to native SUI; pass coin_type for any other coin. Paginated.',
    inputSchema: z.object({
      address: z.string().describe('Wallet address whose coins to list.'),
      coin_type: z
        .string()
        .optional()
        .describe('Fully-qualified coin type, e.g. "0x2::sui::SUI". Defaults to SUI.'),
      cursor: z.string().optional().describe('Pagination cursor from a previous call.'),
      limit: z.number().int().min(1).max(50).default(50),
      network: networkSchema,
    }),
    handler: suiGetCoins,
  },
  {
    name: 'sui_get_transaction',
    description:
      'Fetch a finalized transaction by digest: execution status, gas used, balance changes, and event count. Use to inspect the result of a transaction submitted earlier (the digest sui_execute_signed_tx returns).',
    inputSchema: z.object({
      digest: z.string().describe('The transaction digest to look up.'),
      network: networkSchema,
    }),
    handler: suiGetTransaction,
  },
  {
    name: 'sui_get_reference_gas_price',
    description:
      'Get the current reference gas price (in MIST) for the network. Use to estimate fees or set a gas price before building a transaction.',
    inputSchema: z.object({
      network: networkSchema,
    }),
    handler: suiGetReferenceGasPrice,
  },
  {
    name: 'sui_get_dynamic_fields',
    description:
      'List the dynamic fields attached to a parent object - how Sui stores Tables, Bags, and other on-chain collections. Returns each field name, type, and child object id. Paginated.',
    inputSchema: z.object({
      parent_id: z.string().describe('Object id whose dynamic fields to list.'),
      cursor: z.string().optional().describe('Pagination cursor from a previous call.'),
      limit: z.number().int().min(1).max(50).optional(),
      network: networkSchema,
    }),
    handler: suiGetDynamicFields,
  },
  {
    name: 'sui_get_stakes',
    description:
      "List an address's active native stakes, grouped by validator. For each StakedSui returns the principal, the rewards accrued so far (estimated), the activation epoch, and the staked_sui_id you pass to sui_unstake. Read-only. Use this to show a wallet's staking positions and earned rewards.",
    inputSchema: z.object({
      address: z.string().describe('Wallet address whose stakes to list.'),
      network: networkSchema,
    }),
    handler: suiGetStakes,
  },
  {
    name: 'sui_get_validators_apy',
    description:
      'Current APY for active validators, as the network computes it from recent epoch rewards. Read-only. apy is a fraction (0.041 = 4.1%), with apy_percent for display. Pass validator for one, sort=true to rank highest-first, limit to cap. This is the APR feed for picking a validator before sui_stake.',
    inputSchema: z.object({
      validator: z
        .string()
        .optional()
        .describe('Filter to a single validator 0x address.'),
      sort: z.boolean().optional().describe('Sort highest APY first.'),
      limit: z.number().int().min(1).max(150).optional().describe('Cap the number returned.'),
      network: networkSchema,
    }),
    handler: suiGetValidatorsApy,
  },
  {
    name: 'sui_get_validators',
    description:
      'The active validator set plus epoch context (epoch number, duration, total stake). For each validator: name, staking address (what sui_stake expects), commission rate, and total stake. Read-only, sorted largest-first. Match validator_address against sui_get_validators_apy to render a full validator picker.',
    inputSchema: z.object({
      limit: z.number().int().min(1).max(150).optional().describe('Cap the number returned.'),
      network: networkSchema,
    }),
    handler: suiGetValidators,
  },
  {
    name: 'sui_get_validator',
    description:
      "One validator with APY merged: name, address, commission, total stake, voting power, project URL, and the live APY the chain computes from recent rewards. Fuses sui_get_validators + sui_get_validators_apy into a single read so a staking app doesn't join them by hand.",
    inputSchema: z.object({
      validator_address: z.string().describe('Validator 0x address.'),
      network: networkSchema,
    }),
    handler: suiGetValidator,
  },
  {
    name: 'sui_query_events',
    description:
      'Query historical Move events. Powers reactive agents - react to swaps, mints, transfers, anything that emits an event. Filter by event_type (full type), package+module (both required together), sender, or transaction. Paginated; pass back next_cursor_tx_digest + next_cursor_event_seq to continue. At least one filter is required.',
    inputSchema: z.object({
      event_type: z.string().optional().describe('Full Move event type, e.g. "0x2::coin::CurrencyCreated<0x2::sui::SUI>".'),
      package: z.string().optional().describe('Package id to filter by.'),
      module: z.string().optional().describe('Module name (must accompany package).'),
      sender: z.string().optional().describe('Address that emitted the event.'),
      transaction: z.string().optional().describe('Transaction digest to filter to.'),
      cursor_tx_digest: z.string().optional().describe('Pagination cursor from a previous call.'),
      cursor_event_seq: z.string().optional().describe('Pagination cursor from a previous call.'),
      limit: z.number().int().min(1).max(50).optional(),
      descending: z.boolean().optional().describe('Default true (newest first).'),
      network: networkSchema,
    }),
    handler: suiQueryEvents,
  },
  {
    name: 'sui_get_coin_metadata',
    description:
      "Live coin metadata: symbol, name, decimals, description, icon URL. Pass coin_type ('0x...') or symbol ('USDC'); a symbol resolves via the local registry first. Decimals are critical for every DeFi flow - '5 USDC' = 5e6 smallest units (6 decimals), not 5e9.",
    inputSchema: z.object({
      coin_type: z.string().optional().describe('Fully-qualified coin type.'),
      symbol: z.string().optional().describe('Symbol to look up in the local registry (e.g. "USDC").'),
      network: networkSchema,
    }),
    handler: suiGetCoinMetadata,
  },
  {
    name: 'sui_resolve_coin',
    description:
      'Resolve a coin symbol (e.g. "USDC", "DEEP", "SUI") to its fully-qualified coin type on the chosen network, or - with no symbol - list every known symbol. Stops agents from hallucinating coin types.',
    inputSchema: z.object({
      symbol: z.string().optional().describe('Symbol to resolve. Omit to list known symbols.'),
      network: networkSchema,
    }),
    handler: suiResolveCoin,
  },
  {
    name: 'sui_mint_badge',
    description:
      'Build (do not execute) a PTB that mints a Suisei completion badge to a recipient. Returns base64 tx bytes; the caller signs and submits separately. Use this when an agent wants to issue its own badges through the canonical badge module.',
    inputSchema: z.object({
      recipient: z.string().describe('0x address receiving the badge.'),
      quest_id: z
        .string()
        .describe('Quest identifier, e.g. "zklogin", "sponsored".'),
      quest_number: z.number().int().min(1).max(255),
      badge_package: z.string(),
      network: networkSchema,
    }),
    handler: suiMintBadge,
  },
  {
    name: 'sui_move_call',
    description:
      'Build (do not sign) a transaction calling ANY Move entry function - the universal write primitive. Each argument is a string: "object:<id>", or "pure:<type>:<value>" where type is address|id|bool|string|u8|u16|u32|u64|u128|u256. Vectors/structs are out of scope; use a dedicated tool for those. Returns base64 tx bytes.',
    inputSchema: z.object({
      target: z
        .string()
        .describe('Move target as "0xpkg::module::function".'),
      type_arguments: z
        .array(z.string())
        .default([])
        .describe('Type arguments for generic functions, e.g. ["0x2::sui::SUI"].'),
      arguments: z
        .array(z.string())
        .default([])
        .describe('Encoded call arguments, e.g. ["object:0xabc", "pure:u64:100"].'),
      sender: z.string().describe('0x address that will sign and pay for the tx.'),
      network: networkSchema,
    }),
    handler: suiMoveCall,
  },
  {
    name: 'sui_transfer',
    description:
      'Build (do not sign) a transfer. Provide amount_mist to send SUI (split from gas) and/or object_ids to send whole objects to a recipient. Returns base64 tx bytes.',
    inputSchema: z.object({
      sender: z.string().describe('0x address sending and paying for the tx.'),
      recipient: z.string().describe('0x address receiving the funds/objects.'),
      amount_mist: z
        .string()
        .optional()
        .describe('Amount of SUI to send, in MIST (as a string to avoid precision loss).'),
      object_ids: z
        .array(z.string())
        .optional()
        .describe('Object ids to transfer whole.'),
      network: networkSchema,
    }),
    handler: suiTransfer,
  },
  {
    name: 'sui_pay_many',
    description:
      'Build (do not sign) a batch SUI payout in one PTB: split N coins from gas and send each to its matching recipient. Powers airdrops, payroll, refunds, splitters. recipients and amounts_mist must be the same length and order. All payouts settle atomically.',
    inputSchema: z.object({
      sender: z.string().describe('0x address sending and paying for the tx.'),
      recipients: z.array(z.string()).describe('Recipient 0x addresses, one per amount.'),
      amounts_mist: z
        .array(z.string())
        .describe('Amounts in MIST (as strings), same length and order as recipients.'),
      network: networkSchema,
    }),
    handler: suiPayMany,
  },
  {
    name: 'sui_stake',
    description:
      'Build (do not sign) a native staking tx: split amount_mist from gas and delegate to a validator via 0x3::sui_system. Returns base64 tx bytes; the resulting StakedSui object lands in the sender once signed.',
    inputSchema: z.object({
      sender: z.string().describe('0x address staking and paying for the tx.'),
      amount_mist: z.string().describe('Amount to stake, in MIST (as a string).'),
      validator: z.string().describe('0x address of the validator to delegate to.'),
      network: networkSchema,
    }),
    handler: suiStake,
  },
  {
    name: 'sui_unstake',
    description:
      'Build (do not sign) a withdraw-stake tx for a StakedSui object via 0x3::sui_system. Returns base64 tx bytes; principal plus rewards return to the sender once signed.',
    inputSchema: z.object({
      sender: z.string().describe('0x address that owns the StakedSui and pays for the tx.'),
      staked_sui_id: z.string().describe('Object id of the StakedSui to withdraw.'),
      network: networkSchema,
    }),
    handler: suiUnstake,
  },
  {
    name: 'sui_deepbook_quote',
    description:
      'Read-only DeepBook v3 quote (no gas, no signing). Given an input amount and direction, returns the expected output and the DEEP fee required, so you can size min_out before calling sui_deepbook_swap. Pass a known pool key (e.g. "SUI_DBUSDC" testnet, "SUI_USDC" mainnet) or explicit pool_id + base_type + quote_type. amount is raw smallest-units; all outputs are raw smallest-units too.',
    inputSchema: z.object({
      direction: z
        .enum(['base_to_quote', 'quote_to_base'])
        .describe('Quote selling the base coin for quote, or quote for base.'),
      amount: z.string().describe('Input amount in the coin\'s smallest unit (as a string).'),
      pool: z.string().optional().describe('Known pool key for the network (e.g. SUI_DBUSDC).'),
      pool_id: z.string().optional().describe('Pool object id (overrides the pool key).'),
      base_type: z.string().optional().describe('Base coin type (required with pool_id).'),
      quote_type: z.string().optional().describe('Quote coin type (required with pool_id).'),
      deepbook_package: z.string().optional().describe('Override the DeepBook package id.'),
      network: networkSchema,
    }),
    handler: suiDeepbookQuote,
  },
  {
    name: 'sui_deepbook_swap',
    description:
      'Build (do not sign) a DeepBook v3 market swap - the universal liquidity primitive. Pass a known pool key (e.g. "SUI_DBUSDC" on testnet, "SUI_USDC" on mainnet) or explicit pool_id + base_type + quote_type. amount and min_out are raw smallest-unit strings (caller handles decimals and slippage). DeepBook charges fees in DEEP: whitelisted pools take deep_amount "0", others require the sender to hold DEEP. Returns base64 tx bytes.',
    inputSchema: z.object({
      sender: z.string().describe('0x address that will sign, pay, and receive the output.'),
      direction: z
        .enum(['base_to_quote', 'quote_to_base'])
        .describe('Swap the base coin for the quote coin, or vice versa.'),
      amount: z.string().describe('Input amount in the coin\'s smallest unit (as a string).'),
      min_out: z
        .string()
        .default('0')
        .describe('Minimum acceptable output in smallest units (slippage floor). 0 = no floor.'),
      deep_amount: z
        .string()
        .default('0')
        .describe('DEEP to spend on fees, smallest units. 0 works for whitelisted pools.'),
      pool: z
        .string()
        .optional()
        .describe('Known pool key for the network (e.g. SUI_DBUSDC). Or pass pool_id below.'),
      pool_id: z.string().optional().describe('Pool object id (overrides the pool key).'),
      base_type: z.string().optional().describe('Base coin type (required with pool_id).'),
      quote_type: z.string().optional().describe('Quote coin type (required with pool_id).'),
      deepbook_package: z.string().optional().describe('Override the DeepBook package id.'),
      deep_type: z.string().optional().describe('Override the DEEP coin type.'),
      network: networkSchema,
    }),
    handler: suiDeepbookSwap,
  },
  {
    name: 'agent_wallet_status',
    description:
      "Read an agent wallet's spendable state: native SUI balance, coin object count, and whether it's funded. Read-only. Check this before asking the agent to spend, to confirm the allowance isn't empty. The agent wallet is a normal Sui address the agent controls; its spending power is bounded by this balance.",
    inputSchema: z.object({
      agent: z.string().describe('The agent wallet 0x address.'),
      network: networkSchema,
    }),
    handler: agentWalletStatus,
  },
  {
    name: 'agent_wallet_fund',
    description:
      "Build (do not sign) a tx that funds an agent wallet: split amount_mist from the OWNER's gas and send it to the agent address. The owner signs this with their own wallet - the agent never touches the owner's key. This sets the agent's allowance: its spending power is bounded by what's funded here. Returns base64 tx bytes.",
    inputSchema: z.object({
      owner: z.string().describe("0x address of the owner funding (signs and pays)."),
      agent: z.string().describe('0x address of the agent wallet to fund.'),
      amount_mist: z.string().describe('Amount to fund, in MIST (as a string).'),
      network: networkSchema,
    }),
    handler: agentWalletFund,
  },
  {
    name: 'agent_wallet_sweep',
    description:
      "Build (do not sign) the agent-wallet kill switch: send the agent's entire native SUI balance back to the owner (via the gas-coin leftover), optionally plus specific object_ids. The agent signs this with its own key. Sweeping + not refunding is how an owner revokes a Tier-1 allowance wallet. Returns base64 tx bytes.",
    inputSchema: z.object({
      agent: z.string().describe('0x address of the agent wallet (signs and pays).'),
      owner: z.string().describe('0x address to return funds to.'),
      object_ids: z
        .array(z.string())
        .optional()
        .describe('Optional non-SUI object ids to also return to the owner.'),
      network: networkSchema,
    }),
    handler: agentWalletSweep,
  },
  {
    name: 'agent_vault_create',
    description:
      "Tier 2, step 1. Build (do not sign) a tx that creates a Policy Vault. The OWNER signs it; on success a shared Vault object exists and an OwnerCap lands in the owner's wallet (the authority to deposit, grant/revoke policies, withdraw). The vault is how an agent gets bounded, on-chain-enforced spending power instead of a raw allowance. Returns base64 tx bytes; read the new Vault id and OwnerCap id from the tx effects.",
    inputSchema: z.object({
      owner: z.string().describe('0x address that owns the vault (signs and pays).'),
      vault_package: z
        .string()
        .optional()
        .describe('agent_vault package id (defaults to the canonical Suisei deployment on the network).'),
      network: networkSchema,
    }),
    handler: agentVaultCreate,
  },
  {
    name: 'agent_vault_deposit',
    description:
      "Tier 2, step 2. Build (do not sign) a tx that deposits SUI into a Policy Vault: split amount_mist from the OWNER's gas and join it into the vault balance. Requires the OwnerCap. The owner signs. This is the pool the agent later spends from, never exceeding what is deposited here. Returns base64 tx bytes.",
    inputSchema: z.object({
      owner: z.string().describe('0x address of the owner (signs and pays).'),
      owner_cap_id: z.string().describe('Object id of the OwnerCap from agent_vault_create.'),
      vault_id: z.string().describe('Object id of the shared Vault.'),
      amount_mist: z.string().describe('Amount to deposit, in MIST (as a string).'),
      vault_package: z
        .string()
        .optional()
        .describe('agent_vault package id (defaults to the canonical Suisei deployment).'),
      network: networkSchema,
    }),
    handler: agentVaultDeposit,
  },
  {
    name: 'agent_vault_grant_policy',
    description:
      "Tier 2, step 3 - the moat. Build (do not sign) a tx that grants an agent an ON-CHAIN spending policy on the vault. The OWNER signs it (needs the OwnerCap). The Move contract enforces the policy on every spend: per_tx_limit_mist (max one spend), daily_limit_mist (max per rolling 24h), allowed_recipients (empty = anywhere; non-empty = only these addresses), and expires_at_ms (absolute ms timestamp the policy dies). This is bounded autonomy that does not rely on trusting the agent or its prompt - the chain rejects anything out of bounds. Returns base64 tx bytes.",
    inputSchema: z.object({
      owner: z.string().describe('0x address of the owner (signs and pays).'),
      owner_cap_id: z.string().describe('Object id of the OwnerCap from agent_vault_create.'),
      vault_id: z.string().describe('Object id of the shared Vault.'),
      agent: z.string().describe('0x address of the agent being granted spending power.'),
      per_tx_limit_mist: z.string().describe('Max a single spend can move, in MIST (string).'),
      daily_limit_mist: z.string().describe('Max across a rolling 24h window, in MIST (string).'),
      allowed_recipients: z
        .array(z.string())
        .optional()
        .describe('Allowed recipient 0x addresses. Omit or empty = the agent may send anywhere.'),
      expires_at_ms: z
        .string()
        .describe('Absolute Unix ms timestamp when the policy expires (e.g. Date.now() + 7 days).'),
      vault_package: z
        .string()
        .optional()
        .describe('agent_vault package id (defaults to the canonical Suisei deployment).'),
      network: networkSchema,
    }),
    handler: agentVaultGrantPolicy,
  },
  {
    name: 'agent_vault_spend',
    description:
      "Tier 2, the star. Build (do not sign) a tx where the AGENT spends SUI from the vault to a recipient. The agent signs it with its OWN key (via agent-signer) - the owner's key is never involved. Every check runs on-chain at execution: per-tx limit, 24h rolling daily limit, recipient allowlist, expiry. A spend that breaks the policy aborts; the agent cannot move funds outside the owner's bounds. Dry-run with sui_explain_tx first - an over-limit spend shows as a would-fail simulation before any key touches it. Returns base64 tx bytes.",
    inputSchema: z.object({
      agent: z.string().describe('0x address of the agent (signs with agent-signer and pays gas).'),
      vault_id: z.string().describe('Object id of the shared Vault to spend from.'),
      amount_mist: z.string().describe('Amount to spend, in MIST (as a string).'),
      recipient: z.string().describe('0x address receiving the SUI.'),
      vault_package: z
        .string()
        .optional()
        .describe('agent_vault package id (defaults to the canonical Suisei deployment).'),
      network: networkSchema,
    }),
    handler: agentVaultSpend,
  },
  {
    name: 'agent_vault_status',
    description:
      "Read the live state of a Policy Vault: its SUI balance and, when an agent address is given, that agent's on-chain policy - per-tx limit, daily limit, how much it has already spent in the current 24h window, daily remaining, allowed recipients, and expiry. Read-only. This is the 'show me the guardrails' view - it reads the actual policy the chain will enforce on the next agent_vault_spend.",
    inputSchema: z.object({
      vault_id: z.string().describe('Object id of the shared Vault.'),
      agent: z
        .string()
        .optional()
        .describe("Agent 0x address to read the policy for. Omit to read only the vault balance."),
      network: networkSchema,
    }),
    handler: agentVaultStatus,
  },
  {
    name: 'sui_dry_run',
    description:
      'Simulate a built (unsigned) transaction without spending gas. Returns execution status, gas cost, and balance/object changes. Use to verify a tx-builder result before asking the host to sign it.',
    inputSchema: z.object({
      tx_bytes_base64: z.string().describe('Base64 tx bytes from a tx-builder tool.'),
      network: networkSchema,
    }),
    handler: suiDryRun,
  },
  {
    name: 'sui_decode_tx_bytes',
    description:
      'Decode unsigned tx bytes (from any builder tool) into a structured, human-readable summary: sender, gas data, inputs, and a step-by-step list of commands ("split N MIST from gas", "transfer to 0x...", "call pkg::module::fn(...)"). The "look before you sign" tool - verifies a built tx matches its stated intent. Pure offline decode, no RPC.',
    inputSchema: z.object({
      tx_bytes_base64: z.string().describe('Base64 tx bytes from a builder tool.'),
    }),
    handler: suiDecodeTxBytes,
  },
  {
    name: 'sui_explain_tx',
    description:
      'Look before you sign: take unsigned tx bytes and return a plain-English plan, a no-spend simulation (gas + balance/object changes), an explainable risk rulebook (drains, sweeping calls, fresh/third-party packages, would-fail-on-chain), and a verdict (safe | caution | danger). Folds sui_decode_tx_bytes + sui_dry_run + heuristics into one call so any agent can judge a transaction before a key ever touches it. Set simulate=false for a pure offline read.',
    inputSchema: z.object({
      tx_bytes_base64: z.string().describe('Base64 unsigned tx bytes to explain and judge.'),
      simulate: z
        .boolean()
        .default(true)
        .describe('Run an on-chain dry-run for cost + balance changes. Set false for offline-only.'),
      network: networkSchema,
    }),
    handler: suiExplainTx,
  },
  {
    name: 'sui_execute_signed_tx',
    description:
      'Submit a host-signed transaction. The toolkit holds no keys: the caller signs tx bytes from a builder tool and passes the signature(s) here. Returns the digest and execution effects.',
    inputSchema: z.object({
      tx_bytes_base64: z.string().describe('Base64 tx bytes that were signed.'),
      signatures: z
        .array(z.string())
        .describe('One or more base64 signatures over the tx bytes (usually one).'),
      network: networkSchema,
    }),
    handler: suiExecuteSignedTx,
  },
  {
    name: 'walrus_publish',
    description:
      'Publish a blob to Walrus testnet/mainnet. Returns the Walrus blob id, which is content-addressable and durable. Use this when the user wants to store arbitrary bytes on a decentralized network instead of S3.',
    inputSchema: z.object({
      content: z
        .string()
        .describe('Content to publish. UTF-8 string or base64 if `encoding=base64`.'),
      encoding: z.enum(['utf8', 'base64']).default('utf8'),
      epochs: z
        .number()
        .int()
        .min(1)
        .default(5)
        .describe('How many Walrus epochs to keep the blob alive.'),
      publisher_url: z
        .string()
        .optional()
        .describe('Override the Walrus publisher endpoint.'),
    }),
    handler: walrusPublish,
  },
  {
    name: 'walrus_fetch',
    description:
      'Fetch a blob from Walrus by id. Returns UTF-8 text or base64 bytes depending on `as`.',
    inputSchema: z.object({
      blob_id: z.string().describe('The Walrus blob id returned by walrus_publish.'),
      as: z.enum(['utf8', 'base64']).default('utf8'),
      aggregator_url: z
        .string()
        .optional()
        .describe('Override the Walrus aggregator endpoint.'),
    }),
    handler: walrusFetch,
  },
  {
    name: 'mnemosui_create',
    description:
      'Create a new MemoryBook - an agent brain for persistent memory. The book is transferred to you; memories are indexed on-chain and stored on Walrus. Once you have a book, use mnemosui_save to append memories (after walrus_publish).',
    inputSchema: z.object({
      sender: z.string().describe('0x address creating the MemoryBook.'),
      network: networkSchema,
      mnemosui_package: z
        .string()
        .optional()
        .describe('MnemoSui package id (defaults to canonical on the network).'),
    }),
    handler: mnemosuiCreate,
  },
  {
    name: 'mnemosui_save',
    description:
      'Append a memory to a MemoryBook. Use after walrus_publish: publish content to Walrus, get blob_id, then call this to index it on-chain. The memory belongs to you and can be transferred with the book.',
    inputSchema: z.object({
      memory_book_id: z.string().describe('The 0x object id of the MemoryBook.'),
      sender: z.string().describe('0x address that owns the MemoryBook.'),
      blob_id: z.string().describe('Walrus blob id from walrus_publish.'),
      tag: z.string().describe('Label for the memory (e.g. "conversation", "fact", "plan").'),
      content_hash: z
        .string()
        .optional()
        .describe('Hash of the content (for integrity; optional until Seal is wired in).'),
      network: networkSchema,
      mnemosui_package: z
        .string()
        .optional()
        .describe('MnemoSui package id (defaults to canonical on the network).'),
    }),
    handler: mnemosuiSave,
  },
];

/** Build a fresh MCP server with every Sui-stack tool registered. */
export function createServer(): Server {
  const server = new Server(
    { name: 'suisei', version: PKG_VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = tools.find((t) => t.name === req.params.name);
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${req.params.name}` }],
        isError: true,
      };
    }
    const parsed = tool.inputSchema.safeParse(req.params.arguments ?? {});
    if (!parsed.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Bad arguments for ${tool.name}: ${parsed.error.message}`,
          },
        ],
        isError: true,
      };
    }
    try {
      const text = await tool.handler(parsed.data);
      return { content: [{ type: 'text', text }] };
    } catch (e) {
      return {
        content: [
          {
            type: 'text',
            text: `Tool ${tool.name} failed: ${e instanceof Error ? e.message : String(e)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Minimal Zod -> JSON-Schema converter for the inputs we actually use
 * here. Avoids pulling a 50KB schema library into a server that just
 * needs to describe a handful of flat tool-input objects.
 */
function zodToJsonSchema(schema: z.ZodObject<z.ZodRawShape>): Record<string, unknown> {
  const shape = schema.shape;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [key, field] of Object.entries(shape)) {
    properties[key] = describeField(field);
    if (!(field instanceof z.ZodOptional) && !(field instanceof z.ZodDefault)) {
      required.push(key);
    }
  }
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  };
}

function describeField(field: z.ZodTypeAny): Record<string, unknown> {
  const description = field.description ?? undefined;
  const base = (out: Record<string, unknown>) => (description ? { ...out, description } : out);

  if (field instanceof z.ZodString) return base({ type: 'string' });
  if (field instanceof z.ZodNumber) return base({ type: 'number' });
  if (field instanceof z.ZodBoolean) return base({ type: 'boolean' });
  if (field instanceof z.ZodEnum) {
    return base({ type: 'string', enum: field.options as string[] });
  }
  if (field instanceof z.ZodArray) {
    return base({ type: 'array', items: describeField(field.element as z.ZodTypeAny) });
  }
  if (field instanceof z.ZodOptional) {
    return describeField(field.unwrap());
  }
  if (field instanceof z.ZodDefault) {
    const inner = describeField(field._def.innerType as z.ZodTypeAny);
    return { ...inner, default: field._def.defaultValue() };
  }
  return base({});
}
