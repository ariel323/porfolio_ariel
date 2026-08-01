# 📋 Guía Completa de Uso - Portfolio TypeScript

## 🎯 Inicio Rápido

### 1. Instalación

```powershell
# Clonar repositorio
git clone https://github.com/ariel323/porfolio_ariel.git
cd porfolio_ariel

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

El portafolio estará disponible en: `http://localhost:3000`

---

## 📝 Agregar Nuevos Proyectos

### Método 1: Editar JSON (Recomendado)

Abre `src/data/portfolio-data.json` y agrega tu proyecto:

```json
{
  "id": "nombre-unico-proyecto",
  "title": "Nombre del Proyecto",
  "shortDescription": "Descripción breve (max 100 caracteres)",
  "description": "Descripción completa del proyecto, características, tecnologías usadas...",
  "image": "assets/nombre-imagen.jpg",
  "technologies": ["React", "TypeScript", "Node.js", "Docker"],
  "category": "fullstack",
  "featured": true,
  "demoUrl": "https://mi-demo.com",
  "repoUrl": "https://github.com/ariel323/mi-proyecto",
  "date": "2025-10-07",
  "stats": {
    "stars": 0,
    "forks": 0,
    "language": "TypeScript"
  }
}
```

**Categorías disponibles:**

- `backend` - Java, Spring, Node.js, APIs
- `frontend` - React, Vue, Angular
- `fullstack` - Proyectos completos
- `devops` - Docker, CI/CD, infraestructura
- `ai-ml` - Machine Learning, IA

### Método 2: GitHub Topics (Automático)

1. Ve a tu repositorio en GitHub
2. Agrega el topic `portfolio`
3. El sistema detectará automáticamente el proyecto
4. Las estadísticas se actualizarán en vivo

---

## 🎨 Personalización

### Colores y Tema

Edita `src/styles/variables.css`:

```css
:root {
  /* Cambiar color principal */
  --color-accent: #64ffda;

  /* Cambiar fondo */
  --color-background: #0a192f;

  /* Cambiar gradiente */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Partículas 3D

Configura en `src/main.ts`:

```typescript
this.particlesSystem = new ParticlesSystem({
  container,
  particleCount: 150, // Más = más pesado
  particleColor: 0x64ffda, // Color en hex
  particleSize: 2, // Tamaño en px
  connectionDistance: 120, // Distancia de conexión
  mouseRadius: 100, // Radio de interacción mouse
});
```

**Valores recomendados:**

- PC potente: `particleCount: 200`
- PC normal: `particleCount: 150`
- PC antiguo: `particleCount: 80`

### Velocidad de Animaciones

Edita `src/components/AnimationsController.ts`:

```typescript
// Cambiar velocidad del hero
tl.from(".hero-section__title", {
  duration: 1.5, // Más lento
  y: 100,
  opacity: 0,
});
```

---

## 🔧 Configuración Avanzada

### GitHub API Rate Limit

Si ves muchas llamadas, crea un token:

1. Ve a GitHub Settings → Developer settings → Personal access tokens
2. Crea un token con scope `public_repo`
3. Agrega en `src/utils/GitHubAPI.ts`:

```typescript
async fetchRepositories() {
  const response = await fetch(url, {
    headers: {
      'Authorization': 'token TU_TOKEN_AQUI'
    }
  });
}
```

### SEO y Metadata

Edita `index.html`:

```html
<title>Tu Nombre | Tu Título</title>
<meta name="description" content="Tu descripción profesional" />
<meta property="og:title" content="Tu Nombre" />
<meta property="og:image" content="assets/tu-preview.jpg" />
```

---

## 📊 Sistema de Filtros

### Cómo Funciona

El sistema permite filtrar proyectos por:

- **Categoría** (Backend, Frontend, etc.)
- **Búsqueda** (Busca en título, descripción y tecnologías)
- **Ordenamiento** (Por fecha, nombre, estrellas)

### Personalizar Filtros

Edita `src/components/UIComponents.ts`:

```typescript
private createCategoryFilters(): string {
  const categories = [
    { id: 'all', label: 'Todos', icon: '📂' },
    { id: 'mi-categoria', label: 'Mi Categoría', icon: '🔥' },
    // Agrega más...
  ];
}
```

---

## Comandos Útiles

```powershell
# Desarrollo con hot reload
npm run dev

# Build optimizado para producción
npm run build

# Preview del build
npm run preview

# Verificar errores TypeScript
npm run type-check

# Limpiar y reinstalar
Remove-Item -Recurse -Force node_modules, dist
npm install
```

---

## 🌐 Deploy

### Vercel (Recomendado - Gratis)

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Netlify (Alternativa)

```powershell
# Build
npm run build

# Deploy
npx netlify-cli deploy --prod --dir=dist
```

### GitHub Pages

```powershell
# Build
npm run build

# Deploy a gh-pages branch
git subtree push --prefix dist origin gh-pages
```

Luego activa GitHub Pages en Settings → Pages

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'three'"

```powershell
npm install three @types/three
```

### Error: "Cannot find module 'gsap'"

```powershell
npm install gsap
```

### Las partículas no se ven

1. Verifica que Three.js está instalado
2. Revisa la consola del navegador
3. Asegúrate de que el contenedor existe:

```html
<div id="particles-container"></div>
```

### El sitio no carga en producción

1. Verifica rutas de imágenes (deben ser relativas)
2. Revisa `vite.config.ts` base path
3. Verifica que `dist/` tenga todos los archivos

### TypeScript muestra errores

```powershell
# Limpiar cache
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Verificar
npm run type-check
```

---

## 📚 Recursos Adicionales

### Three.js

- [Documentación oficial](https://threejs.org/docs/)
- [Ejemplos](https://threejs.org/examples/)

### GSAP

- [Documentación](https://greensock.com/docs/)
- [Cheatsheet](https://greensock.com/cheatsheet/)

### Vite

- [Guía](https://vitejs.dev/guide/)
- [Configuración](https://vitejs.dev/config/)

---

## 💡 Tips Pro

### Performance

1. **Optimiza imágenes:**

```powershell
# Usa WebP
npm install -g sharp-cli
sharp -i assets/*.jpg -o assets/ -f webp
```

2. **Lazy loading:**

```html
<img loading="lazy" src="..." alt="..." />
```

3. **Reduce partículas en móvil:**

```typescript
const isMobile = window.innerWidth < 768;
particleCount: isMobile ? 50 : 150,
```

### Accesibilidad

1. Agrega `alt` a todas las imágenes
2. Usa etiquetas semánticas (`<section>`, `<article>`)
3. Agrega `aria-label` a botones con solo iconos

---

## 🎓 Próximos Pasos

1. ✅ Personaliza colores y contenido
2. ✅ Agrega tus proyectos
3. ✅ Conecta GitHub API
4. ✅ Deploy a producción
5. ⬜ Agrega blog (próximamente)
6. ⬜ Agrega analytics
7. ⬜ Implementa i18n (multi-idioma)

---

## 📞 Soporte

¿Problemas? Abre un issue en GitHub:
https://github.com/ariel323/porfolio_ariel/issues

---

**Hecho con ❤️ y TypeScript**
