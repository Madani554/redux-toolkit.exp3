# Campus Planner

A Redux Toolkit academic planner for assignments, labs, quizzes, and course activities. The workspace includes a deadline calendar, subject/status/deadline filters, student-specific submission tracking, and faculty activity management.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm test
npm run lint
npm run build
```

## Demo roles

Use the **Demo View** selector to switch between Student, Faculty, and Administrator workspaces. Student views are scoped to assigned activities. Faculty and administrators can create or edit activities, choose assigned students, and grade submitted work. Submission state is tracked independently for each student.

This repository is a browser-only demonstration: the role selector and reducer guards are not an authentication boundary, and no JWT is issued or verified. A production deployment must obtain a signed access token from a trusted API, verify its signature and expiry on the server, and enforce role and student-assignment authorization on every protected API operation. Never trust a role or token claim supplied only by client-side Redux state.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
