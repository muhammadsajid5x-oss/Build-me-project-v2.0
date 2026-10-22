# Child Story 1 — Technology Ownership Navbar — Design

**Status: IMPLEMENTED AND VALIDATED**

## 1. Design Objective

The Navbar design must support the five source requirements:

1. Logo creation
2. Logo placement
3. Home navigation
4. Static/sticky behaviour
5. Responsive behaviour

The design must also support the Go-Live Outcome:

> Visitor can browse the website while the Navbar remains available and can return Home using the logo.

The design reuses the existing Build Me web application architecture and does not introduce unnecessary new architecture.

---

## 2. Existing Architecture

The Navbar is implemented inside the existing web application:

```text
apps/web/
├── src/
│   ├── components/
│   │   └── Navbar/
│   │       └── Navbar.tsx
│   └── layouts/
│       └── AppLayout.tsx
└── public/
    └── Logo.png
```

The existing application already uses:

- React
- React Router
- Tailwind CSS
- Vite

The Navbar design reuses these existing capabilities.

No new framework, routing system, styling architecture, or application shell is introduced.

---

## 3. Component Design

The Navbar is implemented as an application component:

```text
apps/web/src/components/Navbar/Navbar.tsx
```

Component responsibility:

- Render the Navbar
- Render the Cup&Commit logo
- Render the Cup&Commit brand name
- Provide Home navigation
- Provide sticky positioning
- Provide responsive layout

The component does not contain business logic, API calls, database operations, authentication logic, or analytics logic.

---

## 4. Layout Integration

The Navbar is integrated through the existing application layout:

```text
apps/web/src/layouts/AppLayout.tsx
```

The layout structure is:

```text
AppLayout
├── Navbar
└── main
    └── Outlet
```

This ensures the Navbar is available across the pages that use `AppLayout`.

The existing React Router structure remains unchanged.

---

## 5. Navbar Structure

The visual structure is:

```text
Navbar
└── Navigation
    └── Home Link
        ├── Logo
        └── Cup&Commit
```

The logo and brand name are presented together as the Home navigation control.

The design uses a single clickable area so that the visitor can select the logo/brand area to return Home.

---

## 6. Logo Design

The existing logo asset is reused:

```text
apps/web/public/Logo.png
```

The asset is loaded using the existing Vite public asset mechanism:

```text
/Logo.png
```

The logo uses an accessible alternative text:

```text
Cup&Commit
```

The design does not introduce:

- New image-processing infrastructure
- New asset-management architecture
- Duplicate logo assets
- Additional image services

This follows the project principle:

> Reuse first. Create new architecture only when necessary.

---

## 7. Home Navigation Design

Home navigation uses the existing React Router implementation.

The navigation target is:

```text
/
```

The Navbar uses React Router's `Link` rather than a normal full-page browser navigation.

Conceptually:

```text
Cup&Commit Logo
       ↓
React Router Link
       ↓
/
       ↓
Home Page
```

This keeps navigation within the existing single-page application routing architecture.

---

## 8. Sticky Behaviour Design

The Navbar uses CSS sticky positioning.

The required behaviour is:

```text
position: sticky
top: 0
```

The Navbar is also placed above normal page content using an appropriate stacking order.

Conceptually:

```text
Page
│
├── Navbar
│   ├── sticky
│   └── top: 0
│
└── Page Content
```

This allows the Navbar to remain available while the visitor scrolls through the page.

No JavaScript scroll listener is required.

---

## 9. Responsive Design

The Navbar uses the existing Tailwind CSS responsive utilities.

The design must remain usable across:

- Desktop
- Tablet
- Small mobile screens

The logo uses responsive sizing and constrained width so that it remains within the available navigation space.

The layout uses responsive horizontal spacing rather than introducing a separate mobile navigation architecture.

A hamburger menu or mobile navigation drawer is **not part of the current source requirements** and therefore is not included.

---

## 10. Styling Design

The Navbar uses existing Tailwind utility classes.

The design includes:

- Flexible horizontal layout
- Responsive spacing
- Responsive logo sizing
- Accessible focus styling
- Sticky positioning
- Appropriate stacking order
- Existing project typography and spacing conventions

No separate Navbar CSS file is required.

The existing Tailwind configuration remains the styling foundation.

---

## 11. Accessibility Design

The design uses standard semantic navigation elements:

```text
<header>
    <nav>
        <a>
```

The navigation has an accessible label:

```text
Primary navigation
```

The Home link has an accessible label:

```text
Go to Home
```

The logo provides alternative text:

```text
Cup&Commit
```

The navigation link also includes visible keyboard focus styling.

No custom keyboard navigation implementation is required because the standard link behaviour is sufficient for the current requirements.

---

## 12. Runtime Behaviour

The expected runtime flow is:

