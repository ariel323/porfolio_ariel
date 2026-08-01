# 🔬 Code Laboratory - Live Code Execution Guide

## ✨ Características

El **Code Laboratory** es un editor de código en vivo integrado en tu portfolio que permite:

- ✅ **Ejecución en tiempo real** de código JavaScript
- ✅ **Editor editable** tipo VSCode
- ✅ **Console output en vivo** con colores
- ✅ **Syntax highlighting**
- ✅ **Playground interactivo**

---

## Cómo usar el Code Laboratory

### 1. **Acceder al Playground**

En el Code Laboratory, encontrarás varios tabs:

- 📋 **README.md** - Información del portfolio
- **playground.js** - ¡Aquí puedes ejecutar código en vivo!
- 💻 **[Proyectos]** - Ver código de tus proyectos
- 🛠️ **skills.json** - Tus habilidades

### 2. **Ejecutar código**

**Opción 1: Botón RUN**

1. Haz clic en el tab `playground.js`
2. Verás aparecer el botón verde **▶ RUN** en el header
3. Modifica el código como quieras
4. Haz clic en **RUN** para ejecutar

**Opción 2: Atajo de teclado**

- Presiona `Ctrl + Enter` para ejecutar el código

### 3. **Ver resultados**

Los resultados aparecen en el panel **OUTPUT** en la parte inferior:

- 📝 **console.log()** - Texto normal en azul
- ❌ **console.error()** - Errores en rojo
- ⚠️ **console.warn()** - Advertencias en amarillo
- ℹ️ **console.info()** - Información en verde

---

## 💡 Ejemplos de código

### Ejemplo 1: Operaciones básicas

```javascript
const greeting = "Hola desde Code Laboratory!";
console.log(greeting);

const sum = 5 + 10;
console.log("Resultado:", sum);
```

### Ejemplo 2: Arrays y métodos

```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);
console.log("Números duplicados:", doubled);

const total = numbers.reduce((a, b) => a + b, 0);
console.log("Total:", total);
```

### Ejemplo 3: Objetos

```javascript
const developer = {
  name: "Ariel Almada",
  role: "Full Stack Developer",
  skills: ["Java", "Node.js", "React"],
  experience: 2025,
};

console.log("Developer info:", developer);
console.log("Skills:", developer.skills.join(", "));
```

### Ejemplo 4: Funciones asíncronas

```javascript
async function fetchUserData() {
  console.log("🔄 Cargando datos...");

  // Simular API call
  const userData = {
    id: 1,
    name: "Ariel",
    projects: 10,
  };

  console.log("✅ Datos recibidos:", userData);
  return userData;
}

fetchUserData();
```

### Ejemplo 5: Loops y condicionales

```javascript
for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) {
    console.log(`${i} es par`);
  } else {
    console.log(`${i} es impar`);
  }
}
```

---

## 🎨 Características del Editor

### Syntax Highlighting

El código se colorea automáticamente:

- 🟣 **Keywords** (const, let, function) - Morado
- 🟢 **Strings** ("texto") - Verde
- 🟠 **Numbers** (123) - Naranja
- 🔵 **JSON keys** - Azul
- ⚫ **Comments** (//) - Gris

### Números de línea

- Cada línea tiene su número
- Los números se actualizan automáticamente al editar

### Console Interceptor

- Captura **todos** los console.log, error, warn, info
- Muestra timestamps
- Colorea según el tipo de mensaje

---

## ⚙️ Funciones Técnicas

### Ejecución segura

El código se ejecuta en un contexto controlado usando:

```javascript
new Function(code)();
```

### Captura de errores

Los errores se capturan automáticamente y se muestran en rojo:

```javascript
try {
  // tu código
} catch (error) {
  console.error("Error:", error.message);
}
```

### Historial de console

- Se guardan los últimos **50 outputs**
- Cada output tiene timestamp
- Se pueden distinguir por colores

---

## 🔧 Personalización

### Modificar el código predeterminado

Edita `src/components/CodeEditor.ts`, método `generatePlaygroundCode()`:

```typescript
private generatePlaygroundCode(): string {
  return `// Tu código personalizado aquí
console.log("¡Hola Mundo!");
`;
}
```

### Agregar más ejemplos

Simplemente modifica el string en `generatePlaygroundCode()` con tus ejemplos favoritos.

---

## 🎯 Casos de uso

1. **Demostrar habilidades de JavaScript** a reclutadores
2. **Ejecutar snippets** rápidos sin abrir DevTools
3. **Probar algoritmos** en tiempo real
4. **Mostrar tu código** de forma interactiva
5. **Impresionar** con un portfolio funcional

---

## 🐛 Limitaciones

- Solo funciona con **JavaScript** (no TypeScript compilado)
- No tiene acceso al DOM del portfolio (sandbox)
- No puede hacer fetch a APIs externas (CORS)
- Límite de 50 outputs en el historial

---

## 🎉 ¡Pruébalo ahora!

1. Abre tu portfolio
2. Ve a la sección **🔬 Code Laboratory**
3. Haz clic en **playground.js**
4. Modifica el código
5. Presiona **RUN** o `Ctrl+Enter`
6. ¡Mira los resultados en tiempo real!

---

**Creado con ❤️ por Ariel Almada**
**Tecnologías: TypeScript, Vite, GSAP, Three.js**
