const authStatus = document.querySelector('#auth-status');
const signInButton = document.querySelector('#sign-in-button');
const userButtonRoot = document.querySelector('#user-button-root');
const historyChartCanvas = document.getElementById('history-chart');
const historyTableBody = document.querySelector('#history-table tbody');
const historyDetailsSection = document.getElementById('history-details');
const historyEmpty = document.getElementById('history-empty');

const MAX_HISTORY_LENGTH = 100;

let clerkClient = null;
let clerkIsLoaded = false;
let activeClerkUser = null;
let chartInstance = null;

applyStoredTheme();
initializeClerk();

function applyStoredTheme() {
  const themeLink = document.getElementById('theme');
  if (!themeLink) {
    return;
  }
  const storedTheme = getCookie('theme');
  const themeName = storedTheme ? storedTheme.toLowerCase() : 'light';
  themeLink.setAttribute('href', `themes/${themeName}.css`);
}

function setAuthStatus(message, tone = 'info') {
  if (!authStatus) {
    return;
  }
  if (!message) {
    authStatus.classList.add('hidden');
    authStatus.textContent = '';
    authStatus.removeAttribute('data-tone');
    return;
  }
  authStatus.textContent = message;
  authStatus.classList.remove('hidden');
  authStatus.setAttribute('data-tone', tone);
}

function waitForClerkSDK(maxWait = 7000) {
  if (window.Clerk) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.Clerk) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > maxWait) {
        clearInterval(interval);
        reject(new Error('Clerk SDK failed to load within the allotted time.'));
      }
    }, 50);
  });
}

async function initializeClerk() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.CLERK_PUBLISHABLE_KEY) {
    setAuthStatus('Add your Clerk publishable key to config.js to enable sign in and history.', 'error');
    renderHistory(null);
    return;
  }

  try {
    await waitForClerkSDK();
  } catch (error) {
    console.error('Clerk SDK not available', error);
    setAuthStatus('Authentication is currently unavailable. Check your network connection.', 'error');
    renderHistory(null);
    return;
  }

  try {
    await window.Clerk.load({ publishableKey: window.CLERK_PUBLISHABLE_KEY });
  } catch (error) {
    console.error('Failed to initialize Clerk', error);
    setAuthStatus('Authentication is currently unavailable. Check console for details.', 'error');
    renderHistory(null);
    return;
  }

  clerkClient = window.Clerk;
  clerkIsLoaded = true;
  activeClerkUser = clerkClient.user || null;

  if (userButtonRoot && typeof clerkClient.mountUserButton === 'function') {
    clerkClient.mountUserButton(userButtonRoot);
  }

  if (signInButton) {
    signInButton.addEventListener('click', () => {
      if (!clerkIsLoaded || !clerkClient || typeof clerkClient.openSignIn !== 'function') {
        return;
      }
      clerkClient.openSignIn({ afterSignInUrl: window.location.href });
    });
  }

  updateAuthUI(activeClerkUser);
  renderHistory(activeClerkUser);

  if (typeof clerkClient.addListener === 'function') {
    clerkClient.addListener(({ user }) => {
      activeClerkUser = user || null;
      updateAuthUI(activeClerkUser);
      renderHistory(activeClerkUser);
    });
  }
}

function updateAuthUI(user) {
  if (!clerkIsLoaded) {
    return;
  }

  if (signInButton) {
    if (user) {
      signInButton.classList.add('hidden');
    } else {
      signInButton.classList.remove('hidden');
    }
  }

  if (userButtonRoot) {
    if (user) {
      userButtonRoot.classList.remove('hidden');
    } else {
      userButtonRoot.classList.add('hidden');
    }
  }

  if (user) {
    setAuthStatus('');
  } else {
    setAuthStatus('Sign in to view your synced game history and charts.');
  }
}

function renderHistory(user) {
  if (!historyTableBody || !historyEmpty) {
    return;
  }

  if (!user) {
    clearChart();
    historyTableBody.innerHTML = '';
    historyEmpty.textContent = 'Sign in to view your synced game history.';
    historyEmpty.classList.remove('hidden');
    if (historyDetailsSection) {
      historyDetailsSection.classList.add('hidden');
    }
    if (historyChartCanvas) {
      historyChartCanvas.classList.add('hidden');
    }
    return;
  }

  const history = Array.isArray(user.publicMetadata?.gameHistory)
    ? user.publicMetadata.gameHistory.filter(isValidHistoryEntry)
    : [];

  if (!history.length) {
    clearChart();
    historyTableBody.innerHTML = '';
    historyEmpty.textContent = 'Play a few rounds to build your history.';
    historyEmpty.classList.remove('hidden');
    if (historyDetailsSection) {
      historyDetailsSection.classList.add('hidden');
    }
    if (historyChartCanvas) {
      historyChartCanvas.classList.add('hidden');
    }
    return;
  }

  historyEmpty.classList.add('hidden');
  if (historyDetailsSection) {
    historyDetailsSection.classList.remove('hidden');
  }
  if (historyChartCanvas) {
    historyChartCanvas.classList.remove('hidden');
  }

  const entriesForChart = history
    .slice(0, MAX_HISTORY_LENGTH)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  renderChart(entriesForChart);

  const entriesForTable = history
    .slice(0, MAX_HISTORY_LENGTH)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  renderTable(entriesForTable);
}

