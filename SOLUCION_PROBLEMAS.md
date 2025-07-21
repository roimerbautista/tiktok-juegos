# 🔧 Solución de Problemas - TikTok Racing Marathon

## ✅ Problemas Solucionados

### 1. **Error de Configuración de Regalos**
**Problema:** La configuración de regalos no se guardaba correctamente.
**Solución:** Se corrigió la ruta de la API de `/api/gift-config` a `/api/config/gifts`.

### 2. **Mensajes de Chat Duplicados**
**Problema:** Los comentarios aparecían dos veces en el chat.
**Solución:** Se eliminó la emisión duplicada de mensajes del sistema.

### 3. **Sistema de Debug Mejorado**
**Nuevo:** Se agregaron logs detallados para diagnosticar problemas de conexión y unión a países.

## 🎮 Cómo Usar el Sistema Correctamente

### **Paso 1: Conectar a TikTok Live**
1. Asegúrate de que el usuario de TikTok esté **EN VIVO**
2. Ingresa el nombre de usuario **sin @** (ejemplo: `usuario123`)
3. Haz clic en "Conectar a Live"
4. Verifica que aparezca "Conectado a @usuario123" en verde

### **Paso 2: Configurar Regalos**
1. Haz clic en "Configurar Regalos"
2. Ve a la pestaña "Regalos del Live" para ver los regalos disponibles
3. Configura cada regalo con:
   - **Pasos:** Cuánto avanza el país (1-200)
   - **Efecto:** Normal, Boost, Turbo, Mega Turbo
   - **Duración:** Tiempo del efecto en milisegundos
   - **Turbo:** Activar efecto especial
4. Haz clic en "Guardar Configuración"

### **Paso 3: Iniciar la Carrera**
1. Configura las vueltas para ganar (por defecto: 3)
2. Haz clic en "Comenzar Carrera"
3. Los viewers ahora pueden unirse escribiendo comandos

## 📝 Comandos para Viewers

### **Comandos Exactos (IMPORTANTE)**
Los viewers deben escribir **exactamente** uno de estos comandos:

```
# Nombres exactos de países:
USA
Mexico
Brasil
España
Francia
Alemania
Italia
Japon
Corea
Argentina

# O con palabras clave:
join USA
team Mexico
equipo Brasil
unirse España
voy Francia
apoyo Alemania
```

### **❌ Comandos que NO funcionan:**
- "quiero ir con USA"
- "me gusta Mexico"
- "vamos Brasil por favor"
- "USA es el mejor"

## 🔍 Diagnóstico de Problemas

### **Si los viewers no se pueden unir:**

1. **Verifica la conexión:**
   - ¿Aparece "Conectado a @usuario" en verde?
   - ¿El usuario está realmente en vivo?

2. **Revisa la terminal/consola:**
   - Busca mensajes como: `💬 Chat de @usuario: "mensaje"`
   - Si no aparecen, el problema es la conexión a TikTok
   - Si aparecen pero dice `❌ No se encontró país`, el comando está mal escrito

3. **Comandos de debug en la terminal:**
   ```
   💬 Chat de @usuario: "USA" (procesado: "usa")
   ✅ Match encontrado: "usa" coincide con "usa" para Estados Unidos
   🏁 Usuario @usuario intentando unirse a Estados Unidos
   ✅ @usuario se unió a Estados Unidos! Miembros: 1
   ```

### **Si la configuración de regalos no se guarda:**

1. **Verifica que estés en la pestaña correcta:**
   - "Regalos Configurados" para editar existentes
   - "Regalos del Live" para agregar nuevos

2. **Revisa la consola del navegador (F12):**
   - Busca errores de red o JavaScript
   - Debería aparecer: `✅ Configuración de regalos guardada`

3. **Recarga la página si es necesario**

## 🚨 Errores Comunes

### **"Error de conexión"**
- **Causa:** El usuario no está en vivo o el nombre está mal escrito
- **Solución:** Verifica que el usuario esté transmitiendo en vivo

### **"Los viewers no aparecen en países"**
- **Causa:** Comandos mal escritos o conexión perdida
- **Solución:** Pide a los viewers que usen comandos exactos

### **"Los regalos no tienen efecto"**
- **Causa:** Usuario no está en un país o configuración incorrecta
- **Solución:** El usuario debe unirse a un país primero

## 📊 Monitoreo en Tiempo Real

En la terminal verás:
- `💬` Mensajes de chat recibidos
- `🎁` Regalos recibidos
- `✅` Usuarios uniéndose a países
- `🏁` Progreso de la carrera
- `❌` Errores y problemas

## 🔄 Reiniciar el Sistema

Si hay problemas persistentes:
1. Detén el servidor (Ctrl+C)
2. Ejecuta: `npm start`
3. Reconecta a TikTok Live
4. Reinicia la carrera

---

**💡 Tip:** Mantén la terminal visible para monitorear la actividad en tiempo real y diagnosticar problemas rápidamente.