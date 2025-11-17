# GitHub Actions CI/CD Pipeline

This directory contains GitHub Actions workflows for the MelonAI project.

## Workflows

### CI Pipeline (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

1. **Lint** - Runs ESLint to check code quality
2. **Type Check** - Runs TypeScript compiler to check types
3. **Unit Tests** - Runs Vitest unit tests
4. **Build** - Builds the Next.js application
5. **E2E Tests** - Runs Playwright end-to-end tests

**Requirements:**

- Bun runtime (automatically installed via `oven-sh/setup-bun@v2`)
- Playwright browsers (automatically installed)

**Environment Variables:**

The following secrets should be configured in GitHub repository settings:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

For local development, these are loaded from `.env.local`.

## Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches (merge to `develop`)
- `fix/*` - Bug fix branches (merge to `develop`)

## Pull Request Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create PR to `develop`
4. CI pipeline runs automatically
5. Review and merge after CI passes
6. Periodically merge `develop` to `main` for production releases

## Vercel Integration

This project is deployed on Vercel. The CI pipeline runs independently of Vercel's build process.

For E2E tests against Vercel deployments, you can use `repository_dispatch` events:

```yaml
on:
  repository_dispatch:
    types:
      - 'vercel.deployment.success'
```

See [Vercel GitHub Integration docs](https://vercel.com/docs/git/vercel-for-github) for more details.

## Local Testing

Run the same checks locally before pushing:

```bash
# Lint
bun run lint

# Type check
bunx tsc --noEmit

# Unit tests
bun run test

# Build
bun run build

# E2E tests
bun run test:e2e
```

## Troubleshooting

### Build Fails with Missing Environment Variables

Ensure all required secrets are configured in GitHub repository settings under Settings > Secrets and variables > Actions.

### E2E Tests Fail

- Check Playwright report artifact in GitHub Actions
- Run tests locally with `bun run test:e2e:headed` to see browser
- Ensure test environment variables are set

### Bun Installation Issues

The workflow uses `oven-sh/setup-bun@v2` which automatically installs the latest Bun version. If issues occur, you can pin a specific version:

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: 1.1.0
```
