// Cliente del juego TikTok Racing Marathon
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

// Funcionalidad del tema
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Oscuro';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Claro';
        localStorage.setItem('theme', 'dark');
    }
}

// Cargar tema guardado
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Claro';
    }
}

// Hacer el canvas responsive
function resizeCanvas() {
    const container = document.querySelector('.container');
    const containerWidth = container.clientWidth - 40; // padding
    const maxWidth = 1200;
    const aspectRatio = 600 / 1200;
    
    let canvasWidth = Math.min(containerWidth, maxWidth);
    let canvasHeight = canvasWidth * aspectRatio;
    
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    // Mantener la resolución interna
    canvas.width = 1200;
    canvas.height = 600;
}

// Estado del juego
let gameState = {
    connected: false,
    username: '',
    racing: false,
    countries: [],
    leaderboard: [],
    config: { lapsToWin: 3, trackLength: 1000 },
    viewers: 0,
    availableGifts: [],
    giftConfig: {}
};

// Estado de la configuración de regalos
let currentTab = 'configured';

// Efectos visuales
let particles = [];
let explosions = [];
let backgroundStars = [];
let lastWinner = null;
let giftConfig = {};

// Inicializar estrellas de fondo
function initBackgroundStars() {
    backgroundStars = [];
    for (let i = 0; i < 50; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

// Eventos de Socket.IO
socket.on('gameState', (state) => {
    gameState = { ...gameState, ...state };
    if (state.availableGifts) {
        gameState.availableGifts = state.availableGifts;
        updateGiftCount();
    }
    updateUI();
});

socket.on('connectionStatus', (status) => {
    gameState.connected = status.connected;
    gameState.username = status.username || '';
    
    if (status.availableGifts) {
        gameState.availableGifts = status.availableGifts;
        updateGiftCount();
        addEventToLog({
            type: 'system',
            message: `🎁 ${status.availableGifts.length} regalos disponibles cargados`,
            timestamp: Date.now()
        });
    }
    
    updateConnectionStatus();
    
    if (status.connected) {
        addEventToLog({
            type: 'system',
            message: `✅ Conectado a @${status.username}`,
            timestamp: Date.now()
        });
    }
});

socket.on('gameUpdate', (update) => {
    if (update.countries) {
        gameState.countries = update.countries;
        updateLeaderboard();
        updateCountryCount();
    }
    
    if (update.event) {
        addEventToLog(update.event);
        createEventEffect(update.event);
    }
});

socket.on('raceStarted', (data) => {
    gameState.racing = true;
    gameState.countries = data.countries;
    gameState.config = data.config;
    updateRaceStatus('🏁 ¡Maratón en curso!', 'status-racing');
    
    addEventToLog({
        type: 'system',
        message: '🚀 ¡Maratón iniciado! Los países están corriendo.',
        timestamp: Date.now()
    });
});

socket.on('raceStopped', () => {
    gameState.racing = false;
    updateRaceStatus('⏹️ Carrera detenida', 'status-disconnected');
});

socket.on('raceWin', (data) => {
    lastWinner = data.winner;
    updateLeaderboard();
    
    addEventToLog({
        type: 'victory',
        message: `🏆 ¡${data.winner.flag} ${data.winner.name} ganó la carrera!`,
        country: data.winner,
        timestamp: Date.now()
    });
    
    createVictoryEffect(data.winner);
    updateRaceStatus(`🏆 ¡${data.winner.name} ganó!`, 'status-connected');
});

socket.on('raceReset', (data) => {
    gameState.countries = data.countries;
    lastWinner = null;
    updateRaceStatus('🔄 Nueva carrera iniciando...', 'status-racing');
    
    addEventToLog({
        type: 'system',
        message: '🔄 Nueva carrera iniciada. ¡A correr!',
        timestamp: Date.now()
    });
});

socket.on('lapCompleted', (data) => {
    addEventToLog({
        type: 'lap',
        message: `🏃‍♂️ ${data.country.flag} ${data.country.name} completó la vuelta ${data.lap}!`,
        country: data.country,
        timestamp: Date.now()
    });
    
    createLapEffect(data.country);
});

socket.on('userJoinedCountry', (data) => {
    addEventToLog({
        type: 'join',
        message: `👋 ${data.user} se unió a ${data.country.flag} ${data.country.name} (${data.memberCount} miembros)`,
        country: data.country,
        timestamp: Date.now()
    });
});

socket.on('viewerUpdate', (data) => {
    gameState.viewers = data.count;
    updateViewerCount();
});

socket.on('chatMessage', (data) => {
    addChatMessage(data);
});

socket.on('giftConfigUpdated', (data) => {
    if (data.giftName) {
        // Actualización de regalo individual
        gameState.giftConfig[data.giftName] = data.config;
        addEventToLog({
            type: 'system',
            message: `🎁 Regalo "${data.giftName}" actualizado`,
            timestamp: Date.now()
        });
    } else {
        // Actualización completa
        gameState.giftConfig = data;
        addEventToLog({
            type: 'system',
            message: '🎁 Configuración de regalos actualizada',
            timestamp: Date.now()
        });
    }
    updateGiftCount();
});

// Funciones de control
async function connectToTikTok() {
    const username = document.getElementById('tiktokUsername').value.trim();
    
    if (!username) {
        alert('⚠️ Por favor ingresa un usuario de TikTok válido');
        return;
    }
    
    // Remover @ si está presente
    const cleanUsername = username.replace('@', '');
    
    try {
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('connectBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        
        const response = await fetch('/api/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: cleanUsername })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('connectBtn').style.display = 'none';
            document.getElementById('disconnectBtn').style.display = 'block';
            document.getElementById('tiktokUsername').disabled = true;
        } else {
            alert('❌ Error al conectar: ' + result.error);
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('connectBtn').innerHTML = '<i class="fas fa-plug"></i> Conectar a Live';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión. Verifica que el usuario esté en vivo.');
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('connectBtn').innerHTML = '<i class="fas fa-plug"></i> Conectar a Live';
    }
}

async function disconnectFromTikTok() {
    try {
        await fetch('/api/disconnect', { method: 'POST' });
        
        document.getElementById('connectBtn').style.display = 'block';
        document.getElementById('disconnectBtn').style.display = 'none';
        document.getElementById('tiktokUsername').disabled = false;
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('connectBtn').innerHTML = '<i class="fas fa-plug"></i> Conectar a Live';
        
        updateConnectionStatus();
    } catch (error) {
        console.error('Error al desconectar:', error);
    }
}

async function startRace() {
    const lapsToWin = parseInt(document.getElementById('lapsToWin').value) || 3;
    
    try {
        // Actualizar configuración
        await fetch('/api/config/race', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lapsToWin })
        });
        
        // Iniciar carrera
        const response = await fetch('/api/race/start', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('startRaceBtn').style.display = 'none';
            document.getElementById('stopRaceBtn').style.display = 'block';
        }
    } catch (error) {
        console.error('Error al iniciar carrera:', error);
        alert('❌ Error al iniciar la carrera');
    }
}

async function stopRace() {
    try {
        await fetch('/api/race/stop', { method: 'POST' });
        
        document.getElementById('startRaceBtn').style.display = 'block';
        document.getElementById('stopRaceBtn').style.display = 'none';
    } catch (error) {
        console.error('Error al detener carrera:', error);
    }
}

// Configuración de regalos
function openGiftConfig() {
    document.getElementById('giftConfigModal').style.display = 'block';
    loadGiftConfig();
    loadAvailableGifts();
}

function closeGiftConfig() {
    document.getElementById('giftConfigModal').style.display = 'none';
}

// Manejo de tabs
function showTab(tabName) {
    currentTab = tabName;
    
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Activar botón correspondiente
    event.target.classList.add('active');
}

// Cargar regalos disponibles del live
function loadAvailableGifts() {
    fetch('/api/gifts')
        .then(response => response.json())
        .then(data => {
            gameState.availableGifts = data.availableGifts || [];
            gameState.giftConfig = data.giftConfig || {};
            
            updateAvailableGiftsDisplay();
            updateGiftCount();
        })
        .catch(error => {
            console.error('Error cargando regalos:', error);
        });
}

// Actualizar display de regalos disponibles
function updateAvailableGiftsDisplay() {
    const container = document.getElementById('availableGiftsGrid');
    container.innerHTML = '';
    
    if (gameState.availableGifts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #ccc; grid-column: 1 / -1;">No hay regalos disponibles. Conecta a un TikTok Live primero.</p>';
        return;
    }
    
    gameState.availableGifts.forEach(gift => {
        const giftDiv = document.createElement('div');
        giftDiv.className = 'available-gift-item';
        
        const isConfigured = gameState.giftConfig[gift.name];
        const config = isConfigured || { steps: 1, effect: 'normal', duration: 0, turbo: false };
        
        giftDiv.innerHTML = `
            <h4>
                ${gift.image ? `<img src="${gift.image}" class="gift-image" alt="${gift.name}">` : '🎁'}
                ${gift.name}
            </h4>
            <div class="available-gift-info">
                <span>ID: ${gift.id}</span>
                ${gift.diamondCost ? `<span class="gift-cost">${gift.diamondCost} 💎</span>` : ''}
            </div>
            <div class="gift-controls">
                <div>
                    <label>Pasos:</label>
                    <input type="number" id="available_${gift.name}_steps" value="${config.steps}" min="0" max="200">
                </div>
                <div>
                    <label>Efecto:</label>
                    <select id="available_${gift.name}_effect">
                        <option value="normal" ${config.effect === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="boost" ${config.effect === 'boost' ? 'selected' : ''}>Boost</option>
                        <option value="turbo" ${config.effect === 'turbo' ? 'selected' : ''}>Turbo</option>
                        <option value="mega_turbo" ${config.effect === 'mega_turbo' ? 'selected' : ''}>Mega Turbo</option>
                    </select>
                </div>
                <div>
                    <label>Duración (ms):</label>
                    <input type="number" id="available_${gift.name}_duration" value="${config.duration}" min="0" max="10000" step="500">
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="available_${gift.name}_turbo" ${config.turbo ? 'checked' : ''}>
                        Turbo
                    </label>
                </div>
            </div>
            <button class="add-gift-btn" onclick="configureGiftFromLive('${gift.name}')">
                ${isConfigured ? '🔄 Actualizar' : '➕ Agregar'} Configuración
            </button>
        `;
        
        container.appendChild(giftDiv);
    });
}

// Configurar regalo desde la lista del live
function configureGiftFromLive(giftName) {
    const steps = document.getElementById(`available_${giftName}_steps`)?.value || 1;
    const effect = document.getElementById(`available_${giftName}_effect`)?.value || 'normal';
    const duration = document.getElementById(`available_${giftName}_duration`)?.value || 0;
    const turbo = document.getElementById(`available_${giftName}_turbo`)?.checked || false;
    
    const config = {
        steps: parseInt(steps),
        effect: effect,
        duration: parseInt(duration),
        turbo: turbo
    };
    
    fetch(`/api/gifts/${encodeURIComponent(giftName)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addEventToLog({
                type: 'system',
                message: `✅ Regalo "${giftName}" configurado`,
                timestamp: Date.now()
            });
            gameState.giftConfig[giftName] = data.config;
            updateGiftCount();
            loadGiftConfig(); // Recargar tab de configurados
        } else {
            addEventToLog({
                type: 'system',
                message: `❌ Error configurando "${giftName}"`,
                timestamp: Date.now()
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        addEventToLog({
            type: 'system',
            message: '❌ Error de conexión',
            timestamp: Date.now()
        });
    });
}

function loadGiftConfig() {
    const container = document.getElementById('giftConfigContainer');
    container.innerHTML = '';
    
    const configuredGifts = Object.keys(gameState.giftConfig);
    
    if (configuredGifts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #ccc;">No hay regalos configurados. Ve a la pestaña "Regalos del Live" para agregar algunos.</p>';
        return;
    }
    
    configuredGifts.forEach(giftName => {
        const config = gameState.giftConfig[giftName];
        const giftDiv = document.createElement('div');
        giftDiv.className = 'gift-config-item';
        
        // Buscar imagen del regalo si está disponible
        const availableGift = gameState.availableGifts.find(g => g.name === giftName);
        const giftImage = availableGift?.image;
        
        giftDiv.innerHTML = `
            <h4>
                ${giftImage ? `<img src="${giftImage}" class="gift-image" alt="${giftName}">` : '🎁'}
                ${giftName}
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <label>Pasos:</label>
                    <input type="number" id="${giftName}_steps" value="${config.steps}" min="0" max="200">
                </div>
                <div>
                    <label>Efecto:</label>
                    <select id="${giftName}_effect">
                        <option value="normal" ${config.effect === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="boost" ${config.effect === 'boost' ? 'selected' : ''}>Boost</option>
                        <option value="turbo" ${config.effect === 'turbo' ? 'selected' : ''}>Turbo</option>
                        <option value="mega_turbo" ${config.effect === 'mega_turbo' ? 'selected' : ''}>Mega Turbo</option>
                    </select>
                </div>
                <div>
                    <label>Duración (ms):</label>
                    <input type="number" id="${giftName}_duration" value="${config.duration}" min="0" max="10000" step="500">
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="${giftName}_turbo" ${config.turbo ? 'checked' : ''}>
                        Turbo
                    </label>
                </div>
            </div>
        `;
        container.appendChild(giftDiv);
    });
}

function saveGiftConfig() {
    const config = {};
    const configuredGifts = Object.keys(gameState.giftConfig);
    
    configuredGifts.forEach(giftName => {
        const steps = document.getElementById(`${giftName}_steps`)?.value || 1;
        const effect = document.getElementById(`${giftName}_effect`)?.value || 'normal';
        const duration = document.getElementById(`${giftName}_duration`)?.value || 0;
        const turbo = document.getElementById(`${giftName}_turbo`)?.checked || false;
        
        config[giftName] = {
            steps: parseInt(steps),
            effect: effect,
            duration: parseInt(duration),
            turbo: turbo
        };
    });
    
    fetch('/api/config/gifts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addEventToLog({
                type: 'system',
                message: '✅ Configuración de regalos guardada',
                timestamp: Date.now()
            });
            gameState.giftConfig = data.config;
            closeGiftConfig();
        } else {
            addEventToLog({
                type: 'system',
                message: '❌ Error guardando configuración',
                timestamp: Date.now()
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        addEventToLog({
            type: 'system',
            message: '❌ Error de conexión',
            timestamp: Date.now()
        });
    });
}

function resetGiftConfig() {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
        // Recargar configuración desde el servidor
        loadAvailableGifts();
        addEventToLog({
            type: 'system',
            message: '🔄 Configuración restaurada',
            timestamp: Date.now()
        });
    }
}

// Actualizar contador de regalos
function updateGiftCount() {
    const configuredCount = Object.keys(gameState.giftConfig).length;
    const availableCount = gameState.availableGifts.length;
    
    document.getElementById('giftCount').textContent = configuredCount;
    document.getElementById('availableGiftCount').textContent = availableCount;
}

// Funciones de UI
function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (gameState.connected) {
        statusElement.textContent = `Conectado a @${gameState.username}`;
        statusElement.className = 'status-connected';
    } else {
        statusElement.textContent = 'Desconectado';
        statusElement.className = 'status-disconnected';
    }
}

function updateRaceStatus(text, className) {
    const statusElement = document.getElementById('raceStatus');
    statusElement.textContent = text;
    statusElement.className = className;
}

function updateViewerCount() {
    document.getElementById('viewerCount').textContent = `${gameState.viewers} viewers`;
}

function updateCountryCount() {
    document.getElementById('countryCount').textContent = `${gameState.countries.length} países`;
}

function updateLeaderboard() {
    const container = document.getElementById('leaderboardContainer');
    
    if (gameState.countries.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7;">No hay países compitiendo aún</p>';
        return;
    }
    
    // Ordenar países por posición y vuelta actual
    const sortedCountries = [...gameState.countries].sort((a, b) => {
        if (a.currentLap !== b.currentLap) {
            return b.currentLap - a.currentLap;
        }
        return b.position - a.position;
    });
    
    container.innerHTML = '';
    
    sortedCountries.forEach((country, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const progress = (country.position / gameState.config.trackLength) * 100;
        const isInTurbo = Date.now() < country.turboUntil;
        
        item.innerHTML = `
            <div class="country-info">
                <span class="country-flag">${country.flag}</span>
                <div>
                    <strong>${country.name}</strong>
                    <div style="font-size: 12px; opacity: 0.8;">
                        Vuelta ${country.currentLap}/${gameState.config.lapsToWin} | ${country.members.length} miembros
                        ${isInTurbo ? '🚀' : ''}
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <div><strong>${country.wins || 0}</strong> victorias</div>
                <div class="progress-bar" style="width: 100px;">
                    <div class="progress-fill" style="width: ${progress}%; background: ${country.color};"></div>
                </div>
            </div>
        `;
        
        if (index === 0) {
            item.style.border = '2px solid #f1c40f';
            item.style.boxShadow = '0 0 15px rgba(241, 196, 15, 0.5)';
        }
        
        container.appendChild(item);
    });
}

function updateUI() {
    updateConnectionStatus();
    updateViewerCount();
    updateCountryCount();
    updateLeaderboard();
    
    if (gameState.racing) {
        updateRaceStatus('🏁 Maratón en curso', 'status-racing');
        document.getElementById('startRaceBtn').style.display = 'none';
        document.getElementById('stopRaceBtn').style.display = 'block';
    }
}

// Funciones de eventos
function addEventToLog(event) {
    const container = document.getElementById('eventsContainer');
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item';
    
    let content = '';
    const time = new Date(event.timestamp).toLocaleTimeString();
    
    switch (event.type) {
        case 'like':
            content = `👍 <strong>${event.user}</strong> dio ${event.steps} likes a ${event.country}`;
            break;
        case 'gift':
            content = `🎁 <strong>${event.user}</strong> envió ${event.gift} (+${event.steps} pasos) a ${event.country}`;
            if (event.effect === 'turbo' || event.effect === 'mega_turbo') {
                content += ' 🚀';
            }
            break;
        case 'follow':
            content = `➕ <strong>${event.user}</strong> siguió el canal (+${event.steps} pasos) para ${event.country}`;
            break;
        case 'victory':
            content = event.message;
            eventDiv.style.borderLeft = '4px solid #f1c40f';
            eventDiv.style.background = 'rgba(241, 196, 15, 0.2)';
            break;
        case 'lap':
            content = event.message;
            eventDiv.style.borderLeft = '4px solid #3498db';
            break;
        case 'join':
            content = event.message;
            eventDiv.style.borderLeft = '4px solid #2ecc71';
            break;
        case 'system':
            content = event.message;
            eventDiv.style.borderLeft = '4px solid #9b59b6';
            break;
        default:
            content = event.message || 'Evento desconocido';
    }
    
    eventDiv.innerHTML = `
        ${content}
        <small style="float: right; opacity: 0.7;">${time}</small>
    `;
    
    container.insertBefore(eventDiv, container.firstChild);
    
    // Mantener solo los últimos 50 eventos
    while (container.children.length > 50) {
        container.removeChild(container.lastChild);
    }
}

function addChatMessage(data) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    const time = new Date(data.timestamp).toLocaleTimeString();
    messageDiv.innerHTML = `
        <strong>${data.user}:</strong> ${data.message}
        <small style="float: right; opacity: 0.7;">${time}</small>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    
    // Mantener solo los últimos 20 mensajes
    while (container.children.length > 20) {
        container.removeChild(container.firstChild);
    }
}

// Efectos visuales
function createEventEffect(event) {
    const colors = {
        like: '#3498db',
        gift: '#e91e63',
        follow: '#2ecc71',
        turbo: '#f39c12',
        mega_turbo: '#e74c3c'
    };
    
    const color = colors[event.effect] || colors[event.type] || '#ffffff';
    
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: color,
            life: 80,
            maxLife: 80,
            size: Math.random() * 4 + 2
        });
    }
}

