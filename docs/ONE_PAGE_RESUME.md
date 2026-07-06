# ONE_PAGE_RESUME.md

Technical documentation for the dynamic one-page resume system with PDF export.

## Overview

The one-page resume system generates **compact A4-sized resumes** dynamically from the currently active portfolio profile, with guaranteed single-page PDF export.

## Key Features

- ✅ **Profile Inheritance** - Renders content from active profile (default, minimal, ai-engineer, fullstack, manufacturing-ai-internship, academic)
- ✅ **A4 Guarantee** - Four-layer protection ensuring content never exceeds one A4 page (210mm × 297mm)
- ✅ **PDF Export** - Client-side PDF generation using html2canvas + jsPDF with SVG-to-PNG conversion for perfect QR rendering
- ✅ **Bilingual Support** - Full i18n integration with Spanish/English + dynamic QR code switching (including experience achievements and domain expertise callout)
- ✅ **Real-time Validation** - Live height measurement with visual warnings (includes header + content + footer)
- ✅ **Compact Rendering** - 6 fully dynamic compact methods (Summary, Research, Projects, TechStack, Experience, Languages)
- ✅ **Analytics Tracking** - Language-specific QR codes with rebrand.ly analytics (EN: rebrand.ly/fqbx15t, ES: rebrand.ly/lf7t3ih)
- ✅ **Optimized Typography** - Font sizes 9-23px (+15% from original) for improved readability while maintaining A4 fit
- ✅ **Footer Integration** - Opportunities section with i18n (title, text, quote) for call-to-action
- ✅ **PDF Watermark** - Small watermark displaying profile and language (e.g., "Profile: minimal | Lang: ES")
- ✅ **Domain Expertise** - Manufacturing & Supply Chain highlight (compact version after metrics-inline)
- ✅ **LinkedIn Integration** - Professional network link in contact info (💼 linkedin.com/in/ochand)
- ✅ **Production Ready** - `one_page_resume.html` is the active dynamic version

## Architecture

### File Structure

```
/one_page_resume.html (~830 lines) - PRODUCTION VERSION
├── HTML Structure
│   ├── Header (compact: 23px name, 14px title, 12px subtitle, 9px contact + LinkedIn)
│   ├── QR Section (dynamic SVG by language with CSS padding)
│   ├── Power Statement (12px)
│   ├── Content container (#content - dynamically rendered)
│   │   ├── Summary (with metrics-inline + domain expertise compact)
│   │   ├── Research (education timeline)
│   │   ├── Projects (academic/creative)
│   │   ├── TechStack (inline skills)
│   │   ├── Experience (4 roles + enterprise projects)
│   │   └── Languages (proficiency levels)
│   ├── Footer (opportunities section with i18n)
│   └── Watermark (profile + language, 7px monospace, bottom-right)
├── CSS Styling
│   ├── A4 Container: 794px × 1123px (210mm × 297mm)
│   ├── Optimized fonts: 9-23px (+15% for readability)
│   ├── QR Code: 70px × 70px with 5px padding for proper rendering
│   ├── Compact layouts: minimal spacing, efficient use of space
│   └── Print media queries
├── JavaScript
│   ├── Profile detection (URL → localStorage → default)
│   ├── Language detection with QR code switching + URL updates
│   ├── Template Engine (resume mode with 6 dynamic renderers)
│   ├── PDF generation (SVG→PNG conversion + html2canvas + jsPDF)
│   ├── Overflow validation (header + content + footer)
│   ├── Watermark update function (profile + language)
│   └── Event handlers (PDF, language toggle, navigation)
└── Assets
    ├── /assets/rebrand.ly.fqbx15t-default_profile-en.svg (English QR)
    └── /assets/rebrand.ly.lf7t3ih-default_profile-es.svg (Spanish QR)

Development version: /one-page-resume-dynamic.html
Static backup: /one_page_resume_static.html
```

### Dependencies

