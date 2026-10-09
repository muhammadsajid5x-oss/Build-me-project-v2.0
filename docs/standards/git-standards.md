@'

# Git Standards

## Purpose

This document defines how Git is used in the Build Me Technology project.

The goal is to keep changes organized, traceable, reviewable, and safe to merge.

---

## 1. Branch Naming Standards

Branches must use clear, descriptive names.

### Main Branches

```text
main
development
```

@'

# Branching Strategy

## Purpose

This document defines the Git branching strategy used by Build Me Technology.

The branching strategy is part of the **Git and CI/CD workflow**. It defines how Technology changes move from feature development through integration to release.

## Branching Model

Build Me follows a simple three-stage branching model:

```text
feature/*
     │
     │ Pull Request
     ↓
development
     │
     │ Pull Request
     ↓
main
```
