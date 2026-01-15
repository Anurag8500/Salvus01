# SALVUS — Emergency & Disaster Relief System

A modern, production-ready landing page for a disaster relief platform that ensures transparent, accountable aid distribution.

## Features

- **Modern Dark Theme**: Professional charcoal/deep slate design with teal accent colors
- **Smooth Animations**: Framer Motion powered micro-animations and scroll-triggered effects
- **Responsive Design**: Optimized for desktop with mobile support
- **Animated Metrics**: Live impact counters with smooth count-up animations
- **Interactive Components**: Hover effects, progress bars, and engaging UI elements

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Main landing page
│   └── globals.css    # Global styles
├── components/
│   ├── Hero.tsx           # Hero section with CTAs
│   ├── ImpactMetrics.tsx  # Animated metrics counters
│   ├── HowItWorks.tsx     # 5-step process flow
│   ├── ActiveCampaigns.tsx # Campaign cards grid
│   ├── WhySalvus.tsx      # Comparison section
│   └── Footer.tsx         # Footer with links
└── package.json
```

## Design Philosophy

- **Trustworthy**: Serious, professional tone suitable for humanitarian work
- **Transparent**: Clear visual hierarchy and honest messaging
- **Modern**: Contemporary design that impresses in seconds
- **Accessible**: High contrast, readable typography

## Build for Production

```bash
npm run build
npm start
```

---

Built for hackathon demonstration. This is a landing page prototype only.


