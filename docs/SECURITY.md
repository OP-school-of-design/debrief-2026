# Security

How the DEBRIEF 2026 site, its dashboard and its deploy are protected, what to keep doing, and how
to finish setting up the GitHub organisation.

## What's in place

### The public site (`src/.htaccess`)
| Protection | What it does |
|---|---|
| **Content-Security-Policy** | Browsers only run scripts, and load styles, fonts, images and video, from this site; only YouTube and Vimeo can be embedded. Code injected into a page (XSS) can't run. Inline styles on elements are allowed (the School of Design box colours use one); inline scripts are not. |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`: other sites can't show these pages inside a frame. |
| **Other headers** | `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` switching off camera, microphone, location and payments, `Cross-Origin-Opener-Policy`. |
| **Hidden files** | Any file starting with a dot is refused, including the deploy tool's `.ftp-deploy-sync-state.json` (a list of every file) and `.htaccess` itself. No folder listings. |
| **AI training crawlers and site copiers** | Refused (403) by user agent: the crawlers that collect content to train AI models (OpenAI's GPTBot, Anthropic's ClaudeBot, Common Crawl, ByteDance, Meta's training crawler, Amazon, Apple's AI crawler, Diffbot, Cohere and others), plus HTTrack, Scrapy and script libraries. Allowed: Google, Bing, DuckDuckGo, link previews (Teams, LinkedIn, Facebook, Instagram, Slack), and AI search and assistants that fetch a page to answer a question and link back to it (ChatGPT search, Claude, Perplexity, DuckAssist), so graduates can be found and shared. Edit the list in `.htaccess`; `robots.txt` lists the same training crawlers (plus Google-Extended) for when the site is at the domain root. |
| **Hotlinking** | Images and videos only load inside pages on design.ac.nz or op.ac.nz (or search and social sites). Opening a file directly still works. |

**SiteGround's NGINX Direct Delivery** (Site Tools > Speed > Caching) serves static files (images,
video, CSS, JS, JSON) straight from NGINX without reading `.htaccess`. While it's on, the rules above
apply to pages but **not** to those files: hotlinking isn't blocked, and crawlers can still fetch
images. (SiteGround: "Hotlink protection will not work with NGINX Direct Delivery enabled".) Turning
it off makes every rule apply, at a small speed cost that SiteGround's CDN mostly hides, but it's a
setting for the whole design.ac.nz site. The deploy tool's file list doesn't rely on it: it has a
secret, unguessable name (repository secret `FTP_STATE_NAME`).

**Limits worth knowing.** Crawler blocking relies on bots naming themselves; badly behaved scrapers can
pretend to be a browser. robots.txt only works at the domain root (design.ac.nz/robots.txt), which
is outside this site's folder, so it's a request for whoever manages design.ac.nz. SiteGround's CDN
serves cached copies of images from its edge, so the hotlink and crawler rules apply when a request
reaches the server; SiteGround's own CDN and security settings (Site Tools > Security, Speed > CDN)
add protection at the edge.

If you add an outside service (analytics, a font, an embed), add its address to the matching part
of the `Content-Security-Policy` line in `src/.htaccess`, or the browser will block it.

### Content entered in the dashboard
- **No raw HTML.** Text fields (graduate bios, project descriptions, event and page text) show HTML
  as plain text, so nobody can add `<script>` through the dashboard. Markdown formatting (bold,
  italic, links) still works.
- **Safe links.** Link fields only accept `https://` web addresses (and email addresses where
  relevant), and the site turns anything else (e.g. `javascript:` addresses) into a harmless `#`.
  Links that open in a new tab have `rel="noopener noreferrer"`.
- **No code box.** The old "SEO & head code" box is gone from the dashboard. Code for the `<head>` of
  every page lives in `src/_includes/head-code.html`, changed only through the repo.

### The dashboard (`/admin/`, `src/admin/.htaccess`)
- **Its code is served from this site** (`admin/decap-3.16.3/`, checked against npm's published
  integrity hash), not from a public CDN, so a compromised CDN can't steal editors' GitHub logins.
