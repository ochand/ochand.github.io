# Portfolio Profiles System - User Guide

## 🎯 What Are Portfolio Profiles?

Portfolio Profiles allow you to **customize which sections and projects are shown** for different audiences without changing your code. Perfect for tailoring your portfolio for specific job applications, presentations, or contexts.

---

## 🚀 Quick Start

### **Access a Profile via URL**

```bash
# Default (complete) portfolio
https://ochand.github.io

# AI Engineer profile
https://ochand.github.io?profile=ai-engineer

# Manufacturing AI Internship profile
https://ochand.github.io?profile=manufacturing-ai-internship

# Full-Stack Developer profile
https://ochand.github.io?profile=fullstack

# Minimal portfolio
https://ochand.github.io?profile=minimal

# Academic profile
https://ochand.github.io?profile=academic
```

### **Switch Profiles Using the UI**

1. Open your portfolio: `https://ochand.github.io`
2. Click **📋 PROFILE** button (top-right)
3. Select desired profile from dropdown
4. Portfolio updates instantly!

---

## 📋 Available Profiles

### **1. Default - Complete Portfolio**
**URL:** `?profile=default` (or no parameter)

**Shows:**
- ✅ All sections (9 total)
- ✅ All projects (12 total)
  - 4 Academic
  - 3 Creative
  - 5 Enterprise

**Best for:** General visitors, comprehensive overview

---

### **2. AI for Business Internship** ⭐
**URL:** `?profile=manufacturing-ai-internship`

**Shows:**
- ✅ Summary (with business/manufacturing focus)
- ✅ Projects (limit: 2)
  - Agentic-MRP (highlighted)
  - LLM-Chat-RAG
- ✅ Research/Education
- ✅ Tech Stack (AI/ML emphasis)
- ✅ Languages
- ❌ Creative projects hidden
- ❌ Enterprise projects hidden

**Best for:** AI for Business / Industry 4.0 internship applications in Barcelona

**Key Focus:**
- Agentic AI systems
- Manufacturing intelligence
- Digital Twins & Multi-Agent Architecture
- Supply chain optimization
- 10+ years SCM/ERP development/implementation experience

---

### **3. AI Engineer**
**URL:** `?profile=ai-engineer`

**Shows:**
- ✅ Summary
- ✅ Research/Education
- ✅ AI/ML Projects only (3)
  - Agentic-MRP
  - LLM-Chat-RAG
  - Himalayan-DataVis
- ✅ Tech Stack (AI focus)
- ❌ Creative projects hidden
- ❌ Enterprise projects hidden

**Best for:** AI/ML engineer job applications

---

### **4. Full-Stack Developer**
**URL:** `?profile=fullstack`

**Shows:**
- ✅ Summary
- ✅ Enterprise Projects (5)
  - ERP2 Full-Stack
  - CFDI Full-Stack
  - uniCenta oPOS
  - Node POS Integration
  - WebESCPOSPrint Bridge
- ✅ Tech Stack
- ✅ Professional Experience
- ❌ Creative projects hidden

**Best for:** Full-stack/enterprise developer positions

---

### **5. Minimal**
**URL:** `?profile=minimal`

**Shows:**
- ✅ Summary
- ✅ Top 3 projects only
- ✅ Contact information
- ❌ Most sections hidden

**Best for:** Quick overview, business cards, elevator pitch

---

### **6. Academic**
**URL:** `?profile=academic`

**Shows:**
- ✅ Summary
- ✅ Research/Education (emphasized)
- ✅ Academic Projects only (4)
- ✅ Languages
- ❌ Enterprise projects hidden
- ❌ Creative projects hidden

**Best for:** PhD applications, academic positions, research collaborations

---

## 🔧 How It Works

### **Profile Detection Priority**

1. **URL Parameter**: `?profile=name` (highest priority)
2. **localStorage**: Last selected profile
3. **Default**: Falls back to `default` profile

### **Profile Persistence**

