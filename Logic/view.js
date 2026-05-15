document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('view_container');
    const urlParams = new URLSearchParams(window.location.search);
    const currentClassId = urlParams.get('class');
    const currentWeek = urlParams.get('week');

    if (!currentClassId || !currentWeek) {
        container.innerHTML = `<div class="header"><h2>Error: Missing Data</h2></div>`;
        return;
    }

    container.innerHTML = `
        <div class="header">
            <h2>${currentClassId} - WEEK ${currentWeek}</h2>
        </div>
        
        <div style="width: 100%; max-width: var(--app-max-width); margin: 0 auto; margin-bottom: 24px; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-card); overflow: hidden;">
            <div style="width: 100%; overflow-x: auto;">
                <table style="width: 360px; border-collapse: collapse; text-align: center;">
                    <thead>
                        <tr style="background-color: var(--bg-surface); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 14px 6px; color: var(--text-main); font-size: 0.9rem; font-weight: 700;">ID</th>
                            <th style="padding: 14px 6px; color: var(--text-main); font-size: 0.9rem; font-weight: 700;">Name</th>
                            <th style="padding: 14px 6px; color: var(--text-main); font-size: 0.9rem; font-weight: 700;">Status</th>
                            <th style="padding: 14px 6px; color: var(--text-main); font-size: 0.9rem; font-weight: 700;">Time</th>
                        </tr>
                    </thead>
                    <tbody id="attendance_table_body">
                        <tr><td colspan="4" style="text-align: center; padding: 30px; color: var(--text-muted); font-weight: 700; font-size: 0.95rem;">Loading data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tableBody = document.getElementById('attendance_table_body');

    fetch(`Backend/view.php?class=${currentClassId}&week=${currentWeek}`)
        .then(response => response.text())
        .then(rawText => {
            try {
                const data = JSON.parse(rawText); 
                tableBody.innerHTML = ''; 

                if (data.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; color: var(--text-muted); font-weight: 700; font-size: 0.95rem;">No students found.</td></tr>`;
                    return;
                }

                data.forEach(student => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = "1px solid #f1f5f9";
                    
                    let presence = `<span style="color: #ef4444; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px;">ABSENT</span>`;
                    let formattedTime = "-";

                    if (student.presence_status == 1 || student.presence_status === "Present") {
                        presence = `<span style="color: #10b981; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px;">PRESENT</span>`;
                        
                        if (student.time_taken) {
                            if (student.time_taken.length <= 8) {
                                formattedTime = student.time_taken;
                            } else {
                                let mobileSafeTime = student.time_taken.replace(' ', 'T');
                                const dateObj = new Date(mobileSafeTime);
                                if (!isNaN(dateObj)) {
                                    formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } else {
                                    formattedTime = student.time_taken;
                                }
                            }
                        }
                    }

                    tr.innerHTML = `
                        <td style="padding: 16px 6px; font-weight: 700; color: var(--text-main); font-size: 0.85rem; text-align: center;">${student.student_id}</td>
                        <td style="padding: 16px 6px; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-align: center;">${student.student_name}</td>
                        <td style="padding: 16px 6px; text-align: center;">${presence}</td>
                        <td style="padding: 16px 6px; color: var(--text-muted); font-size: 0.85rem; text-align: center; font-weight: 600;">${formattedTime}</td>
                    `;
                    
                    tableBody.appendChild(tr);
                });

            } catch (parseError) {
                console.error("PHP Error:", rawText);
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red; padding: 25px; font-weight: bold;">System Error</td></tr>`;
            }
        })
        .catch(error => {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red; padding: 25px; font-weight: bold;">Network Error</td></tr>`;
        });
});