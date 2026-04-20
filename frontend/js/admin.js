document.addEventListener('DOMContentLoaded', () => {
    enforceAuth();

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    loadAdminStats();
});

async function loadAdminStats() {
    try {
        const res = await fetch(`${API_BASE}/admin/stats`, {
            headers: authHeaders()
        });
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('totalUsers').textContent = data.userCount;
            document.getElementById('totalPredictions').textContent = data.totalPredictions;
            document.getElementById('highRiskCases').textContent = data.highRiskCount;
            
            const tbody = document.getElementById('adminTableBody');
            tbody.innerHTML = '';
            
            if (data.recentPredictions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No records found.</td></tr>';
            } else {
                data.recentPredictions.forEach(pred => {
                    let badgeClass = pred.riskLevel === 'High' ? 'bg-danger' : pred.riskLevel === 'Medium' ? 'bg-warning text-dark' : 'bg-success';
                    
                    tbody.innerHTML += `
                        <tr>
                            <td>${new Date(pred.createdAt).toLocaleString()}</td>
                            <td>${pred.userId.name} <br><small class="text-secondary">${pred.userId.email}</small></td>
                            <td><span class="badge bg-secondary">${pred.inputType}</span></td>
                            <td>${pred.predictionScore.toFixed(1)}%</td>
                            <td><span class="badge ${badgeClass}">${pred.riskLevel}</span></td>
                        </tr>
                    `;
                });
            }
        }
    } catch (err) {
        console.error('Failed to load admin stats', err);
    }
}
