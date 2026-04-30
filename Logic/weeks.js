const container = document.getElementById('weeks_container');
const urlParams = new URLSearchParams(window.location.search);
const currentClassId = urlParams.get('class');

for (let week = 1; week <= 7; week++) { 
    const row = document.createElement('div');
    row.className = 'week_row';
        
    row.innerHTML = `
        <span class="week_label">Week ${week}</span>
            
        <div class="week_group">
            <button class="week_button" onclick="window.location.href='main.html?class=${currentClassId}&week=${week}'">SCAN</button>
            <button class="week_button" onclick="window.location.href='view.html?class=${currentClassId}&week=${week}'">VIEW</button>
        </div>
    `;

    container.appendChild(row);
}