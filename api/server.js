const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Estado del juego
let gameState = {
  isConnected: false,
  isRacing: false,
  currentUsername: '',
  countries: new Map(),
  raceConfig: {
    lapsToWin: 3,
    trackLength: 1000,
    currentLap: 1
  },
  leaderboard: [],
  totalViewers: 0
};

// Configuración de regalos y efectos
let giftConfig = {
  // Regalos básicos
  'Rose': { steps: 10, effect: 'normal', turbo: false, duration: 0, image: null },
  'Perfume': { steps: 15, effect: 'normal', turbo: false, duration: 0, image: null },
  'Swan': { steps: 25, effect: 'boost', turbo: false, duration: 3000, image: null },
  'Heart Me': { steps: 5, effect: 'normal', turbo: false, duration: 0, image: null },
  'TikTok': { steps: 20, effect: 'boost', turbo: false, duration: 2000, image: null },
  
  // Regalos premium
  'Drama Queen': { steps: 50, effect: 'turbo', turbo: true, duration: 5000, image: null },
  'Universe': { steps: 100, effect: 'mega_turbo', turbo: true, duration: 8000, image: null },
  'Lion': { steps: 75, effect: 'turbo', turbo: true, duration: 6000, image: null },
  'Rocket': { steps: 60, effect: 'turbo', turbo: true, duration: 4000, image: null },
  'Sports Car': { steps: 80, effect: 'turbo', turbo: true, duration: 7000, image: null },
  
  // Likes y follows
  'like': { steps: 1, effect: 'normal', turbo: false, duration: 0, image: null },
  'follow': { steps: 30, effect: 'boost', turbo: false, duration: 3000, image: null }
};
// AGREGAR esta función después de las configuraciones iniciales (línea 44 aproximadamente)
// Función para cargar regalos de forma manual (útil para debugging)
async function loadAvailableGifts(username) {
  try {
    // Crear una conexión temporal solo para obtener regalos
    const tempConnection = new WebcastPushConnection(username, {
      processInitialData: false,
      enableExtendedGiftInfo: true
    });
    
    console.log('🔄 Cargando regalos de forma manual...');
    const giftList = await tempConnection.getAvailableGifts();
    
    // Mapear los regalos
    const gifts = giftList.map(gift => ({
      id: gift.id,
      name: gift.name,
      image: gift.image?.url_list?.[0] || gift.image?.url || gift.icon?.url_list?.[0] || null,
      diamondCost: gift.diamond_count || gift.diamondCount || 0,
      type: gift.type || 'normal',
      description: gift.description || '',
      giftType: gift.gift_type || 1,
      isStreakable: gift.is_streakable || false
    }));
    
    console.log(`🎁 ${gifts.length} regalos cargados manualmente`);
    console.log('📋 Lista completa de regalos:');
    gifts.forEach((gift, index) => {
      console.log(`${index + 1}. ${gift.name} - ${gift.diamondCost} diamantes - Imagen: ${gift.image ? 'SÍ' : 'NO'}`);
    });
    
    return gifts;
    
  } catch (error) {
    console.error('❌ Error cargando regalos manualmente:', error);
    return [];
  }
}

