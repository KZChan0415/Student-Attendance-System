const statusMessage = document.getElementById('status_message');
const displayName = document.getElementById('display_name');
const displayId = document.getElementById('display_id');
const urlParams = new URLSearchParams(window.location.search);
const currentClass = urlParams.get('class');
const currentWeek = urlParams.get('week');

document.addEventListener('DOMContentLoaded', () => {
    if (!currentClass || !currentWeek) {
        updateStatus("Error: Missing class or week data.", "#991b1b", "#fecaca");
        return; 
    }

    if (!('NDEFReader' in window)) {
        updateStatus("NFC not supported", "#991b1b", "#fecaca");
        return;
    }

    updateStatus("TAP HERE TO START SCANNER", "#1e293b", "#e2e8f0");
    statusMessage.style.cursor = "pointer"; 

    statusMessage.addEventListener('click', async () => {
        try {
            const ndef = new NDEFReader();
            await ndef.scan(); 
            
            updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");

            ndef.addEventListener("reading", ({ message, serialNumber }) => {
                updateStatus("Processing...", "#854d0e", "#fef08a");
                displayName.innerText = "Loading...";
                displayId.innerText = "Loading...";

                const uid = serialNumber;
                let studentIdFromCard = "";

                const textDecoder = new TextDecoder();
                for (const record of message.records) {
                    if (record.recordType === "text") {
                        studentIdFromCard = textDecoder.decode(record.data);
                        break;
                    }
                }

                if (!studentIdFromCard) {
                    updateStatus("Error: Blank card. No Student ID found.", "#991b1b", "#fecaca");
                    displayName.innerText = "Unknown";
                    displayId.innerText = "---";
                    setTimeout(() => {
                        updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");
                    }, 3000);
                    return;
                }

                processAttendance(uid, studentIdFromCard);
            });

        } catch (error) {
            console.error(error);
            updateStatus("Scanner Error: " + error.message, "#991b1b", "#fecaca");
        }
    });
});

function updateStatus(text, textColor, bgColor) {
    statusMessage.innerText = text;
    statusMessage.style.color = textColor;
    statusMessage.style.backgroundColor = bgColor;
}

function processAttendance(uid, studentIdFromCard) {
    const dataToSend = `nfc_id=${encodeURIComponent(uid)}&student_id=${encodeURIComponent(studentIdFromCard)}&class_id=${encodeURIComponent(currentClass)}&week=${encodeURIComponent(currentWeek)}`;

    fetch('Backend/main.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: dataToSend
    })
    .then(response => {
        // Check if the server sent back a valid response
        if (!response.ok) throw new Error("Server responded with error " + response.status);
        return response.json(); 
    })
    .then(data => {
        if (data.status === 'success') {
            displayName.innerText = data.student_name;
            displayId.innerText = data.student_id;
            updateStatus("Scan Successful!", "#065f46", "#a7f3d0");
        } else {
            updateStatus(data.message, "#991b1b", "#fecaca");
            displayName.innerText = data.student_name || "Unknown";
            displayId.innerText = data.student_id || "---";
        }

        // Reset UI after delay
        setTimeout(() => {
            updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");
            displayName.innerText = "Waiting...";
            displayId.innerText = "---";
        }, 3000);
    })
    .catch(error => {
        console.error('Debug Error:', error);
        updateStatus("System Error: Check Console", "#991b1b", "#fecaca");
        displayName.innerText = "Error";
        displayId.innerText = "---";
        
        // Reset on failure so user can try again
        setTimeout(() => {
            updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");
        }, 3000);
    });
}