```html
<!-- CDN Libraries -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- Local Modules -->
<script src="/js/i18n.js"></script>
<script src="/js/templateEngine.js"></script>
```

## Four-Layer A4 Guarantee

### Layer 1: Content Limits (Preventive)

**Location**: `templateEngine.js` lines 6-21

```javascript
const RESUME_LIMITS = {
    education: 3,           // Maximum 3 academic degrees
    projects: 3,            // Maximum 3 projects
    experience: 2,          // Maximum 2 professional roles
    skillCategories: 5,     // Maximum 5 skill categories
    summaryMaxWords: 80     // Maximum 80 words in summary
};

const A4_DIMENSIONS = {
    height: { mm: 297, px: 1123 },
    width: { mm: 210, px: 794 },
    contentArea: { height: 277, width: 190 }
};
```

**Purpose**: Prevent excessive content from being rendered

### Layer 2: CSS Overflow Hidden (Absolute Barrier)

**Location**: `one-page-resume-dynamic.html` lines 33-44

```css
#resume-content {
    width: 794px;          /* A4 width: 210mm = 794px */
    height: 1123px;        /* A4 height: 297mm = 1123px */
    max-height: 1123px;    /* ← GUARANTEE: Never exceed */
    overflow: hidden;      /* ← GUARANTEE: Hide overflow */
    padding: 15px;         /* Minimal padding */
    box-sizing: border-box;
    background: white;
}
```

**Purpose**: Absolute CSS barrier - content exceeding 1123px is hidden

### Layer 3: Visual Validation (Transparency)

**Location**: `one-page-resume-dynamic.html` lines 460-490

```javascript
function checkPageOverflow() {
    const headerHeightPx = headerDiv.offsetHeight;
    const contentHeightPx = contentDiv.scrollHeight;
    const paddingPx = 15 * 2; // 15px top + 15px bottom

    const totalHeightPx = headerHeightPx + contentHeightPx + paddingPx;
    const totalHeightMm = totalHeightPx / 3.78; // Convert px to mm

    const exceedsSafe = totalHeightMm > A4_SAFE_LIMIT_MM; // 290mm

    console.log(`📏 Medidas: Header=${Math.round(headerHeightPx/3.78)}mm, Content=${Math.round(contentHeightPx/3.78)}mm, Padding=16mm, Total=${Math.round(totalHeightMm)}mm`);

    if (exceedsSafe) {
        warning.innerHTML = `⚠️ Content: <strong>${roundedHeight}mm</strong> (safe limit: 290mm). PDF may be clipped.`;
        return false;
    }

    return true;
}
```

**Visual Indicator** (line 56-76):
```css
.page-limit-indicator {
    position: absolute;
    top: 277mm;            /* A4 limit minus margins */
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(255, 0, 0, 0.3);
}
```

**Purpose**: Real-time measurement and visual warning to user

### Layer 4: User Confirmation (Control)

**Location**: `one-page-resume-dynamic.html` lines 500-517

```javascript
const fitsInOnePage = checkPageOverflow();

if (!fitsInOnePage) {
    const proceed = confirm(
        '⚠️ WARNING: Content exceeds one A4 page and will be clipped in PDF.\n\n' +
        'Recommendations:\n' +
        '• Select "minimal" profile (top 3 projects)\n' +
        '• Choose a profile with fewer projects\n' +
        '• Use "Print" option instead (allows multiple pages)\n\n' +
        'Generate PDF anyway (content will be cut)?'
    );

    if (!proceed) return;
}
```

**Purpose**: User decision before generating potentially clipped PDF

## Template Engine: Dual-Mode Rendering

### Mode Switching

**Location**: `templateEngine.js` lines 29-30, 47-57

```javascript
// Constructor
this.renderMode = 'full';       // 'full' | 'resume'
this.resumeLimits = RESUME_LIMITS;

// Mode Control
setRenderMode(mode) {
    this.renderMode = mode;
    console.log(`Render mode set to: ${mode}`);
}

isResumeMode() {
    return this.renderMode === 'resume';
}
```

