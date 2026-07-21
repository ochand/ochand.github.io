# Dynamic Portfolio System

Sistema completo de renderizado dinámico con soporte de perfiles para controlar visibilidad, orden y contenido del portafolio mediante configuración JSON, sin modificar código HTML/CSS.

## 🚀 Quick Start

### Usar el Sistema Dinámico

1. **Abrir la versión dinámica:**
   ```
   http://localhost:8000/index-dynamic.html
   ```

2. **Acceder a perfiles específicos:**
   ```
   http://localhost:8000/index-dynamic.html?profile=manufacturing-ai-internship
   http://localhost:8000/index-dynamic.html?profile=ai-engineer
   http://localhost:8000/index-dynamic.html?profile=fullstack
   ```

3. **Cambiar perfil visualmente:**
   - Usar el selector 📋 PROFILE en el header (top-right)
   - Seleccionar perfil deseado del dropdown
   - El portafolio se actualiza automáticamente

4. **Modificar configuración:**
   - Edita `/config/profiles.json` para perfiles
   - Edita `/data/projects.json` para proyectos individuales
   - Recargar página para ver cambios

---

## 📁 Estructura de Archivos

```
/
├── config/
│   ├── portfolio.json          # Configuración default (legacy)
│   └── profiles.json           # 6 perfiles de portafolio ⭐ NUEVO
├── data/
│   └── projects.json           # 12 proyectos con control individual (enabled/order)
├── locales/
│   ├── en.json                # Traducciones inglés (350+ líneas)
│   └── es.json                # Traducciones español (350+ líneas)
├── js/
│   ├── i18n.js                # Sistema de internacionalización
│   └── templateEngine.js       # Motor de renderizado + perfiles (850+ líneas)
├── index.html                  # Versión estática (original)
├── index-dynamic.html          # Versión dinámica con perfiles ⭐ PRIMARIA
├── CLAUDE.md                   # Documentación técnica para Claude Code
├── DYNAMIC_PORTFOLIO.md        # Esta documentación
├── PROFILES_GUIDE.md           # Guía de uso de perfiles
└── PROJECT_CONTROL_EXAMPLE.md  # Ejemplos de control de proyectos
```

---

## ⚙️ Configuración

### `/config/portfolio.json`

Control completo de secciones:

```json
{
  "sections": [
    {
      "id": "summary",
      "enabled": true,        // Mostrar/ocultar sección
      "order": 1,             // Orden de renderizado
      "config": {
        "showStats": true     // Opciones específicas
      }
    }
  ]
}
```

### Secciones Disponibles (9 Total)

| ID | Descripción | Contenido | Opciones Config |
|---|---|---|---|
| `summary` | Resumen profesional | Narrativa transición enterprise→AI + Domain Expertise callout (10+ años MRP/ERP) | `showStats` |
| `research` | Educación y certificaciones | 5 títulos (2003-2026) | `showCurrentBadge`, `emphasizeThesis` |
| `projects` | Proyectos académicos/creativos | 4 académicos + 3 creativos | `showAcademic`, `showCreative`, `limit`, `highlightAgenticMRP` |
| `techStack` | Stack técnico | 8 categorías con niveles | `showLearning`, `showAI`, `prioritizeManufacturingSkills` |
| `experience` | Historia profesional + enterprise | Timeline 4 roles + 5 proyectos | `showEnterpriseProjects`, `showProfessionalHistory`, `emphasizeERPExperience`, `limit` |
| `community` | Liderazgo comunitario | 3 organizaciones | `showSocialImpact` |
| `languages` | Idiomas | Español, inglés, catalán | `showProficiency` |
| `creative` | Tecnología creativa | Puente música/VR | `showSocialLinks` |
| `opportunities` | CTA oportunidades | Intereses AI + ubicación | `showCTA`, `customMessage` |

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Ocultar Sección de Idiomas

```json
{
  "id": "languages",
  "enabled": false,  // ❌ No se renderiza
  "order": 7
}
```

### Ejemplo 2: Reordenar Secciones

```json
{
  "sections": [
    { "id": "summary", "enabled": true, "order": 1 },
    { "id": "projects", "enabled": true, "order": 2 },  // Antes: order 3
    { "id": "research", "enabled": true, "order": 3 },  // Antes: order 2
  ]
}
```