```text
Visitor opens website
        ↓
AppLayout renders
        ↓
Navbar renders
        ↓
Logo + Cup&Commit are visible
        ↓
Visitor scrolls
        ↓
Navbar remains available
        ↓
Visitor selects logo
        ↓
React Router navigates to /
        ↓
Home page renders
```

The Navbar does not depend on:

- API availability
- Database availability
- Authentication state
- Analytics services
- Background jobs

This keeps the feature independent from backend services.

---

## 13. Error and Failure Design

The Navbar does not introduce a new backend failure path.

Potential frontend failures are limited to:

- Missing logo asset
- Incorrect route integration
- Styling/layout regression
- Component rendering failure

The existing application error handling and deployment recovery process remain applicable.

No new API error handling is required.

---

## 14. Testing Design

The design is verified through component tests.

Test coverage includes:

| Design Area       | Verification                     |
| ----------------- | -------------------------------- |
| Logo rendering    | Logo is present                  |
| Logo asset        | `/Logo.png` is used              |
| Home navigation   | Link targets `/`                 |
| Sticky behaviour  | `sticky` and `top-0` are present |
| Responsive layout | Responsive classes are present   |

Manual browser verification also covers:

- Desktop rendering
- Mobile rendering
- Sticky scrolling
- Logo navigation
- Refresh
- Back/forward navigation
- Horizontal overflow

---

## 15. Security Design

The Navbar is a static frontend component.

It does not:

- Process sensitive user data
- Accept user HTML
- Create authentication state
- Create authorization rules
- Introduce API endpoints
- Store secrets
- Modify database data

The implementation does not use `dangerouslySetInnerHTML`.

Existing application security controls remain unchanged.

---

## 16. Deployment Design

The Navbar is part of the existing web application build.

Deployment flow:

```text
Source Code
    ↓
Existing CI checks
    ↓
Existing Web Build
    ↓
Existing Deployment Process
    ↓
Deployed Web Application
```

No new infrastructure is required.

No API deployment is required for this child story.

No database migration is required.

---

## 17. Recovery Design

Recovery uses the existing Git and deployment process.

If the Navbar introduces a production regression:

```text
Production Issue
      ↓
Identify Navbar change
      ↓
Revert change if required
      ↓
Run validation
      ↓
Redeploy known-good version
      ↓
Verify Go-Live Outcome
```

No database rollback is required because the Navbar does not modify persistent data.

---

## 18. Design Decisions

### Decision 1 — Keep Navbar in `apps/web`

**Decision:**

```text
apps/web/src/components/Navbar/Navbar.tsx
```

**Reason:**

The Navbar is currently specific to the web application.

Moving it to `packages/ui` only to create Storybook documentation would introduce unnecessary architecture.

---

### Decision 2 — Reuse Existing React Router

**Decision:**

Use the existing React Router `Link`.

**Reason:**

Routing already exists in the application and provides the required Home navigation.

No new routing mechanism is necessary.

---

### Decision 3 — Reuse Existing Tailwind CSS

**Decision:**

Use existing Tailwind utility classes.

**Reason:**

The existing styling system already supports the required layout, sticky behaviour, responsive behaviour, and focus states.

A separate CSS architecture is unnecessary.

---

### Decision 4 — No Storybook for This Story

**Decision:**

No Navbar Storybook story is added.

**Reason:**

The Navbar is an application-specific component and is not currently part of the shared `packages/ui` component library.

Adding Storybook solely for this child story would create unnecessary architecture.

If a future requirement makes the Navbar a shared component, Storybook can be introduced as part of that requirement.

---

### Decision 5 — No Analytics

**Decision:**

No Navbar-specific analytics events are introduced.

**Reason:**

Analytics tracking is not included in the source requirements.

Adding analytics would expand the scope beyond the child story.

---

## 19. Requirement Traceability

| Source Requirement      | Design Response                                           |
| ----------------------- | --------------------------------------------------------- |
| Logo creation           | Existing `Logo.png` is integrated into the Navbar         |
| Logo placement          | Logo is placed inside the Home navigation control         |
| Home navigation         | React Router `Link` targets `/`                           |
| Static/sticky behaviour | Navbar uses `sticky top-0`                                |
| Responsive behaviour    | Existing Tailwind responsive utilities are used           |
| Go-Live Outcome         | Navbar remains available and logo returns visitor to Home |

---

## 20. Design Validation Status

The design has been implemented and technically validated.

Verified:

- Navbar component exists
- Logo is rendered
- Cup&Commit branding is rendered
- Home navigation works
- Sticky behaviour works
- Responsive behaviour works
- Automated tests pass
- Full project validation passes
- Manual browser validation passes
- No unnecessary backend, database, analytics, Storybook, or architecture changes were introduced

**Design Status: IMPLEMENTED AND VALIDATED**