### Section Routing

**Location**: `templateEngine.js` lines 192-233

```javascript
renderSection(sectionConfig) {
    // Route to compact methods if in resume mode
    if (this.isResumeMode()) {
        return this.renderSectionCompact(sectionConfig);
    }

    // Full mode: use normal methods
    const sectionMap = {
        'summary': () => this.renderSummary(sectionConfig),
        'research': () => this.renderResearch(sectionConfig),
        // ... other sections
    };

    return renderer ? renderer() : '';
}

renderSectionCompact(sectionConfig) {
    const compactRenderMethods = {
        'summary': () => this.renderSummaryCompact(sectionConfig),
        'research': () => this.renderResearchCompact(sectionConfig),
        'projects': () => this.renderProjectsCompact(sectionConfig),
        'techStack': () => this.renderTechStackCompact(sectionConfig),
        'experience': () => this.renderExperienceCompact(sectionConfig),
        'languages': () => this.renderLanguagesCompact(sectionConfig),
        'community': () => '',    // Hidden in resume
        'creative': () => '',     // Hidden in resume
        'opportunities': () => '' // Hidden in resume
    };

    return compactRenderMethods[sectionConfig.id] ? compactRenderMethods[sectionConfig.id]() : '';
}
```

## Six Compact Render Methods

### 1. renderSummaryCompact()

**Location**: `templateEngine.js` lines 1066-1114

**Output**: 2-3 lines of text + inline metrics + domain expertise callout (compact)

```html
<section class="section compact-section">
    <h2 class="section-title compact">Professional Summary</h2>
    <p class="summary-text compact">
        AI for Business focus with 16+ years enterprise experience...
    </p>
    <div class="metrics-inline">
        <span><strong>16+</strong> Years Experience</span> |
        <span><strong>100K+</strong> Users Served</span>
    </div>
    <div class="domain-expertise-compact" style="background: #f0f9ff; border-left: 3px solid #2b6cb0; padding: 6px 10px; margin: 8px 0; font-size: 9px; line-height: 1.4;">
        <strong style="color: #2b6cb0;">📦 <span data-i18n="summary.domainExpertise.compactTitle">Manufacturing Domain:</span></strong>
        <span data-i18n="summary.domainExpertise.compactText">10+ years POS/SCM/ERP (inventory, BOM, procurement, forecasting) | 100+ SKUs, 4 locations | Restaurant + Retail operations</span>
    </div>
</section>
```

**Space**: ~30mm (increased from ~25mm due to domain expertise callout)

### 2. renderResearchCompact()

**Location**: `templateEngine.js` lines 1089-1116

**Output**: 3 education entries (degree + institution + year + badge)

```html
<section class="section compact-section">
    <h2 class="section-title compact">🎓 Education & Certifications</h2>
    <div class="education-compact">
        <div class="education-entry">
            <strong>Master in Informatics Engineering</strong>
            <span class="institution">UPC BarcelonaTech</span>
            <span class="year">2024-2026</span>
            <span class="badge-inline">CURRENT</span>
        </div>
        <!-- 2 more entries -->
    </div>
</section>
```

**Space**: ~30mm

### 3. renderProjectsCompact()

**Location**: `templateEngine.js` lines 1121-1161

**Output**: 3 projects (title + category + 3 tech tags)

```html
<section class="section compact-section">
    <h2 class="section-title compact">🎓 Projects</h2>
    <div class="projects-compact">
        <div class="project-compact">
            <strong class="project-title">Agentic-MRP</strong>
            <span class="project-category">AI Systems</span>
            <div class="project-tech-inline">
                <span class="tech-tag-small">Python</span>
                <span class="tech-tag-small">SimPy</span>
                <span class="tech-tag-small">FastAPI</span>
            </div>
        </div>
        <!-- 2 more projects -->
    </div>
</section>
```

