my-app/
│
├── app/
│   │
│   ├── (public)/
│   │   ├── page.tsx                // tanishtiruv page
│   │   └── layout.tsx
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx            // login page
│   │
│   ├── (user)/
│   │   └── dashboard/
│   │       ├── layout.tsx          // user sidebar layout
│   │       ├── page.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   │
│   ├── (admin)/
│   │   └── dashboard/
│   │       ├── layout.tsx          // admin sidebar layout
│   │       ├── page.tsx
│   │       ├── users/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   │
│   └── layout.tsx
│
├── components/
│   ├── ui/                         // shadcn componentlari
│   │
│   ├── shared/
│   │   ├── Logo.tsx
│   │   └── Navbar.tsx
│   │
│   ├── sidebar/
│   │   ├── AdminSidebar.tsx
│   │   └── UserSidebar.tsx
│
├── lib/
│   ├── utils.ts
│   └── auth.ts
│
├── hooks/
│   └── useAuth.ts
│
├── types/
│   └── index.ts
│
├── public/
│
├── styles/
│   └── globals.css
│
└── package.json