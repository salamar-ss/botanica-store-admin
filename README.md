# Botanica Admin Dashboard

A modern, responsive admin dashboard for an online store, built with React and TypeScript. This portfolio project demonstrates modern frontend architecture, API integration, data management, form validation, and testing.

**Live Demo:** https://botanica-store-admin.vercel.app/ 
**Repository:** https://github.com/salamar-ss/botanica-store-admin

## Overview

Botanica Admin Dashboard is an admin interface designed to demonstrate practical React development skills through a realistic e-commerce management workflow.

The application combines reusable UI components, typed API services, client-side routing, asynchronous server state management, form validation, and a demo authentication flow.

## Features

- **Dashboard:** Overview page with reusable metric cards.
- **Product Management:** Product listing and CRUD demonstration.
- **Category Management:** Category data retrieval and management interface.
- **API Integration:** HTTP requests handled through Axios.
- **Server State Management:** Data fetching, caching, and query invalidation with TanStack Query.
- **Routing:** Client-side navigation and protected admin routes with React Router.
- **Forms and Validation:** Form handling with React Hook Form and schema validation with Zod.
- **Demo Authentication:** Login, logout, session restoration, protected navigation, and authentication error handling.
- **Access Control UI:** Separate handling for unauthenticated requests and access-denied responses.
- **Responsive Layout:** Admin dashboard layout with reusable navigation and interface components.
- **Automated Tests:** Tests for implemented application behavior and authentication flows.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Component-based UI |
| TypeScript | Static typing |
| Vite | Development server and build tooling |
| SCSS | Styling |
| Axios | HTTP client |
| TanStack Query | Server state and caching |
| React Router | Client-side routing |
| React Hook Form | Form state management |
| Zod | Schema validation |
| DummyJSON | Demo API and data |

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone ADD_GITHUB_URL
cd react-store-admin
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
```

Run the project's test script using the command configured in `package.json`. For example, if the project uses Vitest:

```bash
npm run test
```

## Testing and Build

The project includes automated tests for key application behavior.

The production build and tests have been run successfully in the development environment.

To verify the project locally, run the relevant test command and the production build before deployment.

## API and Demo Data

The application uses [DummyJSON](https://dummyjson.com/) for demonstration data.

DummyJSON is a public demo API. Some write operations simulate changes rather than permanently persisting them. This project is intended to demonstrate frontend functionality, not to provide a production e-commerce backend.

## Authentication and Security

The authentication flow is implemented for demonstration and portfolio purposes only.

It illustrates login and logout interactions, session restoration, protected-route navigation, and handling of HTTP `401` and `403` responses.

**This demo authentication does not provide production-grade security.** Client-side route guards and browser storage cannot secure API resources. The application uses public demo endpoints, which do not enforce authorization for Botanica Admin.

A production implementation would require a trusted backend or identity provider, server-validated sessions, and authorization checks on protected API endpoints.

Do not enter real credentials or sensitive customer information.

## Deployment

The application can be deployed to [Vercel](https://vercel.com/).

Recommended settings for a standard Vite deployment:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Configure a rewrite for client-side routes if required by the application's React Router setup.

## Project Structure

The application separates API services, routing, layouts, pages, authentication logic, and reusable components to support maintainability and future development.

Refer to the source directories for the current implementation.

## License

Copyright © 2026. All rights reserved.

This repository is publicly available for portfolio viewing. No permission is granted to copy, modify, distribute, or reuse the source code without prior written permission from the copyright holder. See `LICENSE` for details.