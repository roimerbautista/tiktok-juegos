# 🏁 TikTok Racing Marathon

**Juego de carreras interactivo en tiempo real conectado con TikTok Live**

¡Un emocionante juego donde los países compiten en un maratón y los viewers de TikTok Live pueden unirse a equipos y usar sus likes/regalos para impulsar a sus países favoritos!

## 🌟 Características Principales

### 🎮 Gameplay
- **Maratón de países**: Hasta 12 países pueden competir simultáneamente
- **Sistema de vueltas**: Configurable (1-10 vueltas para ganar)
- **Equipos dinámicos**: Los viewers se unen a países escribiendo comandos
- **Efectos de regalos**: Cada regalo de TikTok tiene efectos únicos
- **Turbo mode**: Regalos premium activan modo turbo temporal
- **Leaderboard en vivo**: Tabla de posiciones actualizada en tiempo real

### 🔗 Integración TikTok
- **Conexión real con TikTok Live** usando `tiktok-live-connector`
- **Eventos en tiempo real**: Likes, regalos, follows, comentarios
- **Sistema de comandos**: Los viewers escriben para unirse a países
- **Chat en vivo**: Mensajes mostrados en la interfaz
- **Contador de viewers**: Actualización automática

### ⚙️ Configuración Avanzada
- **Editor de regalos**: Configura pasos, duración y efectos turbo
- **Países personalizables**: 12 países predefinidos con banderas
- **Efectos visuales**: Partículas, explosiones, animaciones
- **Responsive design**: Funciona en desktop y móvil

## 🚀 Instalación Rápida

### Prerrequisitos
- **Node.js** 16+ 
- **npm** o **yarn**
- Conexión a internet
- Usuario de TikTok que esté haciendo Live

### 1. Clonar e instalar
```bash
# Navegar al directorio del proyecto
cd d:/proyectos/Proyectos/proyecto_tiktok

# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno
El archivo `.env` ya está configurado con valores por defecto. Puedes modificarlo si necesitas:

```env
PORT=3000
GAME_DEFAULT_LAPS=3
DEBUG_MODE=true
```

### 3. Iniciar el servidor
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# O modo producción
npm start
```

### 4. Abrir en el navegador
```
http://localhost:3000
```

## 🎯 Cómo Usar

### Para el Administrador del Juego:

1. **Conectar a TikTok Live**:
   - Ingresa el usuario de TikTok (sin @)
   - Haz clic en "Conectar a Live"
   - Espera la confirmación de conexión

2. **Configurar la carrera**:
   - Ajusta el número de vueltas para ganar
   - Configura los efectos de regalos si deseas
   - Haz clic en "Iniciar Maratón"

3. **Monitorear la carrera**:
   - Observa el canvas con la carrera en vivo
   - Revisa la tabla de posiciones
   - Sigue los eventos en tiempo real

### Para los Viewers de TikTok:

1. **Unirse a un país** (comandos exactos):
   ```
   USA             # Unirse a Estados Unidos
   Mexico          # Unirse a México
   Brasil          # Unirse a Brasil
   España          # Unirse a España
   
   # O con comandos específicos:
   join USA
   team Mexico
   equipo Brasil
   unirse España
   ```
   
   **⚠️ Importante:** Los comandos deben ser exactos. No funcionan mensajes como "quiero ir con USA" o "me gusta Mexico".

2. **Impulsar a tu país**:
   - **Likes** 👍: +1 paso cada like
   - **Regalos básicos** 🌹: +10-25 pasos
   - **Regalos premium** 💎🚀: +50-100 pasos + turbo
   - **Follow** ➕: +30 pasos + boost temporal

## 🎁 Sistema de Regalos

### Regalos Básicos
| Regalo | Pasos | Efecto | Turbo |
|--------|-------|-----------|-------|
| Like | 1 | Normal | No |
| Rose | 10 | Normal | No |
| Heart Me | 5 | Normal | No |
| Perfume | 15 | Normal | No |
| Swan | 25 | Boost | No |
| TikTok | 20 | Boost | No |

