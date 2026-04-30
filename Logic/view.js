document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('view_container');
    const urlParams = new URLSearchParams(window.location.search);
    const currentClassId = urlParams.get('class');
    const currentWeek = urlParams.get('week');

    // 1. Safety check for the URL
    if (!currentClassId || !currentWeek) {
        container.innerHTML = `<h2 style="color: red; text-align: center;">Error: Missing Class or Week Data</h2>`;
        return;
    }

    // 2. Table structure
    container.innerHTML = `
        <div class="header">
            <h2>${currentClassId} - Week ${currentWeek}</h2>
        </div>
        <div style="overflow-x: auto; padding: 10px;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background-color: #f8fafc; text-align: left;">
                        <th style="padding: 15px; border-bottom: 2px solid #e2e8f0; color: #334155;">Student ID</th>
                        <th style="padding: 15px; border-bottom: 2px solid #e2e8f0; color: #334155;">Student Name</th>
                        <th style="padding: 15px; border-bottom: 2px solid #e2e8f0; color: #334155; text-align: center;">Presence</th>
                        <th style="padding: 15px; border-bottom: 2px solid #e2e8f0; color: #334155; text-align: center;">Time</th>
                    </tr>
                </thead>
                <tbody id="attendance_table_body">
                    <tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">Fetching attendance data...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    const tableBody = document.getElementById('attendance_table_body');

    // 3. Fetch the data from database
    fetch(`Backend/view.php?class=${currentClassId}&week=${currentWeek}`)
        .then(response => response.text())
        .then(rawText => {
            try {
                const data = JSON.parse(rawText); 
                
                tableBody.innerHTML = ''; 

                if (data.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">No students found enrolled in this class.</td></tr>`;
                    return;
                }

                data.forEach(student => {
                    const tr = document.createElement('tr');
                    
                    let presence = `<span style="color: #ef4444; font-weight: bold; background-color: #fee2e2; padding: 5px 10px; border-radius: 6px;">Absent</span>`;
                    let formattedTime = "---";

                    if (student.presence_status == 1 || student.presence_status === "Present") {
                        presence = `<span style="color: #10b981; font-weight: bold; background-color: #d1fae5; padding: 5px 10px; border-radius: 6px;">Present</span>`;
                        
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
                        <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${student.student_id}</td>
                        <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; color: #475569;">${student.student_name}</td>
                        <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; text-align: center;">${presence}</td>
                        <td style="padding: 15px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b;">${formattedTime}</td>
                    `;
                    
                    tableBody.appendChild(tr);
                });

            } catch (parseError) {
                console.error("PHP CRASH TEXT:", rawText);
                tableBody.innerHTML = `<tr><td colspan="4" style="text-align: left; color: red; padding: 20px; font-weight: bold; background: #fee2e2;">
                    <b>PHP CRASH REPORT:</b><br><br> ${rawText}
                </td></tr>`;
            }
        })
        .catch(error => {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red; padding: 20px; font-weight: bold;">Network failed entirely.</td></tr>`;
        });
});