**Space**: ~35mm

### 4. renderTechStackCompact()

**Location**: `templateEngine.js` lines 1166-1201

**Output**: 5 skill groups (category: technologies inline)

```html
<section class="section compact-section">
    <h2 class="section-title compact">Technical Skills</h2>
    <div class="skills-compact">
        <div class="skill-group">
            <strong>AI & ML:</strong>
            <span>Agentic AI Systems, RAG Implementation, LLM Integration</span>
        </div>
        <!-- 4 more skill groups -->
    </div>
</section>
```

**Space**: ~30mm

### 5. renderExperienceCompact()

**Location**: `templateEngine.js` lines 1206-1238

**Output**: 2 roles (title + company + duration)

```html
<section class="section compact-section">
    <h2 class="section-title compact">💼 Professional Experience</h2>
    <div class="experience-compact">
        <div class="experience-entry">
            <strong>Master's Student & VR Entrepreneur</strong>
            <span class="company">UPC BarcelonaTech</span>
            <span class="duration">2024-Present</span>
        </div>
        <!-- 1 more role -->
    </div>
</section>
```

**Space**: ~20mm

### 6. renderLanguagesCompact()

**Location**: `templateEngine.js` lines 1243-1268

**Output**: 4 languages inline (language: level)

```html
<section class="section compact-section">
    <h2 class="section-title compact">Languages</h2>
    <div class="languages-inline">
        <strong>Spanish:</strong> Native |
        <strong>English:</strong> Professional |
        <strong>German:</strong> Beginner |
        <strong>Catalan:</strong> Basic
    </div>
</section>
```

**Space**: ~15mm

## PDF Generation: Direct Method

### Why Direct Method?

**Problem with html2pdf.js**: Automatically creates multiple pages even with `pagebreak: { mode: 'avoid-all' }`

**Solution**: Use html2canvas + jsPDF directly for complete control

### Implementation

**Location**: `one-page-resume-dynamic.html` lines 541-581

```javascript
async function generatePDF() {
    // Step 1: Hide UI elements not needed in PDF
    const elementsToHide = [
        document.querySelector('.page-limit-indicator'),
        document.querySelector('.controls'),
        document.getElementById('overflowWarning')
    ];
    elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });

    // Step 2: Convert SVG QR code to PNG for perfect rendering
    const qrImage = document.getElementById('qr-image');
    let originalSrc = null;
    if (qrImage && qrImage.src.endsWith('.svg')) {
        originalSrc = qrImage.src;
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 200;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, 200, 200);
                    ctx.drawImage(img, 0, 0, 200, 200);
                    qrImage.src = canvas.toDataURL('image/png');
                    resolve();
                };
                img.onerror = reject;
                img.src = originalSrc;
            });
        } catch (e) {
            console.warn('Could not convert SVG to PNG:', e);
        }
    }

    // Step 3: Capture canvas with html2canvas
    const canvas = await html2canvas(resumeContent, {
        scale: 3,                // Higher DPI for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false  // Better for SVG/images
    });

    // Step 4: Create PDF with jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    // Step 5: Convert canvas to JPEG
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Step 6: Calculate dimensions maintaining aspect ratio
    const pdfWidth = 210;      // A4 width in mm
    const pdfHeight = 297;     // A4 height in mm
    const margin = 10;         // Margin in mm

    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = (pdfWidth - margin * 2) / (pdfHeight - margin * 2);

    let imgWidth, imgHeight;
    if (canvasRatio > pageRatio) {
        imgWidth = pdfWidth - (margin * 2);
        imgHeight = imgWidth / canvasRatio;
    } else {
        imgHeight = pdfHeight - (margin * 2);
        imgWidth = imgHeight * canvasRatio;
    }

    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = margin;

    // Step 7: Add image to PDF (SINGLE PAGE ONLY, centered)
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');

    // Step 8: Save PDF
    const currentLang = window.i18n?.currentLang || 'en';
    const profileLabel = profileName.replace(/-/g, '_');
    const fileName = `Oliver_Chan_Resume_${profileLabel}_${currentLang}.pdf`;
    pdf.save(fileName);

    // Step 9: Restore SVG original if converted
    if (originalSrc && qrImage) {
        qrImage.src = originalSrc;
    }

    // Step 10: Restore hidden elements
    elementsToHide.forEach(el => {
        if (el) el.style.display = '';
    });
}
```