function createVictoryEffect(winner) {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            color: winner.color,
            life: 150,
            maxLife: 150,
            size: Math.random() * 6 + 3
        });
    }
    
    // Explosión central
    explosions.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 0,
        maxRadius: 200,
        life: 60,
        color: winner.color
    });
}

function createLapEffect(country) {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: canvas.width - 100,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: country.color,
            life: 60,
            maxLife: 60,
            size: Math.random() * 3 + 1
        });
    }
}

// Renderizado del juego
function drawGame() {
    // Limpiar canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar estrellas de fondo
    drawBackgroundStars();
    
    // Dibujar pista
    drawTrack();
    
    // Dibujar países
    gameState.countries.forEach((country, index) => {
        drawCountry(country, index);
    });
    
    // Dibujar línea de meta
    drawFinishLine();
    
    // Dibujar efectos
    drawParticles();
    drawExplosions();
    
    // Dibujar información de carrera
    drawRaceInfo();
}

function drawBackgroundStars() {
    backgroundStars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = canvas.width;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawTrack() {
    const trackHeight = Math.min(80, canvas.height / Math.max(gameState.countries.length, 4));
    const startY = 50;
    
    // Dibujar patrón de tablero de ajedrez en el fondo
    drawChessboardPattern();
    
    gameState.countries.forEach((country, index) => {
        const y = startY + (index * trackHeight);
        
        // Fondo de pista con transparencia para mostrar el tablero
        ctx.fillStyle = 'rgba(52, 73, 94, 0.4)';
        ctx.fillRect(50, y, canvas.width - 150, trackHeight - 10);
        
        // Líneas de pista
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(canvas.width - 100, y);
        ctx.moveTo(50, y + trackHeight - 10);
        ctx.lineTo(canvas.width - 100, y + trackHeight - 10);
        ctx.stroke();
        
        // Línea central punteada
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(50, y + (trackHeight - 10) / 2);
        ctx.lineTo(canvas.width - 100, y + (trackHeight - 10) / 2);
        ctx.stroke();
        ctx.setLineDash([]);
    });
}

function drawChessboardPattern() {
    const squareSize = 20;
    const cols = Math.ceil(canvas.width / squareSize);
    const rows = Math.ceil(canvas.height / squareSize);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const isWhite = (row + col) % 2 === 0;
            ctx.fillStyle = isWhite ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        }
    }
}

