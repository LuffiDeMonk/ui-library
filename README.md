# @prabhat-thapa/ui-package

> A modern, accessible, and high-performance React 19 UI component library built on top of Radix UI primitives and Tailwind CSS.

`@prabhat-thapa/ui-package` provides a comprehensive suite of design-system primitives and composite components ready to be installed and used across any React, Next.js, or Vite application.

---

## Features

- **React 19 Native**: Built specifically for React 19 with full support for Server and Client Components.
- **Accessible & WAI-ARIA Compliant**: Built on top of Radix UI and Base UI headless primitives with keyboard navigation and screen-reader support.
- **Dual Module Output**: Bundled with `tsup` into dual **ESM** (`.js`) and **CommonJS** (`.cjs`) with complete TypeScript declarations (`.d.ts`).
- **Zero Configuration CSS**: Includes pre-styled Tailwind v4 theme tokens and animations via `@import "@prabhat-thapa/ui-package/styles.css";`.
- **CVA-Powered Variants**: Predictable `variant` and `size` props powered by `class-variance-authority`.
- **Rich Component Suite**: 24+ shared composite components (Button, Input, Select, Modal, Drawer, Table, Tabs, DatePicker, TimePicker, Alert, Avatar, Tooltip, and more).

---

## Installation

Install `@prabhat-thapa/ui-package` and its peer dependencies via your preferred package manager:

```bash
# npm
npm install @prabhat-thapa/ui-package react react-dom

# pnpm
pnpm add @prabhat-thapa/ui-package react react-dom

# yarn
yarn add @prabhat-thapa/ui-package react react-dom
```

---

## Quick Start

### 1. Import Styles

Import the component library stylesheet in your application's root entry file:

#### Next.js (App Router)
Add the stylesheet to `app/layout.tsx` or `app/globals.css`:

```tsx
// app/layout.tsx
import "@prabhat-thapa/ui-package/styles.css";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Vite / React SPA
Add the stylesheet to `src/main.tsx` or `src/App.tsx`:

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "@prabhat-thapa/ui-package/styles.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Component Usage Examples

### 1. Button

```tsx
import { Button } from "@prabhat-thapa/ui-package";
import { ArrowRight, Trash2 } from "lucide-react";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Primary Action</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive" leftIcon={<Trash2 className="h-4 w-4" />}>
        Delete Item
      </Button>
      <Button loading>Processing</Button>
      <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
        Get Started
      </Button>
    </div>
  );
}
```

### 2. Modal Dialog

```tsx
"use client";

import { useState } from "react";
import { Modal, Button } from "@prabhat-thapa/ui-package";

export function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Confirm Purchase"
        description="Are you sure you want to proceed with this acquisition?"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Confirm & Settle
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Your order will be verified and dispatched via insured white-glove logistics.
        </p>
      </Modal>
    </>
  );
}
```

### 3. Form Controls (Input, Select, Checkbox)

```tsx
import { Input, Select, Checkbox, Label } from "@prabhat-thapa/ui-package";

export function FormDemo() {
  return (
    <form className="max-w-md space-y-4">
      <div>
        <Label htmlFor="fullname">Full Name</Label>
        <Input id="fullname" placeholder="Eleanor Vance" />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          options={[
            { label: "Fine Art & Paintings", value: "art" },
            { label: "Rare Sculptures", value: "sculpture" },
            { label: "Antiquities & Artifacts", value: "antiquities" },
          ]}
          placeholder="Select a category"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms" className="text-sm">
          I agree to the terms of service
        </Label>
      </div>
    </form>
  );
}
```

### 4. Alert & Feedback

```tsx
import { Alert } from "@prabhat-thapa/ui-package";