- ✅ Selected profile saved in browser (localStorage)
- ✅ Persists across page reloads
- ✅ Can be overridden by URL parameter
- ✅ Clear by selecting "default" profile

### **URL Updating**

When you switch profiles via UI:
- ✅ URL updates automatically: `?profile=new-profile`
- ✅ Can copy/share updated URL
- ✅ Browser back/forward works correctly
- ✅ No page reload required

---

## 📤 Sharing Profiles

### **For Recruiters**

```markdown
## Job Application Email Example

Hi [Recruiter],

Please find my portfolio tailored for this AI Engineer position:
https://ochand.github.io?profile=ai-engineer

For a complete view of my background:
https://ochand.github.io

Best regards,
Oliver
```

### **For LinkedIn/Social Media**

```
🤖 AI Systems Architect | Master's Student @ UPC BarcelonaTech

Check out my AI/ML portfolio:
👉 https://ochand.github.io?profile=ai-engineer

Full portfolio: https://ochand.github.io
```

### **For Specific Applications**

| Application Type | Recommended Profile | URL |
|-----------------|-------------------|-----|
| Manufacturing AI Internship | `manufacturing-ai-internship` | `?profile=manufacturing-ai-internship` |
| AI/ML Engineer | `ai-engineer` | `?profile=ai-engineer` |
| Full-Stack Developer | `fullstack` | `?profile=fullstack` |
| Academic Position | `academic` | `?profile=academic` |
| Quick Introduction | `minimal` | `?profile=minimal` |

---

## 🎨 Customizing Profiles

### **Edit Existing Profile**

1. Open `/config/profiles.json`
2. Find the profile to edit (e.g., `"ai-engineer"`)
3. Modify sections or projects:

```json
{
  "ai-engineer": {
    "name": "AI Engineer Focus",
    "sections": [
      { "id": "projects", "enabled": true, "order": 2, "config": { "limit": 5 } }
    ],
    "projects": {
      "academic": {
        "enabled": ["agentic-mrp", "llm-chat-rag", "himalayan-datavis"]
      }
    }
  }
}
```

4. Save and reload page

### **Create New Profile**

1. Add to `/config/profiles.json`:

```json
{
  "my-custom-profile": {
    "name": "My Custom Profile",
    "description": "Custom configuration for specific use case",
    "sections": [
      { "id": "summary", "enabled": true, "order": 1 },
      { "id": "projects", "enabled": true, "order": 2, "config": { "limit": 3 } }
    ],
    "projects": {
      "academic": { "enabled": ["agentic-mrp"] },
      "creative": { "enabled": [] },
      "enterprise": { "enabled": [] }
    }
  }
}
```

2. Access via: `?profile=my-custom-profile`

---

## 🧪 Testing Profiles

### **Local Testing**

```bash
# Start server
python3 -m http.server 8000

# Test each profile
open http://localhost:8000/index-dynamic.html?profile=default
open http://localhost:8000/index-dynamic.html?profile=ai-engineer
open http://localhost:8000/index-dynamic.html?profile=manufacturing-ai-internship
open http://localhost:8000/index-dynamic.html?profile=fullstack
open http://localhost:8000/index-dynamic.html?profile=minimal
open http://localhost:8000/index-dynamic.html?profile=academic
```

### **Verification Checklist**

For each profile, verify:
- [ ] Correct sections shown/hidden
- [ ] Correct projects displayed
- [ ] Proper ordering
- [ ] i18n translations working
- [ ] Profile selector shows current profile
- [ ] URL updates on profile switch
- [ ] Language switching works

---

## 💡 Best Practices

### **Profile Naming**

- ✅ **Use descriptive IDs**: `manufacturing-ai-internship` not `profile1`
- ✅ **Kebab-case**: `ai-engineer` not `AI_Engineer`
- ✅ **Short but clear**: `fullstack` not `full-stack-web-developer-position`

### **Profile Organization**