function renderChart(entries) {
  if (!historyChartCanvas || typeof Chart === 'undefined') {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not available. Skipping chart rendering.');
    }
    return;
  }

  const ctx = historyChartCanvas.getContext('2d');
  const labels = entries.map(entry => formatChartLabel(entry.timestamp));
  const wpmValues = entries.map(entry => Number(entry.wpm) || 0);
  const accuracyValues = entries.map(entry => Number(entry.accuracy) || 0);
  const maxWpm = wpmValues.length ? Math.max(...wpmValues) : 0;
  const suggestedMaxWpm = Math.max(60, Math.ceil((maxWpm + 10) / 10) * 10);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'WPM',
          data: wpmValues,
          borderColor: '#2f80ed',
          backgroundColor: 'rgba(47, 128, 237, 0.2)',
          tension: 0.3,
          pointRadius: 3,
          yAxisID: 'y',
        },
        {
          label: 'Accuracy (%)',
          data: accuracyValues,
          borderColor: '#9b51e0',
          backgroundColor: 'rgba(155, 81, 224, 0.2)',
          tension: 0.3,
          pointRadius: 3,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Session',
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 12,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: suggestedMaxWpm,
          title: {
            display: true,
            text: 'Words per minute',
          },
          ticks: {
            precision: 0,
          },
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          suggestedMax: 100,
          title: {
            display: true,
            text: 'Accuracy (%)',
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          intersect: false,
          mode: 'index',
        },
      },
    },
  });
}

function renderTable(entries) {
  if (!historyTableBody) {
    return;
  }

  historyTableBody.innerHTML = '';

  entries.forEach(entry => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDateTime(entry.timestamp);
    const detail = document.createElement('span');
    detail.className = 'subtle';
    detail.textContent = formatSecondaryDetails(entry);
    dateCell.appendChild(detail);
    row.appendChild(dateCell);

    const modeCell = document.createElement('td');
    modeCell.textContent = formatMode(entry);
    row.appendChild(modeCell);

    const wpmCell = document.createElement('td');
    wpmCell.textContent = formatNumber(entry.wpm);
    row.appendChild(wpmCell);

    const accuracyCell = document.createElement('td');
    accuracyCell.textContent = `${formatNumber(entry.accuracy)}%`;
    row.appendChild(accuracyCell);

    const durationCell = document.createElement('td');
    durationCell.textContent = formatDuration(entry);
    row.appendChild(durationCell);

    historyTableBody.appendChild(row);
  });
}

function clearChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function formatChartLabel(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatSecondaryDetails(entry) {
  const details = [];
  if (entry.language) {
    details.push(entry.language);
  }
  if (entry.punctuation) {
    details.push('punctuation');
  }
  return details.length ? details.join(' • ') : '—';
}

function formatMode(entry) {
  if (entry.mode === 'time') {
    const seconds = parseOptionalNumber(entry.timeLimitSeconds) || parseOptionalNumber(entry.durationSeconds);
    return seconds ? `time (${seconds}s)` : 'time';
  }
  if (entry.mode === 'wordcount') {
    const words = parseOptionalNumber(entry.wordCount);
    return words ? `word (${words} words)` : 'word';
  }
  return entry.mode || '—';
}

function formatDuration(entry) {
  const seconds = parseOptionalNumber(entry.durationSeconds) ?? parseOptionalNumber(entry.timeLimitSeconds);
  if (!seconds) {
    return '—';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, seconds - mins * 60);
  if (mins > 0) {
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '0';
  }
  return Math.round(num);
}

function parseOptionalNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  if (typeof entry.timestamp !== 'string') {
    return false;
  }
  if (!Number.isFinite(Number(entry.wpm))) {
    return false;
  }
  if (!Number.isFinite(Number(entry.accuracy))) {
    return false;
  }
  return true;
}

function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}
