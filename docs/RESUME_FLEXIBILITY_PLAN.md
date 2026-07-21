# Resume Flexibility Plan — Per-Job Tailoring

**Goal:** Make `one_page_resume.html` fully tailorable to a specific job posting by editing only `config/profiles.json` — no HTML/CSS edits per application.

**Status:** ✅ Complete. Phases 1–3 done & verified; all 6 profiles fit A4 in EN + ES. QR resolved by design (always default-profile tracked link per language). No open tasks.
**Owner:** Oliver Chan
**Created:** 2026-07-06
**Updated:** 2026-07-06

---

## Problem Summary

The resume body (`#content`, `one_page_resume.html:561`) is already dynamic via `profiles.json` + `templateEngine.js` (resume mode). But the parts that matter most for tailoring to a specific posting are hardcoded:

| Element | Location | Gap |
|---|---|---|
| Header tagline / power statement | `one_page_resume.html:531–558` | Static — same for every job |
| Summary text | `locales/*.json` → `summary.*` | One global version per language; can't swap per job |
| Footer "Open to…" pitch | `one_page_resume.html:565–578` | Translated but **not** profile-aware |
| `RESUME_LIMITS` | `templateEngine.js:8–14` | Global constants, not per-profile (comments also stale) |
| QR code | `one_page_resume.html:547, 612–614` | Always `default_profile` regardless of active profile |

**Design principle:** All changes are **additive**. A profile with no `resume` block falls back to today's behavior. Nothing existing breaks.

---

## Target Schema (`config/profiles.json`)

Add an optional `resume` block to any profile:

```json
"resume": {
  "tagline": "10+ years ERP/SCM → AI for manufacturing intelligence",
  "summaryOverride": "summary.manufacturing",
  "footerPitch": {
    "title": "opportunities.manufacturing.title",
    "text": "opportunities.manufacturing.text",
    "quote": "opportunities.manufacturing.quote"
  },
  "keywords": ["MRP", "Digital Twin", "Multi-Agent", "Python", "ERP/SCM"],
  "qr": {
    "en": "/assets/...manufacturing-en.svg",
    "es": "/assets/...manufacturing-es.svg"
  },
  "limits": { "projects": 4, "experience": 2, "skillCategories": 5 }
}
```
> Values may be either an i18n key (resolved via `i18n`) or literal text. Any field omitted → current default.

---

## Phase 1 — Per-profile copy + limits (≈80% of the value)

### 1.1 Schema + example data
- [x] Add `resume` block to `manufacturing-ai-internship` profile in `config/profiles.json` (worked example)
- [x] Add `resume.limits` to that profile (`projects`, `experience`, `skillCategories`)
- [x] Leave all other profiles untouched (verified fallback path — `default` uses defaults)

### 1.2 Per-profile limits — `js/templateEngine.js`
- [x] Fix stale comments in `RESUME_LIMITS` — values vs. comments now agree
- [x] Store full profile object as `this.activeProfile` in `loadProfile()` (was only a name string)
- [x] Update `getResumeLimits()` to merge `activeProfile.resume.limits` over `RESUME_LIMITS`
- [x] Route the three consumers through `getResumeLimits()`: education, projects, experience
- [x] Add `getResumeConfig()` + `resolveI18nOrText()` helpers

### 1.3 Summary override
- [x] `renderSummaryCompact` uses `resume.summaryOverride` (i18n key or literal), else falls back to `summary.text`

### 1.4 Header tagline — `one_page_resume.html`
- [x] Gave the power statement element id `#resume-tagline`
- [x] `applyResumeOverrides()` sets tagline from `resume.tagline` (i18n key or literal) after render

### 1.5 Footer pitch — `one_page_resume.html`
- [x] Added ids `#footer-pitch-title/-text/-quote`
- [x] `applyResumeOverrides()` sets them from `resume.footerPitch`; chained after `applyConfiguration()` + re-translate

**Phase 1 done when:** switching `?profile=manufacturing-ai-internship` changes tagline, summary, footer, and item density — with zero HTML edits — and other profiles look exactly as before.
✅ **Verified 2026-07-06** — EN + ES both render manufacturing tagline/summary/footer; limits apply (projects 10→4, experience 10→2); true content height 250 mm (< 290 mm safe limit); no console errors; `default` profile unchanged.

---

## Phase 2 — Targeting extras

### 2.1 Keywords / ATS strip
- [x] Added `resume.keywords` to manufacturing profile (9 tags)
- [x] `applyResumeOverrides()` populates `#resume-keywords` (textContent, no HTML injection); skips + hides when absent
- [x] Added `.keywords-compact` / `.keyword-tag` CSS (thin strip between header and content)