### Regalos Premium
| Regalo | Pasos | Efecto | Turbo | Duración |
|--------|-------|-----------|-------|----------|
| Rocket | 60 | Turbo | Sí | 4s |
| Lion | 75 | Turbo | Sí | 6s |
| Sports Car | 80 | Turbo | Sí | 7s |
| Drama Queen | 50 | Turbo | Sí | 5s |
| Universe | 100 | Mega Turbo | Sí | 8s |

### Eventos Especiales
| Evento | Pasos | Efecto |
|--------|-------|--------|
| Follow | 30 | Boost 3s |
| Multiple Likes | 1 x cantidad | Acumulativo |

## 🌍 Países Disponibles

1. 🇺🇸 Estados Unidos
2. 🇲🇽 México  
3. 🇧🇷 Brasil
4. 🇦🇷 Argentina
5. 🇪🇸 España
6. 🇫🇷 Francia
7. 🇩🇪 Alemania
8. 🇮🇹 Italia
9. 🇯🇵 Japón
10. 🇰🇷 Corea del Sur
11. 🇨🇳 China
12. 🇮🇳 India

## 🔧 Configuración Avanzada

### Personalizar Regalos
1. Haz clic en "Configurar Efectos"
2. Ajusta pasos, duración y turbo para cada regalo
3. Guarda los cambios
## 🔧 Configuración Avanzada
### Países Disponibles (16 países)
El juego ahora incluye 16 países con diseños únicos de carritos:

🇺🇸 **USA** - Carrito: 🚗 | Ruedas: ⚪ | Estela: 💨 | Especial: ⭐
🇲🇽 **México** - Carrito: 🌮 | Ruedas: 🟤 | Estela: 🌶️ | Especial: 🦅
🇧🇷 **Brasil** - Carrito: ⚽ | Ruedas: 🟢 | Estela: 🌿 | Especial: 🦜
🇦🇷 **Argentina** - Carrito: 🥩 | Ruedas: 🔵 | Estela: 💙 | Especial: ⚽
🇨🇴 **Colombia** - Carrito: ☕ | Ruedas: 🟡 | Estela: 🌺 | Especial: 🦋
🇪🇸 **España** - Carrito: 🥘 | Ruedas: 🔴 | Estela: 🌹 | Especial: 🐂
🇫🇷 **Francia** - Carrito: 🥖 | Ruedas: 🔵 | Estela: 🍷 | Especial: 🗼
🇩🇪 **Alemania** - Carrito: 🍺 | Ruedas: ⚫ | Estela: ⚙️ | Especial: 🏰
🇮🇹 **Italia** - Carrito: 🍝 | Ruedas: 🟢 | Estela: 🍅 | Especial: 🏛️
🇬🇧 **Reino Unido** - Carrito: ☕ | Ruedas: 🔴 | Estela: 🌧️ | Especial: 👑
🇯🇵 **Japón** - Carrito: 🍣 | Ruedas: ⚪ | Estela: 🌸 | Especial: 🗾
🇰🇷 **Corea del Sur** - Carrito: 🥢 | Ruedas: 🔴 | Estela: 💜 | Especial: 🎵
🇨🇳 **China** - Carrito: 🥟 | Ruedas: 🟡 | Estela: 🐉 | Especial: 🏮
🇮🇳 **India** - Carrito: 🍛 | Ruedas: 🟠 | Estela: 🌶️ | Especial: 🕉️
🇷🇺 **Rusia** - Carrito: 🪆 | Ruedas: 🔴 | Estela: ❄️ | Especial: 🐻
🇨🇦 **Canadá** - Carrito: 🍁 | Ruedas: 🔴 | Estela: 🏒 | Especial: 🦫

### Límite de Países
- **Máximo 5 países por carrera** para mantener la competencia equilibrada
- Cada país tiene un diseño único de carrito con efectos especiales
- Los primeros 5 países en unirse participan en la carrera

### Modificar Países
Edita el array `availableCountries` en `server.js` para personalizar países:

