# Control Individual de Proyectos - Guía Rápida

## ✨ Nueva Funcionalidad

Ahora **cada proyecto** tiene control individual de visibilidad y orden mediante los campos `enabled` y `order` en `/data/projects.json`.

---

## 🎯 Casos de Uso

### **1. Ocultar un Proyecto Específico**

```json
{
  "id": "llm-chat-rag",
  "enabled": false,  // ❌ Este proyecto no se renderizará
  "order": 2,
  "title": "LLM-Chat-RAG",
  ...
}
```

### **2. Reordenar Proyectos**

```json
// Cambiar orden: Himalayan-DataVis ahora primero
{
  "academic": [
    {
      "id": "himalayan-datavis",
      "enabled": true,
      "order": 1,  // Era 3, ahora 1 (primero)
      ...
    },
    {
      "id": "agentic-mrp",
      "enabled": true,
      "order": 2,  // Era 1, ahora 2 (segundo)
      ...
    }
  ]
}
```

### **3. Mostrar Solo Proyectos Destacados**

```json
{
  "academic": [
    {
      "id": "agentic-mrp",
      "enabled": true,  // ✅ Proyecto destacado
      "order": 1
    },
    {
      "id": "llm-chat-rag",
      "enabled": false,  // ❌ Ocultar
      "order": 2
    },
    {
      "id": "himalayan-datavis",
      "enabled": true,  // ✅ Proyecto destacado
      "order": 2  // Ahora será el segundo (después de agentic-mrp)
    },
    {
      "id": "misvids",
      "enabled": false,  // ❌ Ocultar
      "order": 4
    }
  ]
}
```

---

## 🔧 Cómo Funciona

### **Flujo de Renderizado:**

1. **Filtrado:** Solo proyectos con `enabled: true` (o sin el campo)
2. **Ordenamiento:** Por campo `order` (ascendente)
3. **Límite de sección:** Aplica `config.limit` si existe
4. **Renderizado:** Muestra proyectos finales

### **Ejemplo Completo:**

```json
// /data/projects.json
{
  "academic": [
    {
      "id": "agentic-mrp",
      "enabled": true,
      "order": 1,
      "title": "Agentic-MRP",
      "category": "research",
      ...
    },
    {
      "id": "llm-chat-rag",
      "enabled": false,  // OCULTO
      "order": 2,
      ...
    },
    {
      "id": "himalayan-datavis",
      "enabled": true,
      "order": 3,
      ...
    },
    {
      "id": "misvids",
      "enabled": true,
      "order": 4,
      ...
    }
  ],
  "creative": [
    {
      "id": "museo-virtual-ar",
      "enabled": true,
      "order": 1,
      ...
    },
    {
      "id": "calabozo-vr",
      "enabled": false,  // OCULTO
      "order": 2,
      ...
    },
    {
      "id": "audio-splitter",
      "enabled": true,
      "order": 3,
      ...
    }
  ],
  "enterprise": [
    {
      "id": "erp2",
      "enabled": true,
      "order": 1,
      ...
    },
    {
      "id": "cfdi",
      "enabled": true,
      "order": 2,
      ...
    },
    {
      "id": "unicenta",
      "enabled": false,  // OCULTO
      "order": 3,
      ...
    },
    {
      "id": "node-pos",
      "enabled": true,
      "order": 4,
      ...
    },
    {
      "id": "webescpos",
      "enabled": true,
      "order": 5,
      ...
    }
  ]
}
```

**Resultado:**
- **Academic:** 3 proyectos (agentic-mrp, himalayan-datavis, misvids)
- **Creative:** 2 proyectos (museo-virtual-ar, audio-splitter)
- **Enterprise:** 4 proyectos (erp2, cfdi, node-pos, webescpos)

---

## 💡 Combinación con Límite de Sección

```json
// /config/portfolio.json
{
  "id": "projects",
  "enabled": true,
  "order": 3,
  "config": {
    "limit": 3,  // Solo 3 proyectos TOTALES
    "showAcademic": true,
    "showCreative": true
  }
}
```