- **Strict policy:** scripts only from this site, connections only to GitHub. Never framed, never
  indexed by search engines. (`'unsafe-eval'` is allowed because Decap checks its own settings with
  a library that needs it; injected code still can't run.)
- **Login** goes through the Cloudflare Worker (`sveltia-cms-auth`), which only hands a login back to
  pages on the domains in its `ALLOWED_DOMAINS` setting (design.ac.nz). Keep that exact, with no
  wildcards. This is also the protection against open redirects: the static site itself has no
  redirect pages.

### The deploy (`.github/workflows/deploy.yml`)
- **FTPS with certificate checking** (`security: strict`), so the password can only go to the real
  server. The FTP account is limited to the `/debrief/2026` folder. We deliberately use this rather
  than SSH/SFTP: SiteGround's SSH keys can't be limited to a folder and reach all of design.ac.nz.
- **Pinned actions:** every action is pinned to an exact commit.
- **Least privilege:** the workflow can only read the repo, npm install scripts are off, and two
  deploys never run at once.
- **Image cache:** processed WebP images are cached between builds, so only new images are processed.

### Dependencies
- **Dependabot** (`.github/dependabot.yml`) opens weekly pull requests for npm packages and GitHub
  Actions. Also switch on **Dependabot alerts**: repo Settings > Advanced Security (or "Code
  security") > Dependabot alerts. Merging an update deploys the site, so glance at the Actions run.
- **`npm audit` still lists some issues** (October 2026). All are in build or local-only tools, and
  none reaches visitors: the live site is plain HTML, CSS and our own small scripts.
  - `decap-server` (local dashboard testing only, never runs in GitHub or on SiteGround) uses an
    older `simple-git`.
  - Eleventy's file watcher (`chokidar`/`braces`) has a slowdown bug; it only runs on your computer
    during `npm start`.
  - Re-check after Dependabot updates.

## Your checklist
- [ ] **Two-factor login** on every GitHub account with access, and on SiteGround and Cloudflare.
- [ ] **FileZilla:** remove the saved SiteGround login, or set a master password
  (Settings > Interface > Passwords). FileZilla otherwise stores passwords in a readable file.
- [ ] **Rotate the FTP password** whenever someone with write access to the repo leaves. Anyone with
  write access could, in principle, write a workflow that reads the deploy secrets (on GitHub Team,
  the environment set-up below prevents that).
- [ ] **Review dashboard logins** now and then: github.com/settings/applications > Authorized OAuth
  Apps shows the dashboard's login app; revoke it there if a laptop is lost. (Each editor's
  dashboard login can reach every repo that editor can access, which is why XSS protection
  matters.)
- [ ] Ask whoever manages design.ac.nz to add AI-crawler rules to design.ac.nz/robots.txt.

## Moving the repo into a GitHub organisation

At the moment `OP-school-of-design` is a personal account, so it can't require two-factor login,
can't give people different roles, and can't control which apps can reach the repo. A (free)
organisation can. Keeping the **same name** means nothing in the site's settings has to change.

GitHub's own recommendation for keeping the name: rename the personal account, create an
organisation with the original name, and move the repo into it.

1. **Check** you can sign in as `OP-school-of-design` and as your own account (`martinkean`), both with
   two-factor on. Note the repo's Settings > Secrets and variables > Actions (names only), so you can
   confirm they survive the move.
2. **Rename the personal account:** sign in as `OP-school-of-design` > Settings > Account > Change
   username, e.g. to `op-school-of-design-admin`. The repo temporarily moves to the new name; GitHub
   redirects the old address.
3. **Create the organisation:** signed in as `martinkean`, your profile picture > Your organizations >
   New organization > Free plan, named exactly `OP-school-of-design`. Add `op-school-of-design-admin`
   as a second owner (People > Invite member > Owner), so the school never depends on one person.
4. **Move the repo:** signed in as `op-school-of-design-admin`, open the repo > Settings > General >
   Danger Zone > Transfer > new owner `OP-school-of-design`. Collaborators, pull requests, secrets
   and deploy keys move with it.
5. **Check it arrived intact:** repo Settings > Secrets and variables > Actions should still show
   `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` and the variables `SITE_BASE`, `FTP_SERVER_DIR`,
   `DEPLOY_ENABLED`. Re-enter any that are missing. Then run Actions > Build and deploy > Run workflow.
6. **Allow the dashboard's login app.** New organisations block outside login apps by default, so
   the first time an editor logs into `/admin/`, GitHub's authorisation screen shows
   `OP-school-of-design` with a **Request** button: click it. Then an owner approves it: Organization
   Settings > Third-party Access > OAuth app policy > "Debrief 2026 OAuth" > Review > Grant access.
   (The login app itself lives under whichever account registered it; that doesn't need to change.)
7. **Require two-factor login:** first check People to see who doesn't have it yet (GitHub removes
   them when this is switched on). Then Organization Settings > Authentication security > Require
   two-factor authentication.
8. **Roles:** set Settings > Member privileges > Base permissions to **No permission**. Create a team
   (Teams > New team), e.g. "Debrief editors", give it **Write** on the repo (repo Settings >
   Collaborators and teams), and add staff and the student designer to it. Keep **Admin** for the
   two owners. When someone leaves, remove them from the organisation.

### Free GitHub Team (education)
Verified teachers can get GitHub Team free (unlimited users and private repos). It adds what the free
plan lacks for private repos: branch protection, and deploy secrets that only the deploy can read.

1. Apply as a teacher at education.github.com/teachers, using your school email address and proof of
   employment (e.g. staff ID or a letter). First check whether Otago Polytechnic already has a
   GitHub Campus Program partnership.
2. Once approved, apply the Team discount to the `OP-school-of-design` organisation from the GitHub
   Education benefits page (GitHub's wording varies; GitHub Support can apply it if you can't find
   it).
3. Then ask me (or whoever maintains the site) for the two follow-ups:
   - **Environment:** move the FTP secrets into an environment called `production` that only the
     `main` branch can use, and add `environment: production` to the deploy job.
   - **Branch protection on `main`:** block force-pushes and deletion. Don't require pull-request
     approvals: the dashboard publishes by merging its own pull requests.