```javascript
const availableCountries = [
  { 
    code: 'XX', 
    name: 'Mi País', 
    flag: '🏳️', 
    color: '#FF0000',
    carDesign: {
      body: '🚗',
      wheels: '⚪',
      trail: '💨',
      special: '⭐'
    }
  },
  // ... más países
];
```

### Ajustar Configuración del Juego
Modifica las variables en `.env`:

```env
GAME_DEFAULT_LAPS=5          # Vueltas por defecto
GAME_TRACK_LENGTH=1500       # Longitud de la pista
GAME_MAX_COUNTRIES=8         # Máximo países
GAME_UPDATE_INTERVAL=50      # Intervalo de actualización (ms)
```

## 🎨 Personalización Visual

### Colores y Temas
Modifica los estilos CSS en `public/index.html`:

```css
body {
    background: linear-gradient(135deg, #tu_color1, #tu_color2);
}
```

### Efectos de Partículas
Ajusta los efectos en `public/game.js`:

```javascript
// Más partículas para efectos más intensos
for (let i = 0; i < 30; i++) {
    particles.push({
        // ... configuración de partículas
    });
}
```

## 🐛 Solución de Problemas

### Error de Conexión a TikTok
- **Verifica que el usuario esté en vivo**
- **Asegúrate de escribir el username sin @**
- **Revisa la consola del navegador para errores**

### El juego no se actualiza
- **Verifica la conexión a internet**
- **Recarga la página**
- **Revisa que el servidor esté corriendo**

### Los regalos no funcionan
- **Verifica que estés conectado a TikTok Live**
- **Asegúrate de que los viewers estén enviando regalos reales**
- **Revisa la configuración de regalos**

### Problemas de rendimiento
- **Reduce el número de partículas**
- **Aumenta el intervalo de actualización**
- **Cierra otras pestañas del navegador**

## 📱 Comandos para Viewers

### Unirse a Países

Los viewers pueden unirse escribiendo **exactamente** en el chat:

```
# Comandos exactos (sin palabras adicionales):
USA             # Unirse a Estados Unidos
Mexico          # Unirse a México  
Brasil          # Unirse a Brasil
España          # Unirse a España
Francia         # Unirse a Francia
Alemania        # Unirse a Alemania
Italia          # Unirse a Italia

# O con comandos específicos:
join USA
team Mexico
equipo Brasil
unirse España
```

**⚠️ Importante:** Los comandos deben ser exactos. No funcionan mensajes como "quiero ir con USA" o "me gusta Mexico".

### Comandos Especiales (próximamente)
```
status          # Ver estado del país
leaderboard     # Ver tabla de posiciones
help           # Mostrar ayuda
```

## 🔄 Actualizaciones y Mantenimiento

### Actualizar Dependencias
```bash
npm update
```

### Limpiar Cache
```bash
npm run clean  # Si tienes script de limpieza
```

### Backup de Configuración
Guarda copias de:
- `.env`
- Configuraciones personalizadas en `server.js`
- Estilos personalizados en `public/index.html`

## 🤝 Contribuir

¿Quieres mejorar el juego? ¡Genial!

1. Haz un fork del proyecto
2. Crea una rama para tu feature
3. Implementa tus cambios
4. Haz commit de tus cambios
5. Envía un pull request

### Ideas para Contribuir
- 🎵 Añadir efectos de sonido
- 🏆 Sistema de torneos
- 📊 Estadísticas avanzadas
- 🎨 Más temas visuales
- 🌐 Soporte multiidioma
- 📱 App móvil

## 📄 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

## 🆘 Soporte

¿Necesitas ayuda?

- 📧 Email: tu_email@ejemplo.com
- 💬 Discord: Tu servidor de Discord
- 🐛 Issues: GitHub Issues
- 📖 Wiki: GitHub Wiki

## 🎉 Créditos

- **TikTok Live Connector**: [tiktok-live-connector](https://www.npmjs.com/package/tiktok-live-connector)
- **Socket.IO**: Para comunicación en tiempo real
- **Express.js**: Framework del servidor
- **Canvas API**: Para renderizado del juego

---

**¡Disfruta del TikTok Racing Marathon! 🏁🎮**

*Hecho con ❤️ para la comunidad de TikTok*