# RoadHero

RoadHero is an on-demand roadside assistance and service management platform built with Next.js and TypeScript. It provides separate interfaces for providers (service technicians) and customers, with features for scheduling, tracking, messaging, and revenue management.

## Key Features

- Provider dashboard with job queue, earnings, and settings
- Route tracking and interactive maps for technicians
- In-app messaging and notifications
- Subscription and revenue tracking
- Admin and authentication flows with verification

## Tech Stack

- Next.js (App Router)
- TypeScript
- React
- PostCSS

## Getting Started

Prerequisites:

- Node.js 18+ and a package manager (`npm`, `pnpm`, or `yarn`).

Quick start:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open http://localhost:3000 in your browser.

Project scripts (in `package.json`): `dev`, `build`, `start`, and `lint`.

## Configuration

- Add environment variables required by your integrations (e.g., maps, auth providers) to a `.env.local` file at the project root. Example variables often include `NEXT_PUBLIC_...` keys.

## Project Structure (high level)

- `app/` — Next.js app routes and layouts (customer, provider, admin, auth)
- `src/components/` — Reusable UI components (maps, headers, sidebars, modals)
- `src/hooks/` — Custom React hooks (theme, language)
- `public/` — Static assets

## Contributing

- Open issues or pull requests with clear descriptions.
- Keep changes small and add focused commits.
- Add tests for new features when feasible.

## Credits & Contact

This repository contains the RoadHero frontend. For questions or to contribute, open an issue or contact the maintainers.

## License

No license specified. Add a `LICENSE` file or update this section as appropriate.
