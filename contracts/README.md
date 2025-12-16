# Contracts assembly

- **Invite (`invite.cxc`)**: this repo (`contract/invitono.cpp/hpp`).
- **Bridge (`bridge.cxc`)**: pull https://github.com/currentxchange/Ant-Bridge-Contract into `contracts/bridge` (or add as submodule). Configure oracle accounts and multi-sig per PRD.
- **Token (`tokens.cxc`)**: standard `eosio.token` fork scoped to BLUX on Tonomy; restrict `issue` to `bridge.cxc` (and treasury if needed), support `pause`/`whitelist` hooks if required.

Suggested layout:
```
contracts/
  invite/      # this contract
  bridge/      # cloned Ant-Bridge-Contract
  token/       # eosio.token-based BLUX contract
```

Deploy order: token → bridge (wired to token) → invite (wired to token). Initialize via `init` actions with campaign config and verifier accounts.*** End Patch