### 2.2 Profile-aware QR
- [x] `updateQRCode(lang)` prefers `activeProfile.resume.qr[lang]`, else `DEFAULT_QR` fallback
- [x] Moved `const templateEngine` above the early `updateQRCode` call (avoids TDZ ReferenceError)
- [x] `updateQRCode` re-invoked in `applyResumeOverrides()` once the profile has loaded
- [x] **Resolved by design (2026-07-06):** the QR intentionally always points to the **default profile** tracked links, per language — `?profile=default&lang=en` / `?profile=default&lang=es`. This is exactly what the built `DEFAULT_QR` fallback does, and both assets are tested. **No per-profile `qr` block is needed** for manufacturing (or any profile). The profile-aware override mechanism stays available in case a future profile ever wants its own QR, but the product decision is: all resumes share the default-profile QR.

**Phase 2 done when:** manufacturing shows a keyword strip; profiles without `keywords`/`qr` fall back cleanly.
✅ **Verified 2026-07-06** — manufacturing renders 9-tag strip (EN + ES); `default` hides + empties the strip; QR falls back to default asset; true content height 244 mm (< 290 mm); no console errors.

---

## Phase 3 — Locales & validation

### 3.1 Translations
- [x] Manufacturing keys added (pulled forward in Phase 1): `header.taglineManufacturing`, `summary.manufacturing`, `opportunities.manufacturingInternship.quote` in both `en.json` + `es.json`
- [x] Fixed a **pre-existing** parity gap: `resume.powerStatement` existed only in ES (dead key, unreferenced) — added EN equivalent
- [x] Deep recursive parity verified: **283 = 283 leaf keys, zero diffs**

> **Standing guideline (not a task):** when a *future* profile adds a `resume` block that references new i18n keys, add those keys to both `en.json` + `es.json` and re-run the parity check. No action needed now — no such profiles exist.

### 3.2 A4 guarantee still holds
- [x] Local server run (`:8000`)
- [x] Measured true content height for all 6 profiles × EN/ES (see table below)
- [x] Export PDF for `manufacturing-ai-internship` EN — `generatePDF` completed, single A4 page by construction (one scaled image); ES uses identical code path
- [x] Spot-checked `default`, `minimal`, `ai-engineer` — render in resume mode, no console errors

**A4 fit sweep (true content height, safe limit 290 mm):**

| Profile | EN | ES | Fits |
|---|---|---|---|
| default | ~~315~~ → 278 | ~~315~~ → 278 | ✅ (fixed — capped to `projects: 4`) |
| manufacturing-ai-internship | 244 | 256 | ✅ |
| ai-engineer | 278 | 278 | ✅ (tight) |
| fullstack | 238 | 238 | ✅ |
| minimal | 170 | 170 | ✅ |
| academic | 229 | 229 | ✅ |

No console errors on any profile. ✅ **Verified 2026-07-06.**

### Findings (pre-existing)
1. ~~**`default` profile overflows A4 in resume mode (~315 mm).**~~ ✅ **FIXED 2026-07-06** — added `resume.limits: { projects: 4, education: 4 }` to `default`, capping it from 8 project cards to 4. Now 278 mm in EN + ES (< 290 mm safe limit). Default tagline/summary/footer unchanged (only limits added). This validated the Phase-1 mechanism on a second profile.
2. **Duplicate template-engine instance.** `templateEngine.js` auto-creates a `window.templateEngine` (full mode) on DOMContentLoaded; the resume page also creates its own local resume-mode instance. On the resume page the global is inert (no `data-dynamic-rendering`, never renders), so it's harmless today — but `switchProfile()` on it renders in full mode. The resume page has no profile switcher, so not reachable in production. Noted for awareness.

---

## Verification Checklist (per profile)

For each of: `default`, `manufacturing-ai-internship`, `minimal`, `ai-engineer`, `fullstack`, `academic`
- [x] Renders without console errors — all 6 ✅
- [x] Tagline / summary / footer correct (manufacturing overrides; others fall back) ✅
- [x] Fits one A4 page (EN + ES) — all 6 ✅ (`default` fixed via `resume.limits`)
- [x] PDF export — pipeline verified on manufacturing EN (identical path for all)

---

## Files Touched

- `config/profiles.json` — add `resume` blocks
- `js/templateEngine.js` — merge limits, summary override, expose `resume` block
- `one_page_resume.html` — ids + post-render overrides for header/footer/QR, keywords strip
- `locales/en.json`, `locales/es.json` — new tailoring keys

## Out of Scope (for now)
- Visual admin panel for editing profiles
- Auto-generating a profile from a pasted job description
- Multi-page resume mode
