---
name: repo-map
description: Build a compact regex-based map of source files and top-level symbols. Use for orientation before opening files; not a language server or call graph.
whenToUse: "A quick repository orientation is needed and a full LSP/symbol index is unavailable."
---

# Repo map

```text
Use repo_map on this repository.
```

Returns file paths and top-level functions/classes/types/values with line numbers for JavaScript,
TypeScript, Python, Go, Rust, Java/Kotlin, Swift, Ruby, and PHP.

## Limits

- Regex, not a parser: false positives/negatives.
- Top-level declarations only; no methods, call graph, references, types, or diagnostics.
- For precise navigation use `code-intel`; for full contents use `repomix`.