- ✅ **Keep profiles focused**: Each targets specific audience
- ✅ **Maintain consistency**: Don't duplicate projects unnecessarily
- ✅ **Update regularly**: Keep profiles in sync with new projects

### **URL Sharing**

- ✅ **Always include profile parameter**: Makes intent clear
- ✅ **Test URLs before sharing**: Ensure profile loads correctly
- ✅ **Use URL shorteners for print**: QR codes, business cards

---

## 🔍 Troubleshooting

### **Profile not loading**

**Problem:** URL has `?profile=xyz` but shows default

**Solutions:**
1. Check profile exists in `/config/profiles.json`
2. Verify JSON syntax (no trailing commas)
3. Clear localStorage: `localStorage.removeItem('selected-profile')`
4. Hard reload: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### **Projects not filtering**

**Problem:** Profile should hide projects but shows all

**Solutions:**
1. Check `projects.enabled` array in profile config
2. Verify project IDs match exactly (case-sensitive)
3. Ensure `enabled` is not empty array (shows all if empty)

### **UI selector not showing profiles**

**Problem:** Profile dropdown is empty

**Solutions:**
1. Wait for page to fully load
2. Check browser console for errors
3. Verify `templateEngine.js` loaded correctly
4. Check `/config/profiles.json` is accessible

---

## 📚 Advanced Usage

### **Programmatic Profile Switching**

```javascript
// Switch to profile
await window.templateEngine.switchProfile('ai-engineer');

// Get current profile
const current = window.templateEngine.getCurrentProfile();

// Get all available profiles
const profiles = window.templateEngine.getAvailableProfiles();

// Listen for profile changes
window.addEventListener('profileChanged', (e) => {
  console.log('Profile changed to:', e.detail.profile);
});
```

### **Conditional Content**

```javascript
// Show different content based on profile
const profile = window.templateEngine.getCurrentProfile();

if (profile === 'manufacturing-ai-internship') {
  // Highlight manufacturing-specific achievements
}
```

---

## 📊 Profile Comparison

| Feature | Default | Manufacturing AI | AI Engineer | Full-Stack | Minimal | Academic |
|---------|---------|-----------------|-------------|------------|---------|----------|
| Total Sections | 9 | 6 | 5 | 6 | 3 | 5 |
| Academic Projects | 4 | 2 | 3 | 0 | 1 | 4 |
| Creative Projects | 3 | 0 | 0 | 0 | 0 | 0 |
| Enterprise Projects | 5 | 0 | 0 | 5 | 0 | 0 |
| **Total Projects** | **12** | **2** | **3** | **5** | **1** | **4** |
| Focus | Complete | Manufacturing | AI/ML | Enterprise | Overview | Research |

---

## 🎯 Recommended Profiles by Use Case

### **Job Applications**

| Company Type | Profile | Why |
|-------------|---------|-----|
| AI Startup | `ai-engineer` | Shows AI/ML expertise |
| Manufacturing/Industry 4.0 | `manufacturing-ai-internship` | Highlights Agentic-MRP & 10+ years SCM/ERP experience |
| Enterprise SaaS | `fullstack` | Enterprise systems experience |
| Research Lab | `academic` | Academic focus |

### **Networking**

| Context | Profile | Why |
|---------|---------|-----|
| Quick intro | `minimal` | Fast overview |
| Conference | `ai-engineer` or `academic` | Depends on conference type |
| LinkedIn | `default` | Comprehensive view |
| Business card QR | `minimal` | Mobile-friendly overview |

---

## 📖 Related Documentation

- **Complete System Docs**: `/CLAUDE.md` - Portfolio Profiles System section
- **Technical Implementation**: `/DYNAMIC_PORTFOLIO.md`
- **Project Control**: `/PROJECT_CONTROL_EXAMPLE.md`

---

**Version:** 2.0.0
**Last Updated:** 2025-10-04
**Feature:** Portfolio Profiles System ✨