### Ejemplo 3: Limitar Proyectos

```json
{
  "id": "projects",
  "enabled": true,
  "order": 3,
  "config": {
    "limit": 5,              // Mostrar solo 5 proyectos
    "showAcademic": true,
    "showCreative": false    // Ocultar proyectos creativos
  }
}
```

### Ejemplo 4: Control Individual de Proyectos (NUEVO)

```json
// En /data/projects.json
{
  "academic": [
    {
      "id": "agentic-mrp",
      "enabled": true,    // ✅ Mostrar
      "order": 1,         // Primero
      "title": "Agentic-MRP",
      ...
    },
    {
      "id": "llm-chat-rag",
      "enabled": false,   // ❌ Ocultar este proyecto
      "order": 2,
      "title": "LLM-Chat-RAG",
      ...
    },
    {
      "id": "himalayan-datavis",
      "enabled": true,
      "order": 3,         // Cambiar orden (ahora segundo)
      "title": "Himalayan-DataVis",
      ...
    }
  ]
}
```

---

## 🔧 Datos de Proyectos

### `/data/projects.json`

Estructura de datos para proyectos:

```json
{
  "academic": [
    {
      "id": "agentic-mrp",
      "title": "Agentic-MRP",
      "titleI18n": "projects.agenticMrp.title",
      "category": "research",
      "description": "...",
      "technologies": ["Python", "FastAPI"],
      "links": [
        { "url": "...", "label": "GitHub", "icon": "🔗" }
      ]
    }
  ],
  "creative": [...],
  "enterprise": [...]
}
```

---

## 🌐 Integración con i18n

El sistema es **100% compatible** con el sistema de internacionalización:

- ✅ **URL Detection** - Detecta idioma desde `?lang=es` o `?lang=en`
- ✅ **URL Updates** - Actualiza URL automáticamente al cambiar idioma
- ✅ **Todas las claves `data-i18n`** se mantienen en elementos renderizados
- ✅ **Cambio de idioma sin recargar** - Traducciones dinámicas
- ✅ **Experience achievements i18n** - Todos los roles profesionales traducidos (4 roles)
- ✅ **Domain Expertise i18n** - Sección completa con 9 traducciones (título, intro, 6 puntos clave, versión compacta)
- ✅ **Auto-sync** - Los `data-i18n` se aplican automáticamente al renderizar

```javascript
// Detección de idioma desde URL
getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && this.supportedLanguages.includes(langParam)) {
        return langParam;
    }
    // Fallback a pathname /es/
    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    return langMatch ? langMatch[1] : null;
}

// Actualización de URL al cambiar idioma (index.html)
const url = new URLSearchParams(window.location.search);
url.set('lang', lang);
window.history.pushState({}, '', `${window.location.pathname}?${url.toString()}`);

// El motor actualiza traducciones automáticamente
if (window.i18n) {
    window.i18n.translatePage();
}
```

---

## 🎯 Estado de Producción

### ✅ Archivos en Producción (v2.2.1)

**Portfolio Principal:**
- `index.html` - Versión dinámica con profiles y i18n ✅ **ACTIVO**
- `index-static.html` - Backup estático

**Resume System:**
- `one_page_resume.html` - Versión dinámica con PDF export ✅ **ACTIVO**
- `one_page_resume_static.html` - Backup original
- `one-page-resume-dynamic.html` - Versión de desarrollo

### Migración Histórica

**Portfolio (completada v2.0.0):**
```bash
mv index.html index-static.html
mv index-dynamic.html index.html
```

**Resume (completada v2.2.1):**
```bash
mv one_page_resume.html one_page_resume_static.html
cp one-page-resume-dynamic.html one_page_resume.html
```

### Opción: Mantener Ambas Versiones en Desarrollo

- `index.html` → Versión estática (fallback)
- `index-dynamic.html` → Versión dinámica (testing)

---

## 🧪 Testing

### Test Suite

Abrir: `http://localhost:8000/test-dynamic.html`