export function AlertDemo() {
  return (
    <div className="space-y-4">
      <Alert
        variant="info"
        title="Authentication In Progress"
        description="Specialist vetting for this artifact is currently scheduled."
      />
      <Alert
        variant="success"
        title="Acquisition Confirmed"
        description="Your high bid has successfully secured the lot."
      />
      <Alert
        variant="error"
        title="Verification Required"
        description="Please update your identification documents to place further bids."
      />
    </div>
  );
}
```

### 5. Table & Pagination

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from "@prabhat-thapa/ui-package";

export function TableDemo() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lot</TableHead>
            <TableHead>Artist / Maker</TableHead>
            <TableHead>Current Bid</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">18th C. Walnut Commode</TableCell>
            <TableCell>French Atelier</TableCell>
            <TableCell>$14,500</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={(page) => console.log("Page:", page)}
      />
    </div>
  );
}
```

---

## Component Index

| Component | Description |
| :--- | :--- |
| `Alert` | Dismissible alert banners with info, success, warning, and error states. |
| `Avatar` | Profile avatar with initials fallback and image support. |
| `Badge` | Pill indicators for categories, status flags, and conditions. |
| `Breadcrumb` | WAI-ARIA breadcrumb trail navigation. |
| `Button` | Accessible buttons with `variant`, `size`, loading spinners, and icons. |
| `Checkbox` | Custom styled accessible checkbox. |
| `DatePicker` | Calendar popover input for single dates and ranges. |
| `Drawer` | Smooth sliding drawer panel (built on Vaul). |
| `Dropdown` | Accessible dropdown menu with submenus, shortcuts, and items. |
| `FileUpload` | Drag-and-drop file upload zone with preview and size validations. |
| `ImageZoom` | High-resolution image zoom inspection overlay for fine artwork. |
| `Input` | Clean text, email, number inputs with clean border focus states. |
| `Label` | Accessible form labels tied to input identifiers. |
| `Modal` | Centered dialog overlay with responsive sizing and focus trap. |
| `Pagination` | Accessible pagination controls with page jumpers. |
| `Radio` / `RadioGroup` | Accessible single-choice option selectors. |
| `Select` | Searchable or standard select dropdown with accessible options. |
| `Sidebar` | Collapsible navigation sidebar for dashboards. |
| `Table` | Accessible data table with header, row, cell, and caption primitives. |
| `Tabs` | Accessible tabbed panel switching. |
| `TextEditor` | Rich formatting text editor input. |
| `Textarea` | Multi-line text input with helper and error state bindings. |
| `TimePicker` | Modern time picker control with 12h/24h toggle. |
| `Tooltip` | Fast, accessible hover/focus popover tooltips. |
| `ThemeProvider` | Dark/Light mode theme provider (powered by `next-themes`). |

---

## How to Build & Publish to NPM

### 1. Build Locally

```bash
# Install dependencies
npm install

# Build JavaScript (ESM + CJS) and copy CSS tokens into dist/
npm run build
```

This compiles:
- `dist/index.js` (ESM module)
- `dist/index.cjs` (CommonJS module)
- `dist/index.d.ts` (TypeScript types)
- `dist/styles.css` (CSS stylesheet)

### 2. Package Name & Scope

The package is configured as `@prabhat-thapa/ui-package` under the `@prabhat-thapa` npm user/organization scope.

### 3. Authenticate with NPM

```bash
npm login
```

Verify your credentials:

```bash
npm whoami
```

### 4. Publish to NPM

For scoped packages, publish with public access:

```bash
npm publish --access public
```

For unscoped packages:

```bash
npm publish
```

### 5. Automated CI/CD Publishing (GitHub Actions)

A GitHub Actions workflow is provided at `.github/workflows/publish.yml`:
1. Push this project to a GitHub repository.
2. In your repository settings, go to **Settings > Secrets and variables > Actions**.
3. Create a repository secret named `NPM_TOKEN` with your NPM access token (created from npmjs.com under **Access Tokens > Generate New Token > Automation**).
4. Whenever you draft and publish a GitHub Release, the action will automatically build and publish the package to NPM!

---

## License

[MIT](LICENSE) © 2026 Curated