**Con proyectos individuales:**

```json
// /data/projects.json - Academic
[
  { "id": "agentic-mrp", "enabled": true, "order": 1 },
  { "id": "llm-chat-rag", "enabled": false, "order": 2 },  // OCULTO
  { "id": "himalayan-datavis", "enabled": true, "order": 3 }
]

// /data/projects.json - Creative
[
  { "id": "museo-virtual-ar", "enabled": true, "order": 1 },
  { "id": "calabozo-vr", "enabled": true, "order": 2 }
]
```

**Orden de renderizado:**
1. agentic-mrp (academic, order: 1)
2. himalayan-datavis (academic, order: 3)
3. museo-virtual-ar (creative, order: 1)

**Límite aplicado:** Solo 3 proyectos se muestran (calabozo-vr no se renderiza por el límite)

---

## 📊 Campos de Proyecto

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único |
| `enabled` | boolean | ❌ | `true` (default) o `false` para ocultar |
| `order` | number | ❌ | Orden de renderizado (default: 999) |
| `title` | string | ✅ | Título del proyecto |
| `category` | string | ✅ | `research`, `creative`, `enterprise` |
| ... | ... | ... | Otros campos existentes |

---

## 🧪 Testing

### **Prueba Rápida:**

1. **Ocultar un proyecto:**
   ```json
   { "id": "llm-chat-rag", "enabled": false, "order": 2 }
   ```

2. **Recargar página:**
   ```bash
   http://localhost:8000/index-dynamic.html
   ```

3. **Verificar:** El proyecto no debe aparecer

### **Cambiar Orden:**

1. **Modificar orders:**
   ```json
   { "id": "himalayan-datavis", "order": 1 }  // Ahora primero
   { "id": "agentic-mrp", "order": 2 }        // Ahora segundo
   ```

2. **Recargar y verificar** nuevo orden

---

## 🎯 Casos de Uso Reales

### **Portfolio Minimalista (Solo Mejores Proyectos)**

```json
// Mostrar solo 3 proyectos destacados
{
  "academic": [
    { "id": "agentic-mrp", "enabled": true, "order": 1 },
    { "id": "llm-chat-rag", "enabled": false },  // Ocultar
    { "id": "himalayan-datavis", "enabled": false },  // Ocultar
    { "id": "misvids", "enabled": false }  // Ocultar
  ],
  "creative": [
    { "id": "museo-virtual-ar", "enabled": true, "order": 2 },
    { "id": "calabozo-vr", "enabled": false },  // Ocultar
    { "id": "audio-splitter", "enabled": false }  // Ocultar
  ],
  "enterprise": [
    { "id": "erp2", "enabled": true, "order": 3 },
    { "id": "cfdi", "enabled": false },  // Ocultar
    // ... resto ocultos
  ]
}
```

### **Portfolio para Aplicación de Trabajo (Relevante al Puesto)**

```json
// Ejemplo: Aplicando a puesto de AI Engineer
{
  "academic": [
    { "id": "agentic-mrp", "enabled": true, "order": 1 },     // ✅ AI
    { "id": "llm-chat-rag", "enabled": true, "order": 2 },    // ✅ AI/LLM
    { "id": "himalayan-datavis", "enabled": true, "order": 3 }, // ✅ Data Science
    { "id": "misvids", "enabled": false }  // ❌ No relevante
  ],
  "creative": [
    { "id": "museo-virtual-ar", "enabled": false },  // ❌ No relevante
    { "id": "calabozo-vr", "enabled": false },       // ❌ No relevante
    { "id": "audio-splitter", "enabled": false }     // ❌ No relevante
  ]
}
```

---

## 📚 Referencias

- **Documentación completa:** `/DYNAMIC_PORTFOLIO.md`
- **Configuración de secciones:** `/config/portfolio.json`
- **Datos de proyectos:** `/data/projects.json`
- **Guía técnica:** `/CLAUDE.md`

---

**Versión:** 1.1.0
**Última actualización:** 2025-10-04
**Nueva funcionalidad:** Control individual de proyectos ✨