**Tests incluidos:**
1. ✅ Carga de configuración
2. ✅ Carga de datos de proyectos
3. ✅ Ordenamiento de secciones
4. ✅ Renderizado de tarjetas
5. ✅ Manipulación de configuración

### Testing Manual

```bash
# 1. Iniciar servidor
python3 -m http.server 8000

# 2. Abrir en navegador
open http://localhost:8000/index-dynamic.html

# 3. Modificar config/portfolio.json
# 4. Recargar página
# 5. Verificar cambios aplicados
```

---

## 🚨 Troubleshooting

### Problema: Secciones no se ocultan

**Solución:** Verificar que `data-dynamic-rendering` esté en el `<body>`:

```html
<body data-dynamic-rendering>
```

### Problema: i18n no funciona

**Solución:** Verificar orden de carga de scripts:

```html
<script src="./js/i18n.js"></script>
<script src="./js/templateEngine.js"></script>
```

### Problema: Proyectos no se renderizan

**Solución:** Verificar paths absolutos en fetch:

```javascript
fetch('/config/portfolio.json')  // ✅ Correcto
fetch('./config/portfolio.json') // ❌ Puede fallar
```

---

## 🎭 Sistema de Perfiles (NUEVO)

### Descripción

El sistema de perfiles permite crear múltiples configuraciones del portafolio para diferentes audiencias, todas accesibles mediante URL o selector visual.

### Perfiles Disponibles (6)

| Perfil | URL | Uso Recomendado | Proyectos | Secciones |
|--------|-----|-----------------|-----------|-----------|
| `default` | `?profile=default` | Vista general completa | 12 (todos) | 9 |
| `manufacturing-ai-internship` | `?profile=manufacturing-ai-internship` | Prácticas Industry 4.0 Barcelona | 4 (2 académicos + 2 enterprise) | 7 |
| `ai-engineer` | `?profile=ai-engineer` | Posiciones AI/ML engineer | 3 (académicos AI) | 7 |
| `fullstack` | `?profile=fullstack` | Roles full-stack/enterprise | 5 (enterprise) | 7 |
| `minimal` | `?profile=minimal` | Tarjetas/presentación rápida | 3 (top académicos) | 4 |
| `academic` | `?profile=academic` | Aplicaciones PhD/investigación | 4 (todos académicos) | 6 |

### Características del Sistema

- **Acceso por URL**: Enlace directo a perfil específico para compartir
- **Selector visual**: Dropdown 📋 PROFILE en header (top-right)
- **Persistencia**: Guardado en localStorage entre sesiones
- **Prioridad detección**: URL param → localStorage → default
- **Cambio dinámico**: Sin recarga de página (History API)
- **Integración i18n**: Controles traducidos (PROFILE/PERFIL)

### Ejemplo de Uso

**Para aplicación de trabajo:**
```
Hola reclutador,

Aquí mi portafolio enfocado en AI Engineering:
https://ochand.github.io?profile=ai-engineer

Portafolio completo:
https://ochand.github.io

Saludos,
Oliver
```

### Configurar Nuevo Perfil

1. Abrir `/config/profiles.json`
2. Agregar nuevo perfil:
```json
{
  "mi-perfil-custom": {
    "name": "Mi Perfil Custom",
    "description": "Para caso de uso específico",
    "sections": [
      { "id": "summary", "enabled": true, "order": 1 },
      { "id": "projects", "enabled": true, "order": 2, "config": { "limit": 2 } }
    ],
    "projects": {
      "academic": { "enabled": ["agentic-mrp"] },
      "creative": { "enabled": [] },
      "enterprise": { "enabled": [] }
    }
  }
}
```
3. Acceder: `?profile=mi-perfil-custom`

Ver guía completa en **`PROFILES_GUIDE.md`**

---

## 📊 Performance

- **Tamaño JSON:** ~35KB (profiles + projects + i18n)
- **Tiempo de carga:** <200ms (incluye profiles.json)
- **Renderizado inicial:** <400ms (incluye i18n)
- **Cambio de perfil:** <300ms (sin recarga)
- **Compatible con:** Chrome, Firefox, Safari, Edge

---

## 🔮 Roadmap (Futuro)

