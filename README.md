# Repo Map for DSH

> A compact, regex-based repository orientation map. No language server, no type resolution, no call
> graph. For precise navigation use `dsh-code-intel`; for full contents use `dsh-repomix`.

## Use

```bash
node bin/dsh-repo-map.mjs . --json --output map.json
node bin/dsh-repo-map.mjs . --max-files 300
```

In DSH:

```text
Use repo_map on this repository.
```

## Limits

- Regex heuristics, not a parser
- Top-level symbols only
- No methods/call graph/references/types
- No network

## Tests

```bash
npm test
```

## Provenance

A small independent map. License: MIT.
