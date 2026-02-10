# Scalable Monorepo Boilerplate

A high-scalability monorepo built with Turborepo, featuring Next.js, React Native (Expo), NestJS, and Strapi.

## Architecture

- **apps/web**: Next.js 14+ (App Router), Tailwind CSS, Shadcn/ui, i18n (Arabic/English), Atomic Design.
- **apps/mobile**: React Native (Expo), NativeWind.
- **apps/api**: NestJS (Business Logic).
- **apps/cms**: Strapi (Headless CMS).
- **packages/ui**: Shared React UI components (Shadcn/ui) + Storybook.
- **packages/types**: Shared TypeScript interfaces & Zod schemas.
- **packages/config**: Shared configurations (ESLint, TS, Tailwind).
- **packages/utils**: Shared utility functions.

## Features

- **Monorepo**: Powered by [Turborepo](https://turbo.build).
- **Design System**: Shadcn/ui (Web) & NativeWind (Mobile).
- **Internationalization**: Full RTL/LTR support (Arabic/English) with `next-intl`.
- **Theming**: Dark/Light mode support.
- **Typography**: configured with **Cairo** Google Font.

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   ```
   This will start all apps simultaneously (Web, Mobile, API, CMS).

3. **Build**
   ```bash
   pnpm build
   ```

## Folder Structure

```
/
  apps/
    web/       # Next.js Frontend
    mobile/    # Expo Mobile App
    api/       # NestJS Backend
    cms/       # Strapi Headless CMS
  packages/
    ui/        # Shared UI Components
    config/    # Shared Configurations
    types/     # Shared Types
    utils/     # Shared Utilities
```
