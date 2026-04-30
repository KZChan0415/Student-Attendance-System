document.addEventListener('DOMContentLoaded', () => {
    loadClasses();
});

function loadClasses() {
    const grid = document.getElementById('classGrid');

    fetch('Backend/class.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('No Network Response');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                grid.innerHTML = '<p style="text-align: center; width: 100%;">No classes found.</p>';
                return;
            }

            data.forEach(classItem => {
                const card = document.createElement('div');
                card.className = 'class_card clickable_card';
                
                card.onclick = () => {
                    window.location.href = `weeks.html?class=${classItem.class_id}`;
                };

                card.innerHTML = `
                    <h2 class="class_title" style="border:none; margin:0; padding:10px 0;">
                        ${classItem.class_id} - ${classItem.class_name}
                    </h2>
                `;

                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching classes:', error);
            grid.innerHTML = '<p style="text-align: center; color: #ef4444; width: 100%;">Failed to load classes. </p>';
        });
}