// AGREGAR nueva ruta API para cargar regalos manualmente
app.post('/api/gifts/reload/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const gifts = await loadAvailableGifts(username);
    availableGifts = gifts;
    
    // Actualizar configuración de regalos
    gifts.forEach(gift => {
      if (!giftConfig[gift.name]) {
        let steps, effect, turbo, duration;
        
        if (gift.diamondCost <= 5) {
          steps = gift.diamondCost || 1;
          effect = 'normal';
          turbo = false;
          duration = 0;
        } else if (gift.diamondCost <= 50) {
          steps = gift.diamondCost * 2;
          effect = 'boost';
          turbo = false;
          duration = 2000;
        } else if (gift.diamondCost <= 200) {
          steps = gift.diamondCost * 1.5;
          effect = 'turbo';
          turbo = true;
          duration = 5000;
        } else {
          steps = gift.diamondCost;
          effect = 'mega_turbo';
          turbo = true;
          duration = 8000;
        }
        
        giftConfig[gift.name] = {
          steps: Math.floor(steps),
          effect: effect,
          turbo: turbo,
          duration: duration,
          image: gift.image
        };
      }
    });
    
    io.emit('giftsReloaded', {
      availableGifts: availableGifts,
      giftConfig: giftConfig
    });
    
    res.json({ 
      success: true, 
      giftsCount: gifts.length,
      gifts: gifts.slice(0, 10) // Solo primeros 10 para no saturar la respuesta
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Lista expandida de países disponibles con diseños únicos de carritos
const availableCountries = [
  { 
    code: 'US', name: 'Estados Unidos', flag: '🇺🇸', color: '#E74C3C', 
    aliases: ['usa', 'estados unidos', 'america', 'eeuu'],
    carDesign: { body: '🏎️', wheels: '⚪', trail: '💨', special: '⭐' }
  },
  { 
    code: 'MX', name: 'México', flag: '🇲🇽', color: '#27AE60', 
    aliases: ['mexico', 'méxico', 'mex'],
    carDesign: { body: '🚗', wheels: '🟢', trail: '🌵', special: '🌮' }
  },
  { 
    code: 'BR', name: 'Brasil', flag: '🇧🇷', color: '#3498DB', 
    aliases: ['brasil', 'brazil', 'br'],
    carDesign: { body: '🏁', wheels: '🟡', trail: '⚽', special: '🎭' }
  },
  { 
    code: 'AR', name: 'Argentina', flag: '🇦🇷', color: '#9B59B6', 
    aliases: ['argentina', 'arg', 'arge'],
    carDesign: { body: '🚙', wheels: '🔵', trail: '💃', special: '🥩' }
  },
  { 
    code: 'ES', name: 'España', flag: '🇪🇸', color: '#F39C12', 
    aliases: ['españa', 'espana', 'spain', 'esp'],
    carDesign: { body: '🏎️', wheels: '🔴', trail: '💃', special: '🐂' }
  },
  { 
    code: 'FR', name: 'Francia', flag: '🇫🇷', color: '#8E44AD', 
    aliases: ['francia', 'france', 'fr'],
    carDesign: { body: '🚗', wheels: '🔵', trail: '🥖', special: '🗼' }
  },
  { 
    code: 'DE', name: 'Alemania', flag: '🇩🇪', color: '#16A085', 
    aliases: ['alemania', 'germany', 'de', 'ger'],
    carDesign: { body: '🚘', wheels: '⚫', trail: '🍺', special: '🏰' }
  },
  { 
    code: 'IT', name: 'Italia', flag: '🇮🇹', color: '#E67E22', 
    aliases: ['italia', 'italy', 'it'],
    carDesign: { body: '🏎️', wheels: '🟢', trail: '🍝', special: '🍕' }
  },
  { 
    code: 'JP', name: 'Japón', flag: '🇯🇵', color: '#C0392B', 
    aliases: ['japon', 'japón', 'japan', 'jp'],
    carDesign: { body: '🚗', wheels: '⚪', trail: '🌸', special: '🗾' }
  },
  { 
    code: 'KR', name: 'Corea del Sur', flag: '🇰🇷', color: '#2980B9', 
    aliases: ['corea', 'korea', 'corea del sur', 'south korea', 'kr'],
    carDesign: { body: '🚙', wheels: '🔵', trail: '💜', special: '🎵' }
  },
  { 
    code: 'CN', name: 'China', flag: '🇨🇳', color: '#D35400', 
    aliases: ['china', 'cn'],
    carDesign: { body: '🚗', wheels: '🔴', trail: '🐉', special: '🏮' }
  },
  { 
    code: 'IN', name: 'India', flag: '🇮🇳', color: '#229954', 
    aliases: ['india', 'in'],
    carDesign: { body: '🚙', wheels: '🟠', trail: '🕉️', special: '🐘' }
  },
  { 
    code: 'CA', name: 'Canadá', flag: '🇨🇦', color: '#E74C3C', 
    aliases: ['canada', 'canadá', 'can'],
    carDesign: { body: '🚗', wheels: '🔴', trail: '🍁', special: '🏒' }
  },
  { 
    code: 'GB', name: 'Reino Unido', flag: '🇬🇧', color: '#3F51B5', 
    aliases: ['reino unido', 'uk', 'england', 'inglaterra', 'gb'],
    carDesign: { body: '🚘', wheels: '🔵', trail: '☂️', special: '👑' }
  },
  { 
    code: 'AU', name: 'Australia', flag: '🇦🇺', color: '#FF9800', 
    aliases: ['australia', 'au', 'aussie'],
    carDesign: { body: '🚙', wheels: '🟡', trail: '🦘', special: '🪃' }
  },
  { 
    code: 'RU', name: 'Rusia', flag: '🇷🇺', color: '#795548', 
    aliases: ['rusia', 'russia', 'ru'],
    carDesign: { body: '🚗', wheels: '⚪', trail: '❄️', special: '🐻' }
  },
  { 
    code: 'CO', name: 'Colombia', flag: '🇨🇴', color: '#FFEB3B', 
    aliases: ['colombia', 'co', 'col'],
    carDesign: { body: '🚙', wheels: '🟡', trail: '☕', special: '🦋' }
  },
  { 
    code: 'PE', name: 'Perú', flag: '🇵🇪', color: '#F44336', 
    aliases: ['peru', 'perú', 'pe'],
    carDesign: { body: '🚗', wheels: '🔴', trail: '🦙', special: '🏔️' }
  },
  { 
    code: 'CL', name: 'Chile', flag: '🇨🇱', color: '#2196F3', 
    aliases: ['chile', 'cl'],
    carDesign: { body: '🚘', wheels: '🔵', trail: '🌶️', special: '🏔️' }
  },
  { 
    code: 'VE', name: 'Venezuela', flag: '🇻🇪', color: '#FFEB3B', 
    aliases: ['venezuela', 've', 'ven'],
    carDesign: { body: '🚙', wheels: '🟡', trail: '🛢️', special: '🦜' }
  }
];

// Configuración: máximo 5 países por partida
const MAX_COUNTRIES_PER_RACE = 5;

// Lista de regalos disponibles del live actual
let availableGifts = [];

let tiktokConnection = null;

// Función para conectar a TikTok Live
// REEMPLAZAR la función connectToTikTok completa (líneas 45-120 aproximadamente)
function connectToTikTok(username) {
  return new Promise((resolve, reject) => {
    try {
      // Limpiar conexión anterior si existe
      if (tiktokConnection) {
        tiktokConnection.disconnect();
      }
      
      tiktokConnection = new WebcastPushConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 1000,
        sessionId: uuidv4()
      });
      
      // Eventos de conexión
      tiktokConnection.on('connected', async (state) => {
        console.log(`✅ Conectado a @${username}!`);
        gameState.isConnected = true;
        gameState.currentUsername = username;
        
        // *** CORRECCIÓN PRINCIPAL: Obtener regalos usando getAvailableGifts() ***
        try {
          console.log('🔄 Obteniendo lista de regalos disponibles...');
          const giftList = await tiktokConnection.getAvailableGifts();
          
          // Mapear los regalos con la estructura correcta
          availableGifts = giftList.map(gift => ({
            id: gift.id,
            name: gift.name,
            image: gift.image?.url_list?.[0] || gift.image?.url || gift.icon?.url_list?.[0] || null,
            diamondCost: gift.diamond_count || gift.diamondCount || 0,
            type: gift.type || 'normal',
            // Información adicional que puede ser útil
            description: gift.description || '',
            giftType: gift.gift_type || 1,
            isStreakable: gift.is_streakable || false
          }));
          
          console.log(`🎁 ${availableGifts.length} regalos disponibles cargados`);
          console.log('📋 Primeros 5 regalos:', availableGifts.slice(0, 5));
          
          // Actualizar la configuración de regalos con los nuevos encontrados
          availableGifts.forEach(gift => {
            if (!giftConfig[gift.name]) {
              // Asignar configuración por defecto basada en el costo
              let steps, effect, turbo, duration;
              
              if (gift.diamondCost <= 5) {
                steps = gift.diamondCost || 1;
                effect = 'normal';
                turbo = false;
                duration = 0;
              } else if (gift.diamondCost <= 50) {
                steps = gift.diamondCost * 2;
                effect = 'boost';
                turbo = false;
                duration = 2000;
              } else if (gift.diamondCost <= 200) {
                steps = gift.diamondCost * 1.5;
                effect = 'turbo';
                turbo = true;
                duration = 5000;
              } else {
                steps = gift.diamondCost;
                effect = 'mega_turbo';
                turbo = true;
                duration = 8000;
              }
              
              giftConfig[gift.name] = {
                steps: Math.floor(steps),
                effect: effect,
                turbo: turbo,
                duration: duration,
                image: gift.image
              };
            } else {
              // Actualizar solo la imagen si ya existe la configuración
              giftConfig[gift.name].image = gift.image;
            }
          });
          
          console.log(`⚙️ Configuración de regalos actualizada para ${Object.keys(giftConfig).length} regalos`);
          
        } catch (giftError) {
          console.warn('⚠️ No se pudieron obtener los regalos:', giftError.message);
          // Continuar sin regalos disponibles
          availableGifts = [];
        }
        
        io.emit('connectionStatus', { 
          connected: true, 
          username: username,
          roomInfo: state.roomInfo,
          availableGifts: availableGifts,
          giftConfig: giftConfig
        });
        
        resolve({ success: true, username: username });
      });
        
     
      
    // Resto de eventos (CONTINUAR después del evento 'connected')
      tiktokConnection.on('disconnected', () => {
        console.log('❌ Desconectado de TikTok');
        gameState.isConnected = false;
        io.emit('connectionStatus', { connected: false });
      });
      
      // Evento de error
      tiktokConnection.on('error', (err) => {
        console.error('Error de TikTok:', err);
        reject(err);
      });
      
      // Evento de like
      tiktokConnection.on('like', (data) => {
        handleTikTokEvent({
          type: 'like',
          user: data.uniqueId || 'Anónimo',
          likeCount: data.likeCount || 1,
          totalLikes: data.totalLikeCount || 0
        });
      });
      
      // *** EVENTO DE REGALO MEJORADO ***
      tiktokConnection.on('gift', (data) => {
        if (data.giftType === 1) { // Solo regalos enviados (no streak)
          // Buscar información detallada del regalo
          const giftInfo = availableGifts.find(gift => 
            gift.id === data.giftId || gift.name === data.giftName
          );
          
          handleTikTokEvent({
            type: 'gift',
            user: data.uniqueId,
            giftName: data.giftName,
            giftId: data.giftId,
            repeatCount: data.repeatCount || 1,
            cost: data.diamondCount || 0,
            // Información adicional del regalo
            giftInfo: giftInfo
          });
          
          console.log(`🎁 Regalo recibido: ${data.giftName} x${data.repeatCount} de @${data.uniqueId}`);
          if (giftInfo?.image) {
            console.log(`🖼️ Imagen del regalo: ${giftInfo.image}`);
          }
        }
      });
      
      // Evento de follow
      tiktokConnection.on('follow', (data) => {
        handleTikTokEvent({
          type: 'follow',
          user: data.uniqueId,
          followRole: data.followRole
        });
      });
      
      // Evento de comentario (para unirse a países)
      tiktokConnection.on('chat', (data) => {
        handleChatMessage(data);
      });
      
      // Evento de viewer count
      tiktokConnection.on('roomUser', (data) => {
        gameState.totalViewers = data.viewerCount || gameState.totalViewers;
        io.emit('viewerUpdate', { count: gameState.totalViewers });
      });
      
      // Conectar
      tiktokConnection.connect();
      
    } catch (error) {
      console.error('Error al conectar:', error);
      reject(error);
    }
  });
}

// Manejar mensajes de chat para unirse a países
function handleChatMessage(data) {
  const message = data.comment.toLowerCase().trim();
  const username = data.uniqueId;
  
  console.log(`💬 Chat de @${username}: "${data.comment}" (procesado: "${message}")`);
  
  // Buscar país por nombre exacto o alias
  const country = availableCountries.find(country => {
    // Verificar si el mensaje es exactamente el nombre del país o sus aliases
    const exactMatches = [
      country.name.toLowerCase(),
      country.code.toLowerCase(),
      ...country.aliases
    ];
    
    const foundMatch = exactMatches.some(match => {
       // El mensaje debe ser exactamente el nombre del país
       const isMatch = message === match || 
             message === `join ${match}` ||
             message === `team ${match}` ||
             message === `equipo ${match}` ||
             message === `unirse ${match}` ||
             message === `${match} team` ||
             message === `voy ${match}` ||
             message === `apoyo ${match}`;
       
       if (isMatch) {
         console.log(`✅ Match encontrado: "${message}" coincide con "${match}" para ${country.name}`);
       }
       return isMatch;
    });
    
    return foundMatch;
  });
  
  if (country) {
    console.log(`🏁 Usuario @${username} intentando unirse a ${country.name}`);
    joinUserToCountry(username, country);
  } else {
    console.log(`❌ No se encontró país para el mensaje: "${message}"`);
    console.log('📋 Países disponibles:', availableCountries.map(c => `${c.name} (${c.code}) [${c.aliases.join(', ')}]`));
  }
  
  // Emitir mensaje de chat (solo una vez)
  io.emit('chatMessage', {
    user: username,
    message: data.comment,
    timestamp: Date.now()
  });
}

// Unir usuario a un país
function joinUserToCountry(username, country) {
  console.log(`🔄 Procesando unión de @${username} a ${country.name}...`);
  
  // Verificar si el país ya existe
  const countryExists = gameState.countries.has(country.code);
  
  // Si el país no existe, verificar límite de países
  if (!countryExists && gameState.countries.size >= MAX_COUNTRIES_PER_RACE) {
    console.log(`🚫 Límite de países alcanzado (${MAX_COUNTRIES_PER_RACE}). @${username} no puede crear nuevo país.`);
    
    // Enviar mensaje informativo
    io.emit('chatMessage', {
      user: 'Sistema',
      message: `🚫 Máximo ${MAX_COUNTRIES_PER_RACE} países por carrera. Únete a un país existente: ${Array.from(gameState.countries.values()).map(c => c.name).join(', ')}`,
      timestamp: Date.now()
    });
    return;
  }
  
  // Remover usuario de otros países
  let removedFrom = [];
  gameState.countries.forEach((countryData, code) => {
    const initialLength = countryData.members.length;
    countryData.members = countryData.members.filter(member => member !== username);
    if (countryData.members.length < initialLength) {
      removedFrom.push(countryData.name);
    }
  });
  
  if (removedFrom.length > 0) {
    console.log(`🔄 Usuario @${username} removido de: ${removedFrom.join(', ')}`);
  }
  
  // Añadir al nuevo país
  if (!countryExists) {
    console.log(`🆕 Creando nuevo país: ${country.name} (${country.code}) - País ${gameState.countries.size + 1}/${MAX_COUNTRIES_PER_RACE}`);
    gameState.countries.set(country.code, {
      ...country,
      members: [],
      position: 0,
      currentLap: 1,
      speed: 0,
      turboUntil: 0,
      totalSteps: 0,
      wins: 0
    });
  }
  
  const countryData = gameState.countries.get(country.code);
  if (!countryData.members.includes(username)) {
    countryData.members.push(username);
    console.log(`✅ @${username} se unió a ${country.name}! Miembros: ${countryData.members.length}`);
    console.log(`👥 Miembros actuales de ${country.name}: ${countryData.members.join(', ')}`);
    console.log(`🏁 Países activos: ${gameState.countries.size}/${MAX_COUNTRIES_PER_RACE}`);
    
    io.emit('userJoinedCountry', {
      user: username,
      country: country,
      memberCount: countryData.members.length
    });
    
    io.emit('gameUpdate', {
      countries: Array.from(gameState.countries.values()),
      totalCountries: gameState.countries.size,
      maxCountries: MAX_COUNTRIES_PER_RACE
    });
  } else {
    console.log(`ℹ️ @${username} ya estaba en ${country.name}`);
  }
}

// Manejar eventos de TikTok
function handleTikTokEvent(event) {
  console.log('📱 Evento TikTok:', event);
  
  let giftInfo = null;
  let steps = 0;
  
  if (event.type === 'like') {
    giftInfo = giftConfig['like'];
    steps = giftInfo.steps * (event.likeCount || 1);
  } else if (event.type === 'follow') {
    giftInfo = giftConfig['follow'];
    steps = giftInfo.steps;
  } else if (event.type === 'gift') {
    giftInfo = giftConfig[event.giftName] || { steps: 5, effect: 'normal', turbo: false, duration: 0 };
    steps = giftInfo.steps * (event.repeatCount || 1);
  }
  
  if (giftInfo && steps > 0) {
    // Buscar el país del usuario
    let userCountry = null;
    for (const [code, countryData] of gameState.countries) {
      if (countryData.members.includes(event.user)) {
        userCountry = countryData;
        break;
      }
    }
    
    // Solo procesar eventos de usuarios que se han unido explícitamente a un país
    if (!userCountry) {
      // No asignar automáticamente, el usuario debe unirse explícitamente
      console.log(`⚠️ ${event.user} debe unirse a un país primero`);
      return;
    }
    
    if (userCountry) {
      // Aplicar efecto
      userCountry.position += steps;
      userCountry.totalSteps += steps;
      userCountry.speed += steps * 0.1;
      
      // Aplicar turbo si corresponde
      if (giftInfo.turbo && giftInfo.duration > 0) {
        userCountry.turboUntil = Date.now() + giftInfo.duration;
      }
      
      // Verificar si completó una vuelta
      if (userCountry.position >= gameState.raceConfig.trackLength) {
        userCountry.position = userCountry.position % gameState.raceConfig.trackLength;
        userCountry.currentLap++;
        
        // Verificar si ganó la carrera
        if (userCountry.currentLap > gameState.raceConfig.lapsToWin) {
          handleRaceWin(userCountry);
        } else {
          io.emit('lapCompleted', {
            country: userCountry,
            lap: userCountry.currentLap - 1
          });
        }
      }
      
      // Emitir actualización
      io.emit('gameUpdate', {
        countries: Array.from(gameState.countries.values()),
        event: {
          type: event.type,
          user: event.user,
          gift: event.giftName,
          steps: steps,
          country: userCountry.name,
          effect: giftInfo.effect
        }
      });
    }
  }
}

// Manejar victoria de carrera
function handleRaceWin(winnerCountry) {
  winnerCountry.wins++;
  
  // Actualizar leaderboard
  updateLeaderboard();
  
  io.emit('raceWin', {
    winner: winnerCountry,
    leaderboard: gameState.leaderboard
  });
  
  // Reiniciar carrera después de 10 segundos
  setTimeout(() => {
    resetRace();
  }, 10000);
}

// Actualizar leaderboard
function updateLeaderboard() {
  gameState.leaderboard = Array.from(gameState.countries.values())
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);
}