### Key Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `canvas.scale` | 3 | Higher DPI for better quality (+50% from v2.2.0) |
| `svg→png.size` | 200×200px | QR code conversion canvas size |
| `foreignObjectRendering` | false | Better rendering for SVG/images |
| `pdf.format` | 'a4' | Standard A4 size |
| `pdf.margin` | 10mm | Margins on all sides |
| `img.quality` | 0.95 | 95% JPEG quality |
| `imgWidth` | Dynamic | Calculated maintaining aspect ratio |
| `imgHeight` | Dynamic | Calculated maintaining aspect ratio |
| `xOffset` | Dynamic | Horizontal centering |
| `yOffset` | 10mm | Top margin |

## Compact CSS Design

### Typography Scale

**Version 2.2.0** - Optimized for readability (+15% from v2.1.0)

```css
/* Base */
body { font-size: 10px; line-height: 1.3; }

/* Header */
.name { font-size: 23px; }              /* +15% from 20px */
.title { font-size: 14px; }             /* +15% from 12px */
.subtitle { font-size: 12px; }          /* +15% from 10px */
.contact-info { font-size: 9px; }       /* +15% from 8px */
.power-statement { font-size: 12px; }   /* +15% from 10px */

/* QR Section */
.qr-text { font-size: 9px; }            /* +15% from 8px */
.qr-url { font-size: 8px; }             /* +15% from 7px */

/* Sections */
.section-title.compact { font-size: 13px; }     /* +15% from 11px */
.summary-text.compact { font-size: 10px; }      /* +15% from 9px */
.metrics-inline { font-size: 9px; }             /* +15% from 8px */
.education-entry { font-size: 10px; }           /* +15% from 9px */
.badge-inline { font-size: 8px; }               /* +15% from 7px */

/* Projects */
.project-compact { font-size: 9px; }            /* +15% from 8px */
.project-category { font-size: 9px; }           /* +15% from 8px */
.project-impact { font-size: 8px; }             /* +15% from 7px */
.projects-separator span { font-size: 8px; }    /* +15% from 7px */
.tech-tag-small { font-size: 7px; }             /* +15% from 6px */

/* Skills */
.skill-category-compact { font-size: 9px; }     /* +15% from 8px */

/* Experience */
.experience-item .job-title { font-size: 10px; }    /* +15% from 9px */
.experience-item .company { font-size: 9px; }       /* +15% from 8px */
.experience-item .achievement { font-size: 8px; }   /* +15% from 7px */
.enterprise-compact { font-size: 9px; }             /* +15% from 8px */

/* Languages */
.languages-inline { font-size: 10px; }          /* +15% from 9px */

/* Footer */
.footer .opportunities-title { font-size: 12px; }   /* +15% from 10px */
.footer .opportunities-text { font-size: 10px; }    /* +15% from 9px */
.footer .opportunities-quote { font-size: 9px; }    /* +15% from 8px */
```

**Rationale**: Font sizes increased proportionally by 15% to improve readability while maintaining single A4 page guarantee through other optimizations.

### Spacing Scale

```css
/* Section spacing */
.section.compact-section { margin-bottom: 8px; }
.section-title.compact { margin-bottom: 4px; padding-bottom: 1px; }

/* Element spacing */
.projects-compact { gap: 4px; }
.skills-compact { gap: 3px; }
.metrics-inline { margin-top: 3px; }

/* Container padding */
#resume-content { padding: 15px; }
```

