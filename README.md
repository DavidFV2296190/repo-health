# repo-health

A tool for analyzing GitHub repository health, identifying vulnerable dependencies, and understanding contributor impact.

## Features

- **Health Score (0-100)** - Activity, maintenance, community, and documentation scores
- **Dependency Analysis** - Scan for vulnerable packages across multiple ecosystems
- **Related PRs** - Find community fixes for vulnerabilities
- **GitHub OAuth** - Access private repositories

---

## Supported Ecosystems

| Language              | File                                 | Ecosystem | Status  |
| --------------------- | ------------------------------------ | --------- | ------- |
| JavaScript/TypeScript | `package.json`                       | npm       | Working |
| Python                | `requirements.txt`, `pyproject.toml` | PyPI      | Working |
| Go                    | `go.mod`                             | Go        | Working |
| Rust                  | `Cargo.toml`                         | crates.io | Working |
| C++                   | `conanfile.txt`                      | Conan     | Working |
| C#                    | `packages.config`                    | NuGet     | Working |

---

## Tech Stack

**Frontend**: Next.js 16, React 19, Chakra UI  
**Backend**: tRPC, Octokit, Zod  
**Data**: MySQL (Prisma), Redis, OSV API

---

## Project Structure

```
src/
├── app/                      # Next.js pages
├── components/               # UI components
│   ├── cards/               # Stat cards
│   └── dependencies/        # Vulnerability UI
├── server/
│   ├── routers/             # tRPC endpoints
│   ├── services/
│   │   ├── github/          # GitHub API
│   │   ├── deps/            # Dependency analysis
│   │   │   ├── analyze.ts   # Main service
│   │   │   ├── osv.ts       # OSV API
│   │   │   └── parsers/     # Language parsers
│   │   ├── healthScore.ts   # Score calculation
│   │   └── calculations.ts  # Algorithms
│   └── types/               # TypeScript types
├── trpc/                     # tRPC config
└── lib/                      # Redis, Prisma, Auth
```

---

## Roadmap Progress

### Completed (~60%)

- [x] Next.js + tRPC + Prisma setup
- [x] GitHub API integration with caching
- [x] Health Score algorithm
- [x] GitHub OAuth for private repos
- [x] Dependency vulnerability scanning (6 languages)
- [x] Related PRs search
- [x] Issue existence check

### In Progress (~20%)

- [ ] UI polish and responsive design
- [ ] Search functionality in vulnerability table
- [ ] Better error handling

### Planned (~20%)

- [ ] **Issues Analysis** - Find related issues, track issue patterns
- [ ] **PRs Analysis** - Analyze PR patterns, review times, merge rates
- [ ] **Discussions Analysis** - Community engagement metrics
- [ ] Community reports system
- [ ] Setup time estimation
- [ ] More languages (Java/Maven, PHP/Composer)
- [ ] Historical trend charts

---

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run database migrations
npx prisma db push

# Start dev server
npm run dev
```

Required environment variables:

- `DATABASE_URL` - MySQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - Auth secret
- `GITHUB_ID` - GitHub OAuth app ID
- `GITHUB_SECRET` - GitHub OAuth app secret
