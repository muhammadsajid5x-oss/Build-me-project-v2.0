# Technology Architecture

## Purpose

This document explains the high-level architecture of the Build Me Technology system.

## Repository Architecture

Build Me uses a monorepo structure managed with PNPM and TurboRepo.

```text
build-me/
├── apps/
│   ├── web/
│   └── dashboard/
├── services/
│   └── api/
├── packages/
│   ├── ui/
│   ├── types/
│   └── ...
├── database/
├── tests/
├── scripts/
├── docs/
└── .github/
    └── workflows/
```