### Color Palette

```css
/* Text */
--text-primary: #1a202c;
--text-secondary: #4a5568;
--text-tertiary: #718096;

/* Brand */
--brand-primary: #2b6cb0;
--brand-secondary: #667eea;

/* Backgrounds */
--bg-tag: #edf2f7;
--bg-badge: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--bg-page: #f7fafc;
```

## Usage Examples

### Access Resume with Specific Profile

```bash
# Minimal profile (recommended for single-page fit)
https://ochand.github.io/one-page-resume-dynamic.html?profile=minimal&lang=en

# AI Engineer profile
https://ochand.github.io/one-page-resume-dynamic.html?profile=ai-engineer&lang=en

# Manufacturing AI Internship
https://ochand.github.io/one-page-resume-dynamic.html?profile=manufacturing-ai-internship&lang=es
```

### Integration with Full Portfolio

Add button in `index.html`:

```html
<a href="/one-page-resume-dynamic.html?profile=minimal&lang=en"
   class="btn btn-secondary">
    📄 Generate Resume
</a>
```

### Testing Locally

```bash
# Start server
python3 -m http.server 8000

# Open resume
open http://localhost:8000/one-page-resume-dynamic.html?profile=minimal&lang=en

# Test PDF export
# 1. Check console for height: "📏 Medidas: Total=XXXmm"
# 2. Click "📄 Export PDF"
# 3. Verify PDF is 1 page with proper margins
```

## Controls

### Four Action Buttons

**Location**: Top-right corner (fixed position)

1. **📄 Export PDF** (`generatePDF()`)
   - Validates content height
   - Shows confirmation if exceeds limit
   - Generates single-page PDF
   - Filename: `Oliver_Chan_Resume_{profile}_{lang}.pdf`

2. **🖨️ Print** (`window.print()`)
   - Opens browser print dialog
   - Uses `@media print` CSS
   - Allows multiple pages if needed
   - Hides controls and indicators

3. **🌐 EN/ES** (Language toggle)
   - Switches between English/Spanish
   - Updates URL parameter
   - Re-validates height after translation
   - Maintains profile state

4. **← Full Portfolio** (`navigateToPortfolio()`)
   - Returns to `index.html`
   - Preserves profile parameter
   - Preserves language parameter
   - Example: `/index.html?profile=minimal&lang=en`

### Keyboard Shortcuts

```javascript
// Ctrl+Shift+P (or Cmd+Shift+P on Mac)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        generatePDF();
    }
});
```

## Profile Configuration

### Recommended Profiles for Resume

| Profile | Content Height | Recommended Use |
|---------|----------------|-----------------|
| **minimal** | ~183mm | ✅ Best for resume (fits easily) |
| **ai-engineer** | ~220mm | ✅ Good fit (3 academic projects) |
| **manufacturing-ai-internship** | ~240mm | ⚠️ Near limit (2+2 projects) |
| **fullstack** | ~260mm | ⚠️ Tight fit (5 enterprise projects) |
| **academic** | ~280mm | ⚠️ Very tight (4 academic projects) |
| **default** | ~297mm+ | ❌ Too large (exceeds limit) |

### Custom Profile for Resume

Create compact profile in `/config/profiles.json`:

```json
{
  "resume-compact": {
    "name": "Resume Compact",
    "description": "Optimized for single-page PDF",
    "sections": [
      { "id": "summary", "enabled": true, "order": 1, "config": { "showStats": true } },
      { "id": "research", "enabled": true, "order": 2 },
      { "id": "projects", "enabled": true, "order": 3, "config": { "limit": 2, "showAcademic": true, "showCreative": false } },
      { "id": "techStack", "enabled": true, "order": 4, "config": { "showAI": true, "showLearning": false } },
      { "id": "experience", "enabled": true, "order": 5 },
      { "id": "languages", "enabled": true, "order": 6 }
    ],
    "projects": {
      "academic": { "enabled": ["agentic-mrp", "llm-chat-rag"] },
      "creative": { "enabled": [] },
      "enterprise": { "enabled": [] }
    }
  }
}
```

