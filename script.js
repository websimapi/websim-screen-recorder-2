// Get DOM elements
const videoPreview = document.getElementById('videoPreview');
const startRecordingBtn = document.getElementById('startRecording');
const stopRecordingBtn = document.getElementById('stopRecording');
const downloadVideoBtn = document.getElementById('downloadVideo');
const bridgeStatusSpan = document.getElementById('bridgeStatus');

let mediaStream; // Stores the MediaStream from getDisplayMedia
let mediaRecorder; // Stores the MediaRecorder instance
let recordedChunks = []; // Stores video data chunks

// Function to start recording
async function startRecording() {
    try {
        // Request access to display (screen/tab/window) and audio
        // The 'preferCurrentTab' option is experimental and may not be supported by all browsers,
        // but it can help guide the user to select the current tab if desired.
        // For 'system audio' (desktop audio), getDisplayMedia only captures the audio from the chosen display source (tab/window/screen).
        // It does not capture audio from other applications on the system unless the user explicitly shares "System Audio" when selecting the entire screen.
        // The user's prompt mentions a separate bridge for system audio for desktop, which is acknowledged in the HTML.
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen' }, // 'screen' allows tab, window, or entire screen
            audio: {
                echoCancellation: true, // Recommended for screen sharing to reduce echo
                noiseSuppression: true  // Recommended for screen sharing to reduce noise
            }
        });

        // Display the stream in the video preview
        videoPreview.srcObject = mediaStream;

        // Initialize MediaRecorder
        // We'll try to use 'video/webm; codecs=vp8' which is widely supported
        const options = { mimeType: 'video/webm; codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.warn(`${options.mimeType} is not supported, trying default.`);
            options.mimeType = 'video/webm'; // Fallback to a simpler WebM type
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.error('No supported MIME type for MediaRecorder found!');
                alert('Your browser does not support recording video in a compatible format.');
                stopStreamAndCleanUp();
                return;
            }
        }
        mediaRecorder = new MediaRecorder(mediaStream, options);

        // Event handler for when data becomes available
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Event handler for when recording stops
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: recordedChunks[0].type });
            const url = URL.createObjectURL(blob);
            downloadVideoBtn.href = url;
            downloadVideoBtn.download = `screen-recording-${Date.now()}.webm`;
            downloadVideoBtn.disabled = false;
            // No need to revoke URL immediately as user might download it
            // URL.revokeObjectURL(url); // Can be revoked after download link is clicked or component unmounted
            recordedChunks = []; // Clear chunks for next recording
            stopStreamAndCleanUp(); // Stop tracks immediately after recording stops
        };

        // Event handler for when stream ends (e.g., user stops sharing in browser UI)
        mediaStream.oninactive = () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            } else {
                // If recording wasn't active, just clean up
                stopStreamAndCleanUp();
            }
        };


        mediaRecorder.start();
        console.log('Recording started');

        // Update button states
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = false;
        downloadVideoBtn.disabled = true; // Disable download until recording is finished
        videoPreview.style.display = 'block'; // Show preview
        videoPreview.muted = true; // Mute preview to avoid feedback loop
    } catch (err) {
        console.error('Error starting recording:', err);
        alert('Could not start screen recording. Please ensure you granted permissions. Error: ' + err.message);
        stopStreamAndCleanUp(); // Ensure clean up even if start fails
    }
}

// Function to stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        console.log('Recording stopped');
    }
    // Stream tracks are stopped in mediaRecorder.onstop or mediaStream.oninactive
    // Button states will be updated in mediaRecorder.onstop
}

// Function to clean up media stream tracks
function stopStreamAndCleanUp() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        videoPreview.srcObject = null;
        mediaStream = null;
    }
    // Reset button states to initial
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    // downloadVideoBtn state is handled by onstop
}

// Event Listeners
startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);
// The download button is an <a> tag, its href and download attributes are set dynamically.
// We just need to make sure it's enabled when a recording is ready.

// Initial UI state setup
window.onload = () => {
    // Hide download button until a recording is available
    downloadVideoBtn.disabled = true;
    stopRecordingBtn.disabled = true;
    videoPreview.style.display = 'none'; // Hide preview until recording starts
    // Simulate desktop audio bridge status (always disconnected as it's conceptual)
    bridgeStatusSpan.textContent = 'Disconnected';
    bridgeStatusSpan.style.color = 'red';
};


