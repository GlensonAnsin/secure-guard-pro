async function fetchStatus() {
    try {
        const res = await fetch('/status/json');
        const data = await res.json();

        // Status
        const heroEl = document.getElementById('statusHero');
        const heroText = document.getElementById('statusHeroText');
        const appStatus = document.getElementById('appStatus');
        const isUp = data.status === 'UP';

        heroEl.className = 'status-hero ' + (isUp ? 'up' : 'down');
        heroText.textContent = isUp ? 'All Systems Operational' : 'System Degraded';
        appStatus.textContent = data.status;
        appStatus.className = 'info-value ' + (isUp ? 'status-up' : 'status-down');

        // Environment
        document.getElementById('appEnv').textContent = data.environment || 'unknown';

        // Uptime
        if (data.uptime !== undefined) {
            document.getElementById('appUptime').textContent = formatUptime(data.uptime);
        }

        // Memory
        if (data.memoryMB !== undefined) {
            document.getElementById('appMemory').textContent = data.memoryMB + ' MB';
        }

        // Timestamp
        document.getElementById('lastChecked').textContent = 'Checked ' + new Date().toLocaleTimeString();
    } catch (err) {
        document.getElementById('statusHero').className = 'status-hero down';
        document.getElementById('statusHeroText').textContent = 'Unable to Reach Server';
    }
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(d + 'd');
    if (h > 0) parts.push(h + 'h');
    if (m > 0) parts.push(m + 'm');
    parts.push(s + 's');
    return parts.join(' ');
}

// Fetch immediately, then refresh every 30s
fetchStatus();
setInterval(fetchStatus, 30000);
