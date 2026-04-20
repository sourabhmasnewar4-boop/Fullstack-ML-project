let historyChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    enforceAuth();

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userNameDisplay').textContent = `Welcome, ${user.name}`;
        
        // Setup PDF info
        document.getElementById('pdfUserId').textContent = user.id;
        document.getElementById('pdfDate').textContent = new Date().toLocaleDateString();
    }

    loadHistory();

    // Text Analysis
    document.getElementById('textForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('patientText').value;
        runAnalysis(`${API_BASE}/predict/text`, { text }, 'json');
    });

    // Audio Analysis
    document.getElementById('audioForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('patientAudio').files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        // Use custom fetch without 'Content-Type' header so browser can set boundary
        runAnalysis(`${API_BASE}/predict/audio`, formData, 'formData');
    });

    // PDF Generation
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        const element = document.getElementById('reportContainer');
        element.classList.remove('d-none');
        
        html2pdf()
            .set({ margin: 1, filename: 'NeuroDetect_Analysis.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } })
            .from(element)
            .save()
            .then(() => {
                element.classList.add('d-none');
            });
    });
});

async function runAnalysis(endpoint, payload, type) {
    const loader = document.getElementById('loader');
    const resultBox = document.getElementById('resultBox');
    const analyzeBtn1 = document.getElementById('textAnalyzeBtn');
    const analyzeBtn2 = document.getElementById('audioAnalyzeBtn');

    loader.classList.remove('d-none');
    resultBox.classList.add('d-none');
    analyzeBtn1.disabled = true;
    analyzeBtn2.disabled = true;

    try {
        let options = {
            method: 'POST',
            headers: { 'x-auth-token': getToken() }
        };

        if (type === 'json') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(payload);
        } else {
            options.body = payload; // FormData
        }

        const res = await fetch(endpoint, options);
        const data = await res.json();

        if (!res.ok) throw new Error(data.msg || 'Analysis Failed');

        // Render Results
        const score = data.predictionScore.toFixed(2);
        document.getElementById('confidenceScore').textContent = `${score}%`;
        document.getElementById('recommendationText').textContent = data.recommendation;
        
        const badge = document.getElementById('riskBadge');
        badge.textContent = data.riskLevel;
        badge.className = 'badge fw-bold'; // reset
        
        if (data.riskLevel === 'High') badge.classList.add('bg-danger');
        else if (data.riskLevel === 'Medium') badge.classList.add('bg-warning', 'text-dark');
        else badge.classList.add('bg-success');

        resultBox.classList.remove('d-none');
        
        // Reload history to insert new item into chart/lists
        loadHistory();

    } catch (err) {
        alert('Error parsing ML data: ' + err.message);
    } finally {
        loader.classList.add('d-none');
        analyzeBtn1.disabled = false;
        analyzeBtn2.disabled = false;
    }
}

async function loadHistory() {
    try {
        const res = await fetch(`${API_BASE}/predict/history`, {
            headers: authHeaders()
        });
        const data = await res.json();
        
        if (res.ok) {
            renderHistoryList(data);
            renderChart(data);
            populatePdfTable(data);
        }
    } catch (err) {
        console.error('Failed to load history', err);
    }
}

function renderHistoryList(historyData) {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    
    if(historyData.length === 0) {
        list.innerHTML = '<span class="text-secondary small">No past history found.</span>';
        return;
    }

    historyData.forEach(item => {
        let icon = item.inputType === 'text' ? 'bi-file-text' : 'bi-mic';
        let color = item.riskLevel === 'High' ? 'text-danger' : item.riskLevel === 'Medium' ? 'text-warning' : 'text-success';
        
        list.innerHTML += `
            <div class="d-flex justify-content-between border-bottom border-secondary pb-2 mb-2">
                <div>
                    <i class="bi ${icon} text-accent me-2"></i>
                    <small class="text-light">${new Date(item.createdAt).toLocaleDateString()}</small>
                </div>
                <div>
                    <strong class="${color}">${item.predictionScore.toFixed(1)}% (${item.riskLevel})</strong>
                </div>
            </div>
        `;
    });
}

function renderChart(historyData) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    // Sort array chronological for chart
    const sorted = [...historyData].reverse();
    
    const labels = sorted.map(i => new Date(i.createdAt).toLocaleDateString());
    const dataPts = sorted.map(i => i.predictionScore);

    if (historyChartInstance) {
        historyChartInstance.destroy();
    }

    historyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Confidence (%)',
                data: dataPts,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100, ticks: { color: '#cbd5e1' } },
                x: { ticks: { color: '#cbd5e1' } }
            },
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            }
        }
    });
}

function populatePdfTable(historyData) {
    const tbody = document.querySelector('#pdfTable tbody');
    tbody.innerHTML = '';
    
    historyData.slice(0, 10).forEach(item => {
        let snippet = item.rawInputData.length > 50 ? item.rawInputData.substring(0, 50) + "..." : item.rawInputData;
        tbody.innerHTML += `
            <tr>
                <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                <td>${item.inputType}</td>
                <td>${snippet}</td>
                <td>${item.riskLevel}</td>
                <td>${item.predictionScore.toFixed(1)}%</td>
            </tr>
        `;
    });
}
