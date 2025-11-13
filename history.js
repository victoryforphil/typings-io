let historyChart = null;
let allHistory = [];
let currentFilter = 'all';

// Wait for Clerk to initialize
async function loadHistory() {
  // Wait for clerk instance to be available
  let attempts = 0;
  while (!clerkInstance && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!clerkInstance || !currentUser) {
    // Redirect to main page if not authenticated
    window.location.href = 'index.html';
    return;
  }

  try {
    // Get game history
    const history = await getGameHistory();
    allHistory = history;
    
    const loadingMessage = document.getElementById('loading-message');
    const historyContent = document.getElementById('history-content');
    const noDataMessage = document.getElementById('no-data-message');

    if (history.length === 0) {
      loadingMessage.style.display = 'none';
      noDataMessage.style.display = 'block';
      return;
    }

    // Display history
    loadingMessage.style.display = 'none';
    historyContent.style.display = 'block';

    // Calculate and display stats
    displayStats(history);

    // Create chart
    createChart(history);

    // Populate table
    populateTable(history);

    // Add filter listeners
    setupFilters();
  } catch (error) {
    console.error('Error loading history:', error);
    document.getElementById('loading-message').textContent = 'Error loading history. Please try again.';
  }
}

function displayStats(history) {
  const statsContainer = document.getElementById('stats-overview');
  
  if (history.length === 0) {
    return;
  }

  // Calculate stats
  const totalTests = history.length;
  const avgWpm = Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / history.length);
  const avgAcc = Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / history.length);
  const bestWpm = Math.max(...history.map(h => h.wpm));
  const bestAcc = Math.max(...history.map(h => h.accuracy));

  // Create stat cards
  const stats = [
    { label: 'Total Tests', value: totalTests },
    { label: 'Average WPM', value: avgWpm },
    { label: 'Average Accuracy', value: avgAcc + '%' },
    { label: 'Best WPM', value: bestWpm },
    { label: 'Best Accuracy', value: bestAcc + '%' }
  ];

  statsContainer.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');
}

function createChart(history) {
  const ctx = document.getElementById('history-chart').getContext('2d');
  
  // Sort by date (oldest first for chart)
  const sortedHistory = [...history].reverse();
  
  // Limit to last 50 tests for readability
  const chartData = sortedHistory.slice(-50);
  
  // Get theme colors
  const computedStyle = getComputedStyle(document.body);
  const primaryColor = computedStyle.color || '#333';
  const backgroundColor = computedStyle.backgroundColor || '#fff';
  
  // Prepare data
  const labels = chartData.map((h, i) => {
    const date = new Date(h.timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const wpmData = chartData.map(h => h.wpm);
  const accData = chartData.map(h => h.accuracy);

  // Destroy existing chart if it exists
  if (historyChart) {
    historyChart.destroy();
  }

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'WPM',
          data: wpmData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'Accuracy (%)',
          data: accData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Performance Over Time (Last 50 Tests)'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'WPM'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Accuracy (%)'
          },
          min: 0,
          max: 100,
          grid: {
            drawOnChartArea: false,
          }
        }
      }
    }
  });
}

function populateTable(history) {
  const tbody = document.getElementById('history-table-body');
  
  // Limit to last 50 for table
  const tableData = history.slice(0, 50);
  
  tbody.innerHTML = tableData.map(h => {
    const date = new Date(h.timestamp);
    const formattedDate = date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const modeClass = h.mode === 'time' ? 'mode-time' : 'mode-wordcount';
    const modeDisplay = h.mode === 'time' ? 'Time' : 'Word Count';
    
    return `
      <tr>
        <td>${formattedDate}</td>
        <td><span class="mode-badge ${modeClass}">${modeDisplay}</span></td>
        <td>${h.count} ${h.mode === 'time' ? 's' : 'words'}</td>
        <td>${h.wpm}</td>
        <td>${h.accuracy}%</td>
      </tr>
    `;
  }).join('');
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Apply filter
      currentFilter = button.dataset.filter;
      applyFilter();
    });
  });
}

function applyFilter() {
  let filteredHistory = allHistory;
  
  if (currentFilter !== 'all') {
    filteredHistory = allHistory.filter(h => h.mode === currentFilter);
  }
  
  // Update chart and table
  if (filteredHistory.length > 0) {
    displayStats(filteredHistory);
    createChart(filteredHistory);
    populateTable(filteredHistory);
    
    document.getElementById('history-content').style.display = 'block';
    document.getElementById('no-data-message').style.display = 'none';
  } else {
    document.getElementById('history-content').style.display = 'none';
    document.getElementById('no-data-message').style.display = 'block';
    document.getElementById('no-data-message').innerHTML = `
      <p>No ${currentFilter} tests found.</p>
    `;
  }
}

// Apply theme from cookie
const themeCookie = document.cookie.split('; ').find(row => row.startsWith('theme='));
if (themeCookie) {
  const theme = themeCookie.split('=')[1];
  document.querySelector('#theme').setAttribute('href', `themes/${theme}.css`);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadHistory, 500);
  });
} else {
  setTimeout(loadHistory, 500);
}
