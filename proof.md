# Onchain Proof of Ownership

This repository binds the GitHub account **smuddassirshah-cpu** to the Ethereum
address below via two independent proofs: an EIP-191 signature and a Sepolia
transaction.

## Bound Identity

- **GitHub handle:** `smuddassirshah-cpu`
- **Ethereum address:** `0xe6b19725C56a9d8BF1b5216Bf97b312253f12b63`

## Proof (a): EIP-191 Signature

The address above signed the following message using `personal_sign`
(EIP-191):

```
github.com/smuddassirshah-cpu
```

- **Signature:**
  `0x29b949256beeb5116763549cb56076f9ac34eb0b5e99bbcb95ecbdc5189e2c213297c40083d722c5c65137cc9d7c4be2207c04909a548b0847d42a2ad590a95f1b`

Verify with [Foundry's `cast`](https://book.getfoundry.sh/reference/cast/):

```bash
cast wallet verify \
  0xe6b19725C56a9d8BF1b5216Bf97b312253f12b63 \
  "github.com/smuddassirshah-cpu" \
  0x29b949256beeb5116763549cb56076f9ac34eb0b5e99bbcb95ecbdc5189e2c213297c40083d722c5c65137cc9d7c4be2207c04909a548b0847d42a2ad590a95f1b
```

## Proof (b): Sepolia Transaction Calldata

The same address sent a self-transaction on Sepolia testnet whose calldata is
the UTF-8-encoded string above.

- **Transaction hash:**
  `0x2ff5c770672287229c22c49a040cc8f0798d609b8f9ce670bd211391af7a5cb3`
- **Network:** Sepolia (chain ID `11155111`)

Verify with `cast`, using a public RPC endpoint:

```bash
cast tx 0x2ff5c770672287229c22c49a040cc8f0798d609b8f9ce670bd211391af7a5cb3 \
  input \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  | xargs cast to-utf8
```

The decoded output should read `github.com/smuddassirshah-cpu`. Cross-check
that the transaction's `from` field equals
`0xe6b19725C56a9d8BF1b5216Bf97b312253f12b63`:

```bash
cast tx 0x2ff5c770672287229c22c49a040cc8f0798d609b8f9ce670bd211391af7a5cb3 \
  from \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```