// Reiniciar carrera
function resetRace() {
  gameState.countries.forEach((country) => {
    country.position = 0;
    country.currentLap = 1;
    country.speed = 0;
    country.turboUntil = 0;
  });
  
  gameState.raceConfig.currentLap = 1;
  
  io.emit('raceReset', {
    countries: Array.from(gameState.countries.values())
  });
}

// Game loop
setInterval(() => {
  if (!gameState.isRacing || gameState.countries.size === 0) return;
  
  let hasUpdate = false;
  
  gameState.countries.forEach((country) => {
    // Movimiento base
    const baseSpeed = 0.2;
    let totalSpeed = baseSpeed;
    
    // Añadir velocidad por eventos
    if (country.speed > 0) {
      totalSpeed += country.speed * 0.05;
      country.speed *= 0.99; // Reducir gradualmente
    }
    
    // Turbo activo
    if (Date.now() < country.turboUntil) {
      totalSpeed *= 2.5;
    }
    
    // Aplicar movimiento
    if (totalSpeed > baseSpeed) {
      country.position += totalSpeed;
      hasUpdate = true;
    }
    
    // Verificar vuelta completada
    if (country.position >= gameState.raceConfig.trackLength) {
      country.position = country.position % gameState.raceConfig.trackLength;
      country.currentLap++;
      
      if (country.currentLap > gameState.raceConfig.lapsToWin) {
        handleRaceWin(country);
      } else {
        io.emit('lapCompleted', {
          country: country,
          lap: country.currentLap - 1
        });
      }
      hasUpdate = true;
    }
  });
  
  if (hasUpdate) {
    io.emit('gameUpdate', {
      countries: Array.from(gameState.countries.values())
    });
  }
}, 100); // 10 FPS

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas API
app.get('/api/status', (req, res) => {
  res.json({
    connected: gameState.isConnected,
    username: gameState.currentUsername,
    racing: gameState.isRacing,
    countries: Array.from(gameState.countries.values()),
    leaderboard: gameState.leaderboard,
    viewers: gameState.totalViewers,
    availableGifts: availableGifts
  });
});