function drawCountry(country, index) {
    const trackHeight = Math.min(80, canvas.height / Math.max(gameState.countries.length, 4));
    const startY = 50;
    const y = startY + (index * trackHeight) + (trackHeight - 10) / 2;
    
    // Calcular posición en la pista
    const trackWidth = canvas.width - 150;
    const x = 70 + (country.position / gameState.config.trackLength) * trackWidth;
    
    // Obtener diseño del carrito
    const carDesign = country.carDesign || { body: '🚗', wheels: '⚪', trail: '💨', special: '⭐' };
    const isInTurbo = Date.now() < country.turboUntil;
    
    // Efecto de estela personalizada
    if (country.speed > 0 || isInTurbo) {
        const trailCount = isInTurbo ? 6 : 3;
        for (let i = 0; i < trailCount; i++) {
            const alpha = 1 - (i * 0.2);
            ctx.globalAlpha = alpha;
            ctx.font = `${16 - i * 2}px Arial`;
            ctx.fillText(carDesign.trail, x - 40 - (i * 8), y + 5);
        }
        ctx.globalAlpha = 1;
    }
    
    // Sombra del carrito
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x - 15, y + 15, 30, 8);
    
    // Dibujar carrito principal
    ctx.font = '24px Arial';
    ctx.fillText(carDesign.body, x - 12, y + 8);
    
    // Dibujar ruedas
    ctx.font = '12px Arial';
    ctx.fillText(carDesign.wheels, x - 18, y + 12);
    ctx.fillText(carDesign.wheels, x + 6, y + 12);
    
    // Efecto especial para turbo
    if (isInTurbo) {
        // Aura de turbo
        const auraGradient = ctx.createRadialGradient(x, y, 0, x, y, 35);
        auraGradient.addColorStop(0, country.color + '80');
        auraGradient.addColorStop(1, country.color + '00');
        ctx.fillStyle = auraGradient;
        ctx.fillRect(x - 35, y - 20, 70, 40);
        
        // Símbolo especial del país
        ctx.font = '16px Arial';
        ctx.fillText(carDesign.special, x - 8, y - 15);
        
        // Partículas especiales
        for (let i = 0; i < 3; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                maxLife: 30,
                color: country.color,
                size: Math.random() * 3 + 2,
                type: 'turbo'
            });
        }
    }
    
    // Línea de progreso con gradiente
    const progressGradient = ctx.createLinearGradient(70, y - 25, 70 + trackWidth, y - 25);
    progressGradient.addColorStop(0, country.color + '40');
    progressGradient.addColorStop(country.position / gameState.config.trackLength, country.color);
    progressGradient.addColorStop(1, country.color + '20');
    ctx.fillStyle = progressGradient;
    ctx.fillRect(70, y - 25, trackWidth * (country.position / gameState.config.trackLength), 4);
    
    // Información del país con mejor tipografía
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(country.name, 10, y - 15);
    
    ctx.fillStyle = '#BDC3C7';
    ctx.font = '12px Arial';
    ctx.fillText(`Vuelta ${country.currentLap}/${gameState.config.lapsToWin}`, 10, y);
    ctx.fillText(`${country.members.length} miembros`, 10, y + 15);
    
    // Bandera del país
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(country.flag, 25, y + 5);
    
    // Velocidad actual
    if (country.speed > 0) {
        ctx.fillStyle = '#E74C3C';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`+${country.speed.toFixed(1)}`, canvas.width - 110, y);
    }
}

