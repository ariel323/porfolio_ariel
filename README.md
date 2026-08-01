# Portfolio Ariel Almada - TypeScript + 3D Interactive

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02)](https://greensock.com/gsap/)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-000000)](https://threejs.org/)

Portafolio profesional ultra-moderno con **arquitectura TypeScript modular**, efectos 3D interactivos, animaciones cinematográficas y sistema de datos dinámico.

## ✨ Características

- 🎨 **Sistema de Partículas 3D** interactivo con Three.js
- ⚡ **Animaciones GSAP** profesionales
- 📊 **Integración GitHub API** en tiempo real
- 🔍 **Filtros dinámicos** y búsqueda instantánea
- 🏗️ **Arquitectura TypeScript** escalable
- 🎭 **Glass Morphism** y gradientes modernos

## Instalación

```powershell
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build
```

## 📝 Agregar Proyectos

Edita `src/data/portfolio-data.json`:

```json
{
  "projects": [
    {
      "id": "mi-proyecto",
      "title": "Mi Proyecto",
      "technologies": ["React", "TypeScript"],
      "category": "fullstack",
      "repoUrl": "https://github.com/..."
    }
  ]
}
```

## 👤 Autor

**Ariel Almada** - Fullstack Developer  
GitHub: [@ariel323](https://github.com/ariel323)

---

⭐ Made with TypeScript & passion

## 📱 Probar en móvil (rápido)

1. Instala dependencias y levanta el servidor de desarrollo:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

2. Averigua la IP local de tu máquina (ej. `192.168.0.147`) con `ipconfig` / `ifconfig`.

3. En tu móvil, abre: `http://<TU_IP_LOCAL>:5173/` (por ejemplo `http://192.168.0.147:5173/`).

Nota: Si no puedes conectar, verifica que tu PC y el móvil estén en la misma red Wi‑Fi y que el firewall permita conexiones al puerto 5173.

