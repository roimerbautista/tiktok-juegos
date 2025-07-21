# 📁 Estructura del Proyecto - TikTok Racing Marathon

## 🎨 Nueva Arquitectura Mejorada

El proyecto ha sido reestructurado para seguir las mejores prácticas de desarrollo web, separando claramente las responsabilidades:

### 📂 Estructura de Archivos

```
proyecto_tiktok/
├── 📄 server.js              # Servidor Node.js principal
├── 📄 package.json           # Dependencias del proyecto
├── 📄 .env                   # Variables de entorno
├── 📁 public/                # Archivos estáticos del cliente
│   ├── 🎨 styles.css         # Estilos CSS separados
│   ├── 📄 index.html         # Estructura HTML limpia
│   └── ⚡ game.js            # Lógica JavaScript del cliente
└── 📁 .vercel/               # Configuración de despliegue
```

## 🎨 Características del Nuevo Diseño

### ✨ Mejoras Visuales
- **Diseño más elegante** con efectos glassmorphism
- **Animaciones suaves** y transiciones fluidas
- **Gradientes modernos** y efectos de brillo
- **Sombras profundas** para mayor profundidad visual
- **Iconos mejorados** con efectos hover

### 🌓 Sistema de Temas
- **Modo Claro**: Colores vibrantes con gradientes azul-púrpura
- **Modo Oscuro**: Tonos oscuros con acentos neón
- **Persistencia**: El tema se guarda en localStorage
- **Transiciones suaves** entre temas

### 📱 Diseño Responsive
- **Mobile-first**: Optimizado para dispositivos móviles
- **Breakpoints inteligentes**: 480px, 768px, 1024px
- **Canvas adaptativo**: Se ajusta automáticamente al tamaño de pantalla
- **Grid flexible**: Los paneles se reorganizan según el espacio disponible

### 🎯 Variables CSS Personalizadas
```css
:root {
  --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --accent-primary: #e74c3c;
  --accent-secondary: #27ae60;
  --text-primary: #ffffff;
  /* ... más variables */
}
```

## 🔧 Funcionalidades Técnicas

### 🎨 CSS (styles.css)
- **Variables CSS** para fácil personalización de temas
- **Flexbox y Grid** para layouts modernos
- **Animaciones CSS** con keyframes personalizados
- **Media queries** para responsive design
- **Pseudo-elementos** para efectos visuales avanzados

### 📄 HTML (index.html)
- **Estructura semántica** limpia y accesible
- **Atributos ARIA** para mejor accesibilidad
- **Meta tags** optimizados para SEO y viewport
- **Separación de responsabilidades** (sin CSS/JS inline)

### ⚡ JavaScript (game.js)
- **Funciones modulares** bien organizadas
- **Sistema de temas** con localStorage
- **Canvas responsive** con redimensionamiento automático
- **Event listeners** optimizados
- **Manejo de errores** mejorado

## 🚀 Cómo Usar

### 1. Instalación
```bash
npm install
```

### 2. Ejecutar en desarrollo
```bash
node server.js
```

### 3. Abrir en navegador
```
http://localhost:3000
```

## 🎮 Controles de Usuario

### 🌓 Cambio de Tema
- **Botón superior derecho**: Alterna entre modo claro y oscuro
- **Icono dinámico**: 🌙 para activar modo oscuro, ☀️ para modo claro
- **Persistencia**: El tema se mantiene entre sesiones

### 📱 Responsive
- **Automático**: La interfaz se adapta al tamaño de pantalla
- **Touch-friendly**: Botones y controles optimizados para móviles
- **Canvas escalable**: El juego se ve bien en cualquier dispositivo

## 🎨 Personalización

### Cambiar Colores del Tema
Edita las variables CSS en `styles.css`:
```css
:root {
  --accent-primary: #tu-color-aqui;
  --bg-primary: linear-gradient(135deg, #color1, #color2);
}
```

### Agregar Nuevas Animaciones
```css
@keyframes tuAnimacion {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Modificar Breakpoints
```css
@media (max-width: 768px) {
  /* Estilos para móviles */
}
```

## 🔍 Características Avanzadas

### ✨ Efectos Visuales
- **Shimmer effect** en el header
- **Glassmorphism** en paneles
- **Hover animations** en botones
- **Smooth transitions** en todos los elementos

### 🎯 Accesibilidad
- **Focus visible** mejorado
- **Reduced motion** para usuarios sensibles
- **Alto contraste** en modo oscuro
- **Navegación por teclado** optimizada

### ⚡ Performance
- **CSS optimizado** con selectores eficientes
- **Animaciones GPU-accelerated**
- **Lazy loading** de recursos
- **Debounced resize** events

## 🐛 Solución de Problemas

### El tema no se guarda
- Verificar que localStorage esté habilitado
- Comprobar permisos del navegador

### Canvas no responsive
- Verificar que `resizeCanvas()` se ejecute
- Comprobar event listeners de resize

### Estilos no se cargan
- Verificar ruta de `styles.css`
- Comprobar que el servidor sirva archivos estáticos

## 📈 Próximas Mejoras

- [ ] Más temas personalizables
- [ ] Animaciones de partículas mejoradas
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Más efectos visuales

---

**¡Disfruta del nuevo diseño mejorado! 🎉**