// Función auxiliar para ajustar brillo de colores
function adjustBrightness(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function drawFinishLine() {
    const trackHeight = Math.min(80, canvas.height / Math.max(gameState.countries.length, 4));
    const startY = 50;
    const finishX = canvas.width - 100;
    const lineWidth = 12;
    
    // Fondo de la línea de meta
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(finishX - lineWidth/2, startY - 10, lineWidth, gameState.countries.length * trackHeight + 20);
    
    // Patrón clásico de cuadros blancos y negros
    const squareSize = 15;
    const totalHeight = gameState.countries.length * trackHeight + 20;
    
    for (let y = 0; y < totalHeight; y += squareSize) {
        for (let x = 0; x < lineWidth; x += squareSize) {
            const row = Math.floor(y / squareSize);
            const col = Math.floor(x / squareSize);
            const isBlack = (row + col) % 2 === 1;
            
            if (isBlack) {
                ctx.fillStyle = '#000000';
                ctx.fillRect(
                    finishX - lineWidth/2 + x, 
                    startY - 10 + y, 
                    Math.min(squareSize, lineWidth - x), 
                    Math.min(squareSize, totalHeight - y)
                );
            }
        }
    }
    
    // Borde dorado para destacar
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2;
    ctx.strokeRect(finishX - lineWidth/2 - 1, startY - 11, lineWidth + 2, totalHeight + 2);
    
    // Texto "META" en la parte superior
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 META', finishX, startY - 20);
}

function drawParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        
        // Dibujar partícula con tamaño variable y mejor renderizado
        const size = (particle.size || 3) * alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Agregar brillo para partículas especiales
        if (particle.color === '#FFD700' || particle.color === '#FFA500') {
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        return particle.life > 0;
    });
    ctx.globalAlpha = 1;
}

