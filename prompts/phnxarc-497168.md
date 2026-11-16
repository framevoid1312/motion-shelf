# Air-gapped PSP crypto wallet vault and offline signing demo

**#1279 by popularity** · ♥ 25 · 1,549 views · by [@PhnxArc](https://x.com/PhnxArc) · [Original post](https://x.com/PhnxArc/status/2116134729057497168) · [Watch the video](https://video.twimg.com/amplify_video/2116134572106698752/vid/avc1/1920x1080/M5XY6NcqUzCeAPgE.mp4)

[![Air-gapped PSP crypto wallet vault and offline signing demo](https://pbs.twimg.com/amplify_video_thumb/2116134572106698752/img/DT4NBFD2U8zD6B35.jpg)](https://x.com/PhnxArc/status/2116134729057497168)

## Prompt

```text
Build 'PSP-Vault': a bare-metal, air-gapped hardware crypto wallet firmware (EBOOT.PBP) for Sony PSP (MIPS R4000 CPU, 480x272 screen, 32MB RAM) using PSPSDK in pure C. Zero network libraries, zero WLAN drivers loaded.

Entropy & Keys: Generate 256 bits of entropy by capturing microsecond hardware timer jitter across 256 physical button presses and analog stick movements. Implement clean BIP-39 (24-word mnemonic), BIP-32/BIP-44 hierarchical deterministic derivation, and secp256k1 + ed25519 signing for BTC, ETH, and SOL.

Verification First: Before building the PSP binary, write and run a host C test that verifies 100 test vectors for BIP-39 seed generation, private key derivation, and ECDSA/EdDSA signatures against standard reference outputs. Do not proceed until 100% pass.

Storage & Encryption: Encrypt the master seed on the Memory Stick (ms0:/PSP/SAVEDATA/VAULT/) using AES-256-GCM derived from a physical button-combo PIN (D-pad + face buttons, minimum 8 inputs) via PBKDF2. Wipe all plaintext key material from RAM immediately after signing using volatile zeroing.

Offline Transaction Signing: Read unsigned raw transactions (JSON/hex) from a dedicated transfer folder on the Memory Stick, parse destination address, amount, chain ID, and gas/fee on screen for human verification, require a physical 3-second hold on R-Trigger + X to sign, and output the signed hex + on-screen QR code.

UI (480x272 @ 60fps via PSP GU): Clean dark-mode terminal aesthetic. Show live entropy progress bar during button mashing, paginated 24-word seed verification test, address viewer with QR rendering, and transaction inspector. Pressing L+R simultaneously immediately zeroes RAM and locks the vault.

Memory & Security Audit: Keep total RAM footprint under 4MB so it runs on both PSP-1000 (32MB) and PSP-2000/3000 (64MB). Run a separate security review agent to check for buffer overflows, side-channel leaks, and unzeroed heap allocations.

Compile the final EBOOT.PBP inside Docker (pspdev/pspdev) and give me the exact steps to copy it to the PSP over USB.
```

The prompt and video belong to @PhnxArc; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