- [x] ✅ Sistema de perfiles múltiples (COMPLETADO)
- [x] ✅ Control individual de proyectos (COMPLETADO)
- [x] ✅ Integración i18n en controles UI (COMPLETADO)
- [x] ✅ Selector visual de perfiles (COMPLETADO)
- [x] ✅ 9 secciones completamente renderizadas (COMPLETADO)
- [ ] Panel de administración visual
- [ ] Drag & drop para reordenar secciones
- [ ] Exportar/importar configuración de perfiles
- [ ] Previsualización en tiempo real
- [ ] Temas/estilos configurables por perfil

---

## 📚 Recursos

- **Documentación técnica completa:** `/CLAUDE.md` - Arquitectura y detalles técnicos
- **Guía de usuario de perfiles:** `/PROFILES_GUIDE.md` - Cómo usar y crear perfiles
- **Ejemplos de control de proyectos:** `/PROJECT_CONTROL_EXAMPLE.md`
- **Test suite:** `/test-dynamic.html` - Suite de pruebas automatizadas
- **Configuración de perfiles:** `/config/profiles.json` - 6 perfiles predefinidos
- **Configuración legacy:** `/config/portfolio.json` - Configuración default original
- **Datos de proyectos:** `/data/projects.json` - 12 proyectos con control individual
- **Traducciones:** `/locales/en.json` y `/locales/es.json` - 500+ puntos de traducción

---

## 🤝 Contribuir

Para modificar o extender el sistema:

1. **Agregar nueva sección:**
   - Actualizar `portfolio.json`
   - Crear método `render[SectionName]()` en `templateEngine.js`
   - Agregar al `sectionMap` en `renderSection()`

2. **Agregar nuevo tipo de proyecto:**
   - Actualizar `projects.json`
   - Modificar `renderProjectsSection()` si necesario

3. **Testing:**
   - Verificar en `test-dynamic.html`
   - Probar cambio de idioma
   - Validar responsive design

---

**Versión:** 2.2.2 (Content Enhancement & Navigation)
**Última actualización:** 2025-10-31
**Autor:** Oliver Eduardo Chan Dorado

**Changelog v2.2.2:**
- ✅ **Resume Navigation Button** - Botón 📄 RÉSUMÉ en index.html con herencia de profile/lang
- ✅ **Domain Expertise Section** - Highlight box Manufacturing & Supply Chain (16+ años MRP/ERP)
  - Versión completa en index.html (después de highlight-stats, tema morado #8b5cf6)
  - Versión compacta en one_page_resume.html (después de metrics-inline)
  - 10 traducciones EN/ES por locale
- ✅ **LinkedIn Integration** - 💼 linkedin.com/in/ochand en contacto (portfolio + resume)
- ✅ **Enhanced Branding** - "Manufacturing AI Specialist" con enfoque en internship

**Changelog v2.0.2:**
- ✅ Sincronización completa index.html ↔ templateEngine.js
- ✅ Agregado soporte i18n para 3 títulos académicos (Master ITM, Intercambio, Licenciatura)
- ✅ Corregidos niveles de habilidades técnicas (Python/FastAPI: Advanced, AWS: Intermediate)
- ✅ Corregidos niveles AI (Agentic AI: Basic, Agentic Coding: Advanced)
- ✅ Actualizado Learning Stack (TensorFlow, Keras & PyTorch completo)
- ✅ Agregada sección Mobile Development (Flutter - Basic)
- ✅ Formato de duración corregido ("2024 - CURRENT FOCUS")
- ✅ Unificado conteo de usuarios a 140K+
- ✅ Sección Languages limpia (Professional sin detalles TOEFL)
- ✅ Agregado idioma Catalán (Básico - Lectura y Escucha)
- ✅ Agregado status a proyecto Himalayan-DataVis ("🚀 Streamlit Cloud ready")

**Changelog v2.0.0:**
- ✅ Sistema de 6 perfiles predefinidos
- ✅ Selector visual de perfiles con i18n
- ✅ URL-based profile access
- ✅ 9 secciones completamente renderizadas
- ✅ 5 grados académicos en sección research
- ✅ 4 roles profesionales en timeline de experience
- ✅ Controles UI traducidos (PROFILE/PERFIL, LANG/IDIOMA)