function drawExplosions() {
    explosions = explosions.filter(explosion => {
        explosion.radius += explosion.maxRadius / explosion.life;
        explosion.life--;
        
        const alpha = explosion.life / 60;
        ctx.strokeStyle = explosion.color + Math.floor(alpha * 128).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        return explosion.life > 0;
    });
}

function drawRaceInfo() {
    // Actualizar información del maratón en el HTML
    updateMarathonStatus();
}

function updateMarathonStatus() {
    // Actualizar vueltas para ganar
    const marathonLaps = document.getElementById('marathonLaps');
    if (marathonLaps) marathonLaps.textContent = gameState.config.lapsToWin;
    
    // Actualizar países activos
    const marathonCountries = document.getElementById('marathonCountries');
    if (marathonCountries) marathonCountries.textContent = gameState.countries.length;
    
    // Actualizar viewers
    const marathonViewers = document.getElementById('marathonViewers');
    if (marathonViewers) marathonViewers.textContent = gameState.viewers;
    
    // Mostrar/ocultar último ganador
    const lastWinnerDisplay = document.getElementById('lastWinnerDisplay');
    const lastWinnerText = document.getElementById('lastWinnerText');
    
    if (lastWinner && lastWinnerDisplay && lastWinnerText) {
        lastWinnerDisplay.style.display = 'flex';
        lastWinnerText.textContent = `${lastWinner.flag} ${lastWinner.name}`;
    } else if (lastWinnerDisplay) {
        lastWinnerDisplay.style.display = 'none';
    }
}

// Game loop
function gameLoop() {
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Inicialización
function init() {
    initBackgroundStars();
    loadGiftConfig();
    loadSavedTheme();
    
    // Configurar canvas responsive
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    gameLoop();
    
    // Cargar estado inicial
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            gameState = { ...gameState, ...data };
            updateUI();
        })
        .catch(error => {
            console.log('Estado inicial no disponible, usando valores por defecto');
        });
}

// Eventos del DOM
document.addEventListener('DOMContentLoaded', init);

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('giftConfigModal');
    if (event.target === modal) {
        closeGiftConfig();
    }
};

// Manejar teclas
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeGiftConfig();
    }
});

console.log('🎮 TikTok Racing Marathon cargado correctamente!');
console.log('📱 Conecta a un usuario de TikTok Live para comenzar');
console.log('🌍 Los viewers pueden unirse a países escribiendo comandos como "join USA" o "team Mexico"');