const statusMessage = document.getElementById('status_message');
const displayName = document.getElementById('display_name');
const displayId = document.getElementById('display_id');
const video = document.getElementById('camera_preview');
const urlParams = new URLSearchParams(window.location.search);
const currentClass = urlParams.get('class');
const currentWeek = urlParams.get('week');

let isAPILoaded = false;
let isProcessing = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (!currentClass || !currentWeek) {
        updateStatus("Error: Missing class or week data.", "#991b1b", "#fecaca");
        return; 
    }

    if (!('NDEFReader' in window)) {
        updateStatus("NFC not supported", "#991b1b", "#fecaca");
        return;
    }

    updateStatus("Loading API...", "#854d0e", "#fef08a");
    await loadAPI();

    updateStatus("TAP HERE TO START SCANNER", "#1e293b", "#e2e8f0");
    statusMessage.style.cursor = "pointer"; 

    statusMessage.addEventListener('click', async () => {
        if (!isAPILoaded) {
            alert("API is still loading, please wait!");
            return;
        }

        try {
            const ndef = new NDEFReader();
            await ndef.scan(); 
            
            updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");

            startCamera();

            ndef.addEventListener("reading", async ({ message, serialNumber }) => {
                if (isProcessing) return; 
    
                isProcessing = true;      

                updateStatus("Processing...", "#854d0e", "#fef08a");
                displayName.innerText = "Scanning Face...";
                displayId.innerText = "---";

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
                    updateStatus("Error: Blank card.", "#991b1b", "#fecaca");
                    resetScanner();
                    return;
                }

                await verifyFaceAndAttend(uid, studentIdFromCard);
            });

        } catch (error) {
            console.error(error);
            updateStatus("Scanner Error: " + error.message, "#991b1b", "#fecaca");
        }
    });
});

async function loadAPI() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('models');
        
        isAPILoaded = true;
        console.log("Mobile Models Loaded");
    } catch (error) {
        alert("CRASH REPORT: " + error.message);
        updateStatus("ERROR: Check alert pop-up", "#991b1b", "#fecaca");
    }
}

async function startCamera() {
    video.style.display = "inline-block"; 
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;
        
        video.addEventListener('loadedmetadata', async () => {
            try {
                await video.play(); 
                
                updateStatus("Warming up AI engine...", "#854d0e", "#fef08a");
                const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold: 0.1 });
                await faceapi.detectSingleFace(video, options);
                
                updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");
                
            } catch (playError) {
                alert("BROWSER BLOCKED VIDEO: " + playError.message);
                updateStatus("Video Blocked. Check Alert.", "#991b1b", "#fecaca");
            }
        }, { once: true });

    } catch (error) {
        console.error("Camera Error:", error);
        alert("Camera Access Denied by Phone.");
    }
}

async function verifyFaceAndAttend(uid, studentIdFromCard) {
    try {
        updateStatus("Analyzing Face...", "#854d0e", "#fef08a");
        
        const options = new faceapi.TinyFaceDetectorOptions({inputSize: 224, scoreThreshold: 0.5});
        const liveDetection = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceDescriptor();

        if (!liveDetection) {
            updateStatus("No face detected!", "#991b1b", "#fecaca");
            resetScanner();
            return;
        }

        updateStatus("Fetching Database...", "#854d0e", "#fef08a");
        const savedFaceDataString = await fetchFaceData(studentIdFromCard);
        
        if (!savedFaceDataString) {
            updateStatus("Error: Face not registered.", "#991b1b", "#fecaca");
            resetScanner();
            return;
        }

        updateStatus("Comparing Geometry...", "#854d0e", "#fef08a");
        const savedDescriptorArray = new Float32Array(JSON.parse(savedFaceDataString));
        
        const faceMatcher = new faceapi.FaceMatcher(savedDescriptorArray, 0.55);
        const matchResult = faceMatcher.findBestMatch(liveDetection.descriptor);

        if (matchResult.label !== 'unknown') {
            updateStatus("Face Verified!", "#065f46", "#a7f3d0");
            processAttendance(uid, studentIdFromCard);  
        } else {
            updateStatus("SECURITY ALERT: Face Mismatch!", "#991b1b", "#fecaca");
            resetScanner();
        }

    } catch (error) {
        alert("CRASH IN VERIFICATION: " + error.message);
        updateStatus("System Error: See Alert", "#991b1b", "#fecaca");
        resetScanner();
    }
}

async function fetchFaceData(studentId) {
    try {
        const response = await fetch(`Backend/getFace.php?student_id=${encodeURIComponent(studentId)}`);
        const data = await response.json();

        if (data.status === 'success' && data.face_descriptor) {
            return data.face_descriptor; 
        } else {
            console.warn("Face lookup failed:", data.message);
            return null; 
        }
    } catch (error) {
        console.error("Database fetch error:", error);
        return null;
    }
}

function updateStatus(text, textColor, bgColor) {
    statusMessage.innerText = text;
    statusMessage.style.color = textColor;
    statusMessage.style.backgroundColor = bgColor;
}

function resetScanner() {
    setTimeout(() => {
        updateStatus(`Ready. Tap for ${currentClass} (Week ${currentWeek})`, "#475569", "#e2e8f0");
        displayName.innerText = "Waiting...";
        displayId.innerText = "---";
        
        isProcessing = false; 
    }, 3500);
}

function processAttendance(uid, studentIdFromCard) {
    const dataToSend = `nfc_id=${encodeURIComponent(uid)}&student_id=${encodeURIComponent(studentIdFromCard)}&class_id=${encodeURIComponent(currentClass)}&week=${encodeURIComponent(currentWeek)}`;

    fetch('Backend/main.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: dataToSend
    })
    .then(response => {
        if (!response.ok) throw new Error("Server responded with error " + response.status);
        return response.json(); 
    })
    .then(data => {
        if (data.status === 'success') {
            displayName.innerText = data.student_name;
            displayId.innerText = data.student_id;
            updateStatus("Attendance Recorded!", "#065f46", "#a7f3d0");
        } else {
            updateStatus(data.message, "#991b1b", "#fecaca");
            displayName.innerText = data.student_name || "Unknown";
            displayId.innerText = data.student_id || "---";
        }
        resetScanner();
    })
    .catch(error => {
        console.error('Debug Error:', error);
        updateStatus("System Error: Check Console", "#991b1b", "#fecaca");
        resetScanner();
    });
}