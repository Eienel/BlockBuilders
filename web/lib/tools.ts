// The shipped toolkit, grouped for the directory section. Mirrors PLAN.md.
export interface ToolGroup {
  label: string;
  blurb: string;
  tools: string[];
}

export const toolGroups: ToolGroup[] = [
  {
    label: 'Read: balances and coins',
    blurb: 'Resolve names, list coins, read balances, metadata, and a whole-wallet portfolio.',
    tools: [
      'sui_get_balance',
      'sui_get_all_balances',
      'sui_get_portfolio',
      'sui_get_coins',
      'sui_get_coin_metadata',
      'sui_resolve_coin',
    ],
  },
  {
    label: 'Read: objects and chain state',
    blurb: 'Inspect objects, owned sets, dynamic fields, transactions, events.',
    tools: [
      'sui_get_object',
      'sui_get_owned_objects',
      'sui_get_dynamic_fields',
      'sui_get_transaction',
      'sui_query_events',
      'sui_get_reference_gas_price',
      'sui_resolve_address',
    ],
  },
  {
    label: 'Read: staking and validators',
    blurb: 'Validator sets, APYs, and a delegator stake view.',
    tools: [
      'sui_get_validators',
      'sui_get_validator',
      'sui_get_validators_apy',
      'sui_get_stakes',
    ],
  },
  {
    label: 'Build: returns unsigned bytes',
    blurb: 'Every builder returns tx_bytes_base64. The host signs.',
    tools: [
      'sui_transfer',
      'sui_pay_many',
      'sui_move_call',
      'sui_stake',
      'sui_unstake',
      'sui_mint_badge',
    ],
  },
  {
    label: 'DeepBook',
    blurb: 'Quote and build swaps against the on-chain order book.',
    tools: ['sui_deepbook_quote', 'sui_deepbook_swap'],
  },
  {
    label: 'Simulate, submit, inspect',
    blurb: 'Dry-run, decode raw bytes to a plan, explain-and-judge before signing, execute a signed tx.',
    tools: [
      'sui_dry_run',
      'sui_decode_tx_bytes',
      'sui_explain_tx',
      'sui_execute_signed_tx',
    ],
  },
  {
    label: 'Walrus',
    blurb: 'Publish content to and fetch it back from decentralized storage.',
    tools: ['walrus_publish', 'walrus_fetch'],
  },
  {
    label: 'Agent wallet (Tier 1)',
    blurb: 'Fund a bounded allowance, read its status, sweep it back.',
    tools: ['agent_wallet_fund', 'agent_wallet_status', 'agent_wallet_sweep'],
  },
  {
    label: 'Policy Vault (Tier 2)',
    blurb: 'On-chain spending limits the agent cannot exceed: create a vault, fund it, grant per-tx and daily limits with a recipient allowlist and expiry, then let the agent spend within bounds the chain enforces.',
    tools: [
      'agent_vault_create',
      'agent_vault_deposit',
      'agent_vault_grant_policy',
      'agent_vault_spend',
      'agent_vault_status',
    ],
  },
  {
    label: 'MnemoSui: agent memory',
    blurb: 'Create a MemoryBook brain and save persistent memories (indexed on-chain, stored on Walrus).',
    tools: ['mnemosui_create', 'mnemosui_save'],
  },
  {
    label: 'Badges',
    blurb: 'List the soulbound badges an address owns.',
    tools: ['sui_get_owned_badges'],
  },
];

export const toolCount = toolGroups.reduce((n, g) => n + g.tools.length, 0);
