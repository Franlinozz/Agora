---
title: Architecture
order: 4
category: Overview
---
Agora uses Solidity contracts, a TypeScript SDK, a Next.js frontend on Vercel, and VM-hosted indexer/daemon services.

Vercel never runs RPC, database, cron, or LLM workloads. API routes proxy to the GCP VM gateway to control cost and reliability.
