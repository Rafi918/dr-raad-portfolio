# موقع د. رعد ناصر — Academic Portfolio Website

A full-stack personal academic website for **Dr. Raad Nasser**, designed around
the «المخطوط المعاصر» (Contemporary Manuscript) direction: an Arabic editorial
identity inspired by fine academic books and manuscript margins, rebuilt with a
modern digital rhythm.

## Highlights

- **Editorial Arabic design** — ivory paper tones, deep ink blue, and calm copper
  accents; the career is told as a timeline of stations, not data blocks.
- **Asymmetric layout** — a fixed identity/navigation sidebar with archival
  content pages.
- **Full-stack TypeScript** — React client, Node server, and Drizzle ORM schema
  and migrations under `drizzle/`.
- **Design research in-repo** — `ideas.md`, `research-notes.md`, and
  `github-audit.md` document the direction and decisions.

## Structure

| Path | Contents |
|---|---|
| `client/` | Front-end application |
| `server/` | Back-end API |
| `shared/` | Shared types and code |
| `drizzle/` | Database schema and migrations |
| `patches/` | Dependency patches |

## Running locally

```bash
pnpm install
pnpm dev
```

## License

MIT — see `LICENSE` if present, otherwise ask the repository owner.
