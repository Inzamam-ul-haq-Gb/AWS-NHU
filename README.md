# AWS NHU — AWS Student Builder Community Website

A premium, futuristic, fully static website for the **AWS Student Builder Community**
at **Nazeer Hussain University (NHU), Karachi, Pakistan**.

Built with **only HTML5, CSS3 and Vanilla JavaScript** — no frameworks, no build step,
no backend, no database. Deployable as-is on **GitHub Pages** or **Vercel**.

---

## ✨ Features

- Dark cosmic theme (`#080A18` / `#101326`) with AWS orange (`#FF9900`), purple (`#A78BFA`) and electric blue (`#60A5FA`) accents
- Animated starfield canvas (twinkling stars + drifting particles with constellation lines)
- Glassmorphism cards with pointer-tracked spotlight hover glow
- Cosmic planet hero with orbit rings and floating AWS service labels
- Infinite AWS-services marquee strip
- Scroll-reveal animations (IntersectionObserver), navbar blur-on-scroll, scroll progress bar
- Fully responsive mobile navigation with animated hamburger
- Accessible: skip link, ARIA labels, keyboard support, `prefers-reduced-motion` respected
- Lightweight: zero dependencies (Google Fonts is the only external request)

## 📁 Project structure

```
AWS-NHU/
│
├── index.html          # All sections (hero, about, learning, events, team, community, CTA)
├── style.css           # Design tokens, components, animations, responsive rules
├── script.js           # Navbar, mobile menu, reveal, particles, parallax, toasts
│
├── assets/
│   ├── images/         # (empty) — put event/community photos here
│   ├── icons/          # favicon.svg
│   └── team/           # (empty) — put team member photos here
│
└── README.md
```

## 🚀 Run locally

No build step — just open `index.html` in a browser, or serve it:

```bash
# Python
python3 -m http.server 8080

# or Node
npx serve .
```

Then visit `http://localhost:8080`.

## 🌐 Deploy

### GitHub Pages
1. Create a repository (e.g. `aws-nhu`) and push the contents of this folder.
2. **Settings → Pages → Source:** select the branch (`main`) and `/ (root)`.
3. Your site is live at `https://<username>.github.io/aws-nhu/`.

### Vercel
1. Push the folder to a Git repository (or drag-and-drop at vercel.com/new).
2. Framework preset: **Other** (static). No build command, output directory `./`.
3. Deploy.

## ✏️ Customization — placeholder map

All editable spots are marked with `✏️ EDITABLE` comments in `index.html` and with
`data-editable="..."` attributes. Current placeholders:

| What | Where | How to update |
| --- | --- | --- |
| Join / registration buttons | every element with `data-editable="join-link"` and `data-editable="registration"` | replace `href="#"` with your Google Form / WhatsApp / Discord invite |
| LinkedIn, Instagram, Email | footer “Connect” + team card icons (`data-editable="social-link"`) | replace `href="#"` with real URLs / `mailto:` address |
| Team members & group leader | `#team` section cards | replace names, designations, bios; add photos to `assets/team/` and use `<img>` inside `.avatar` |
| Event dates & venues | `#events` — `.tba` spans | replace the “TBA — to be announced” values once scheduled |
| Event images | `.event-visual` divs (CSS illustrations) | swap in `<img src="assets/images/your-photo.jpg">` when real photos exist |
| Explore card links | `#learning` cards | currently point to official AWS pages; adjust freely |

> No real dates, statistics, testimonials or people are claimed anywhere — every such
> field is a clearly marked placeholder until the team provides real information.

## 🖼 Adding real images

1. Drop files into `assets/images/` (events/community) or `assets/team/` (portraits).
2. For team avatars, replace the inline `<svg>` inside `.avatar` with:
   ```html
   <img src="assets/team/member.jpg" alt="Photo of <Name>" />
   ```
   (add `.avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }` to `style.css`)
3. For event cards, replace the `.event-visual` contents with an `<img>` styled as a cover.

## ♿ Accessibility & performance notes

- All animations are `transform`/`opacity` based (GPU-friendly); the canvas pauses on hidden tabs and caps particle counts on small screens.
- `prefers-reduced-motion: reduce` disables every animation, including the canvas loop.
- Content is fully visible with JavaScript disabled (scroll-reveal styles only apply when JS runs).
- No images are required for the design — icons and illustrations are inline SVG/CSS, so there are no broken image links.

---

© AWS NHU — AWS Student Builder Community, Nazeer Hussain University, Karachi, Pakistan.
A student-run community website. AWS and Amazon are trademarks of Amazon.com, Inc.
