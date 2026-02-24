# AI Coding Rules

## Tech Stack
- **Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Layout**: HTML5 Semantic Elements
- **Icons**: Lucide (via CDN or SVG)
- **Asset Management**: Local images and CSS-based backgrounds

## Library Usage Rules
- **Interactivity**: Use standard Web APIs and Vanilla JS for DOM manipulation, event listeners, and animations.
- **Styling**: Use Tailwind CSS utility classes exclusively for layout, spacing, and colors. Avoid custom CSS in `style.css` unless for complex animations or global overrides.
- **Components**: Structure the HTML with reusable sections. Maintain a clear separation between content and logic in `main.js`.
- **Icons**: Use `lucide-react` patterns if migrating to React, but for now, use SVG icons or the Lucide library consistently.
- **Performance**: Minimize third-party scripts. Prefer lightweight alternatives or native browser features for carousels and sticky headers.
- **Responsive Design**: Follow a mobile-first approach using Tailwind's breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`).