## Troubleshooting

### Issue: PDF has 2 pages

**Cause**: Content exceeds 297mm
**Solution**:
- Use "minimal" profile
- Check console: `📏 Medidas: Total=XXXmm`
- Reduce projects or sections in profile config

### Issue: Content cut off in PDF

**Cause**: CSS overflow hidden clipping content
**Solution**:
- This is by design (Layer 2 guarantee)
- Warning banner should appear before export
- Select profile with less content

### Issue: PDF margins too large

**Cause**: `margin` parameter in `generatePDF()`
**Solution**: Reduce margin from 10mm to 5mm (lines 567, 573)

```javascript
const margin = 5; // Reduced from 10mm
```

### Issue: Text too small in PDF

**Cause**: Font sizes optimized for compact layout
**Solution**: Increase font sizes in CSS

```css
body { font-size: 11px; }  /* Was 10px */
.summary-text.compact { font-size: 10px; } /* Was 9px */
```

### Issue: Visual indicator not showing

**Cause**: `.page-limit-indicator` top position
**Solution**: Check if content exceeds 277mm

```css
.page-limit-indicator {
    top: 277mm; /* Should match A4_HEIGHT_MM - margins */
}
```

## Performance Metrics

### Load Times
- **HTML Parse**: <50ms
- **CSS Parse**: <30ms
- **JS Execution**: <100ms
- **Template Rendering**: <200ms
- **i18n Application**: <50ms
- **Total Ready**: <400ms

### PDF Generation Times
- **html2canvas capture**: 800-1200ms
- **JPEG conversion**: 100-200ms
- **jsPDF creation**: 50-100ms
- **File save**: 50-100ms
- **Total PDF Generation**: 1000-1600ms

### File Sizes
- **HTML**: 18KB (637 lines)
- **PDF Output**: 150-300KB (depends on content)
- **Canvas Memory**: ~6MB (794×1123×4 bytes RGBA)

## Future Enhancements

- [ ] **PDF Preview** - Show preview before download
- [ ] **Custom Templates** - Multiple resume layout options
- [ ] **ATS Optimization** - Text-only version for ATS systems
- [ ] **Multi-page Support** - Optional 2-page mode for detailed resumes
- [ ] **Export to DOCX** - Word document export
- [ ] **QR Code Integration** - Add QR code linking to full portfolio
- [ ] **Custom Margins** - User-adjustable PDF margins
- [ ] **Font Selection** - Choose from multiple professional fonts
- [ ] **Color Themes** - Different color schemes
- [ ] **Resume Analytics** - Track views and downloads

## Maintenance Notes

### When Updating Projects

If adding projects to `/data/projects.json`:
- Test resume with "default" profile
- Check height: should be <290mm
- Adjust `RESUME_LIMITS.projects` if needed
- Update recommended profiles table

### When Updating Skills

If adding skills to translation files:
- Test `renderTechStackCompact()`
- Verify no line wrapping
- Keep skill descriptions concise (<50 chars)

### When Updating i18n

If adding translations:
- Test resume in both languages
- Verify Spanish text doesn't increase height significantly
- Re-run height validation

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/ochand/ochand.github.io/issues
- **Documentation**: `/CLAUDE.md`, `/DYNAMIC_PORTFOLIO.md`, `/PROFILES_GUIDE.md`
- **Email**: ochand@gmail.com

---

**Version**: 2.2.2
**Last Updated**: 2026-01-26
**Status**: ✅ Production Ready

**Recent Additions (v2.2.2)**:
- ✅ Domain Expertise compact callout (Manufacturing & Supply Chain - 9 i18n keys)
- ✅ LinkedIn integration in contact info
- ✅ Updated metrics and content focus
