# SAHAYA — Teacher-Assisted Adaptive Learning System (Grades 6–10)

SAHAYA is a teacher-assisted adaptive learning web application designed for Indian classrooms (Grades 6–10). It enables teachers to administer short paper-based multiple-choice assessments without requiring student devices, record responses in a pre-marked digital grid, analyze concept-level learning gaps, and assign deterministic rule-based learning paths.

---

## Architecture & Project Structure

```text
sahaya/
├── index.html                           # SEO, Open Graph, and JSON-LD (SoftwareApplication + FAQPage)
├── package.json                         # Dependencies and build/test scripts
├── vite.config.js                       # Vite configuration
├── .env.example                         # Environment variable template for Supabase & AI proxy
├── public/
│   ├── robots.txt                       # Search crawler directives
│   └── sitemap.xml                      # XML sitemap for public and app routes
├── supabase/
│   └── schema.sql                       # PostgreSQL tables, constraints, triggers, and RLS policies
└── src/
    ├── main.jsx                         # React root entry
    ├── App.jsx                          # Application state orchestration and route handling
    ├── index.css                        # Navy blue minimal design system
    ├── components/
    │   ├── AuthModal.jsx                # Supabase Teacher Sign In / Sign Up modal
    │   ├── ConfirmModal.jsx             # Reusable confirmation dialog
    │   ├── Layout.jsx                   # Responsive sidebar and top header shell
    │   └── PathBadge.jsx                # Compact learning path status badge
    ├── data/
    │   └── demoData.js                  # Default settings, curriculum tags, and dev-only seed dataset
    ├── db/
    │   ├── dataRepository.js            # Unified repository (Supabase Cloud + Local IndexedDB)
    │   ├── indexedDb.js                 # Transactional local IndexedDB persistence (v2)
    │   └── supabaseClient.js            # Supabase Auth & PostgREST client
    ├── engine/
    │   ├── adaptiveEngine.js            # Deterministic rule-based recommendation engine
    │   ├── aiAssistantEngine.js         # Pedagogical templates & optional anonymized backend proxy
    │   └── __tests__/
    │       └── adaptiveEngine.test.js   # Unit tests for score, concept accuracy, and path rules
    └── pages/
        ├── LandingPage.jsx              # Public landing page with features, workflow, and FAQ
        ├── Dashboard.jsx                # Operational classroom overview
        ├── ClassesAndStudents.jsx       # Class and student roster management
        ├── Assessments.jsx              # Concept-tagged MCQ builder & printable paper sheet
        ├── ResponseEntry.jsx            # Pre-marked Correct paper response entry grid
        ├── ClassInsights.jsx            # Class-wide concept accuracy & student-level breakdown
        ├── StudentProgress.jsx          # Individual student history & multi-assessment trajectory
        ├── AiAssistant.jsx              # Optional teaching assistant (Template Mode / Backend Proxy)
        └── SettingsDemoData.jsx         # Thresholds, cloud sync, JSON backup/restore, & dev seed
```

---

## Setup & Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run unit tests:**
   ```bash
   npm test
   ```
3. **Start development server:**
   ```bash
   npm run dev
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Environment Variables & Supabase Setup

Copy `.env.example` to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_AI_PROXY_URL=
```

1. Create a new project in Supabase.
2. Open the **SQL Editor** in Supabase and run the full script in `supabase/schema.sql`.
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`.
4. When Supabase credentials are omitted, SAHAYA automatically operates in **Local Storage (IndexedDB)** mode and clearly displays the active storage mode in the interface.


## GitHub Pages Deployment

This repository is configured to deploy through **GitHub Actions**. The Vite build uses relative asset paths (`base: './'`) so the site works from a GitHub Pages project URL such as `https://<username>.github.io/SAHAYA-Final/`.

1. Upload the contents of this project folder to the **root** of your `SAHAYA-Final` repository (so `package.json`, `index.html`, `src/`, and `.github/` are at the repository root).
2. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Do not select “Deploy from a branch” for this workflow.
3. Open the **Actions** tab and wait for the “Deploy SAHAYA to GitHub Pages” workflow to finish successfully.
4. Open the Pages URL shown in **Settings → Pages**.

Do not upload `node_modules` or a prebuilt `dist` folder. GitHub Actions installs the dependencies and creates `dist` during deployment.

### Important notes

- The app uses browser-local IndexedDB storage when Supabase credentials are not configured. Data stays in that browser/device; it is not automatically shared between teachers or devices.
- To enable cloud accounts and shared persistence, configure the Supabase project using `supabase/schema.sql` and add the required `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` repository secrets/environment variables to the build workflow. Never commit private service-role keys.
- The optional AI assistant uses template mode unless a secure backend proxy is configured. Do not put an LLM secret key in frontend code.
- Review the canonical URL and sitemap in `index.html` and `public/sitemap.xml` before treating the GitHub Pages URL as the official SEO destination.