// Obtener lista de regalos disponibles
app.get('/api/gifts', (req, res) => {
  res.json({
    availableGifts: availableGifts,
    giftConfig: giftConfig
  });
});

// Configurar regalo específico
app.post('/api/gifts/:giftName', (req, res) => {
  const { giftName } = req.params;
  const { steps, effect, duration, turbo } = req.body;
  
  if (!giftName) {
    return res.status(400).json({ error: 'Nombre de regalo requerido' });
  }
  
  giftConfig[giftName] = {
    steps: parseInt(steps) || 1,
    effect: effect || 'normal',
    duration: parseInt(duration) || 0,
    turbo: Boolean(turbo),
    image: giftConfig[giftName]?.image || null
  };
  
  console.log(`🎁 Regalo ${giftName} configurado:`, giftConfig[giftName]);
  
  // Emitir actualización a todos los clientes
  io.emit('giftConfigUpdated', { giftName, config: giftConfig[giftName] });
  
  res.json({ success: true, config: giftConfig[giftName] });
});

app.post('/api/connect', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ success: false, error: 'Username requerido' });
  }
  
  try {
    const result = await connectToTikTok(username);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/disconnect', (req, res) => {
  if (tiktokConnection) {
    tiktokConnection.disconnect();
    gameState.isConnected = false;
    gameState.currentUsername = '';
  }
  res.json({ success: true });
});

