# Patturn

An experimental playground for next-gen interfaces, interactions, and motion design.

## Lab Experiments

| Experiment | Description | Status |
|------------|-------------|--------|
| Magnetic Button | Buttons that follow cursor with magnetic attraction | Ready |
| Fluid Cursor | Smooth, blob-like cursor that morphs on hover | Ready |
| Flip Card | 3D card flip interactions | Ready |
| Liquid Glass | Glassmorphism with liquid distortion effects | Ready |
| Liquid Metal | Metallic fluid simulations | Ready |
| Explosive Button | Particle explosion on click | Ready |

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/) + Vue 3
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [GSAP](https://greensock.com/gsap/)
- **3D:** [TresJS](https://tresjs.org/) (Three.js for Vue)
- **Icons:** [Lucide](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

```bash
# Clone the repo
git clone https://github.com/rahul-akumar/patturn.git
cd patturn

# Install dependencies
bun install

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run generate` | Generate static site |

## Project Structure

```
app/
├── components/     # Reusable Vue components
├── layouts/        # Page layouts (default, lab)
├── pages/          # Route pages
│   ├── index.vue   # Home page
│   └── lab/        # Experiment pages
└── assets/
    └── css/        # Global styles
```

## License

MIT
