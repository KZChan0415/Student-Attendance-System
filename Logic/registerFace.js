const video = document.getElementById('camera_preview');
const statusMessage = document.getElementById('status_message');
const captureBtn = document.getElementById('capture_btn');
const studentInput = document.getElementById('student_id_input');

document.addEventListener('DOMContentLoaded', async () => {
    updateStatus("Loading Mobile Models...", "#854d0e", "#fef08a");
    await loadAPI();
    
    updateStatus("Starting Camera...", "#475569", "#e2e8f0");
    await startCamera();
    
    updateStatus("Ready. Enter ID, face the camera, and click Capture.", "#1e293b", "#e2e8f0");
});

async function loadAPI() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('models');
    } catch (error) {
        console.error("API Load Error:", error);
        updateStatus("Failed to load AI models.", "#991b1b", "#fecaca");
    }
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "user",
                width: { ideal: 320 }, 
                height: { ideal: 240 } 
            } 
        });
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            video.play();
        };
    } catch (error) {
        console.error("Camera Error:", error);
        updateStatus("Camera access denied or missing!", "#991b1b", "#fecaca");
    }
}

function updateStatus(text, textColor, bgColor) {
    statusMessage.innerText = text;
    statusMessage.style.color = textColor;
    statusMessage.style.backgroundColor = bgColor;
}

captureBtn.addEventListener('click', async () => {
    const studentId = studentInput.value.trim();
    
    if (!studentId) {
        alert("Please enter a Student ID first!");
        return;
    }

    updateStatus("Scanning face geometry...", "#854d0e", "#fef08a");
    
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.6 });
    const detection = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
        updateStatus("No face detected! Please look clearly at the camera.", "#991b1b", "#fecaca");
        return;
    }

    const descriptorArray = Array.from(detection.descriptor);
    const descriptorString = JSON.stringify(descriptorArray);

    updateStatus("Face captured! Saving to database...", "#0284c7", "#bae6fd");

    saveFaceToDB(studentId, descriptorString);
});

function saveFaceToDB(studentId, faceDataString) {
    const dataToSend = `student_id=${encodeURIComponent(studentId)}&face_descriptor=${encodeURIComponent(faceDataString)}`;

    fetch('Backend/registerFace.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: dataToSend
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateStatus("Face Successfully Registered!", "#065f46", "#a7f3d0");
            studentInput.value = ""; 
        } else {
            updateStatus("Database Error: " + data.message, "#991b1b", "#fecaca");
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
        updateStatus("System Error: Check console.", "#991b1b", "#fecaca");
    });
}