app.post('/api/race/start', (req, res) => {
  gameState.isRacing = true;
  resetRace();
  io.emit('raceStarted', {
    countries: Array.from(gameState.countries.values()),
    config: gameState.raceConfig
  });
  res.json({ success: true });
});

app.post('/api/race/stop', (req, res) => {
  gameState.isRacing = false;
  io.emit('raceStopped');
  res.json({ success: true });
});

app.get('/api/config/gifts', (req, res) => {
  res.json(giftConfig);
});

app.post('/api/config/gifts', (req, res) => {
  try {
    const newConfig = req.body;
    
    // Validar configuración
    for (const [giftName, config] of Object.entries(newConfig)) {
      if (typeof config.steps !== 'number' || config.steps < 0) {
        return res.status(400).json({ error: `Pasos inválidos para ${giftName}` });
      }
      if (!['normal', 'boost', 'turbo', 'mega_turbo'].includes(config.effect)) {
        return res.status(400).json({ error: `Efecto inválido para ${giftName}` });
      }
      if (typeof config.duration !== 'number' || config.duration < 0) {
        return res.status(400).json({ error: `Duración inválida para ${giftName}` });
      }
    }
    
    // Mantener imágenes existentes al actualizar
    for (const [giftName, config] of Object.entries(newConfig)) {
      giftConfig[giftName] = {
        ...config,
        image: giftConfig[giftName]?.image || null
      };
    }
    
    console.log('🎁 Configuración de regalos actualizada:', giftConfig);
    
    // Emitir actualización a todos los clientes
    io.emit('giftConfigUpdated', giftConfig);
    
    res.json({ success: true, config: giftConfig });
  } catch (error) {
    console.error('Error actualizando configuración de regalos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/countries', (req, res) => {
  res.json(availableCountries);
});

app.post('/api/config/race', (req, res) => {
  const { lapsToWin, trackLength } = req.body;
  if (lapsToWin) gameState.raceConfig.lapsToWin = parseInt(lapsToWin);
  if (trackLength) gameState.raceConfig.trackLength = parseInt(trackLength);
  res.json({ success: true, config: gameState.raceConfig });
});

// Socket.IO eventos
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  
  // Enviar estado inicial
  socket.emit('gameState', {
    connected: gameState.isConnected,
    username: gameState.currentUsername,
    racing: gameState.isRacing,
    countries: Array.from(gameState.countries.values()),
    leaderboard: gameState.leaderboard,
    config: gameState.raceConfig,
    viewers: gameState.totalViewers
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor TikTok Racing Marathon corriendo en puerto ${PORT}`);
  console.log(`🌐 Abrir: http://localhost:${PORT}`);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});