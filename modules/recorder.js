export class Recorder {
    constructor() {
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.onRecordingStoppedCallback = null;
        this.onStreamActiveCallback = null;
        this.onStreamInactiveCallback = null;
    }

    async startRecording(qualitySettings, onStreamActive, onRecordingStopped, onStreamInactive) {
        this.onStreamActiveCallback = onStreamActive;
        this.onRecordingStoppedCallback = onRecordingStopped;
        this.onStreamInactiveCallback = onStreamInactive;

        const videoConstraints = {
            mediaSource: 'screen',
            frameRate: qualitySettings.frameRate
        };

        try {
            this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: videoConstraints,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            this.onStreamActiveCallback(this.mediaStream); // Notify UI to show preview

            const options = { 
                mimeType: 'video/webm; codecs=vp8',
                videoBitsPerSecond: qualitySettings.bitsPerSecond
            };

            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.warn(`${options.mimeType} is not supported, trying default.`);
                options.mimeType = 'video/webm';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.error('No supported MIME type for MediaRecorder found!');
                    alert('Your browser does not support recording video in a compatible format.');
                    // Call the inactive callback before cleaning up
                    if (this.onStreamInactiveCallback) {
                        this.onStreamInactiveCallback(); // Notify UI about stream ending due to error
                    }
                    this.stopStreamAndCleanUp();
                    return;
                }
            }
            
            this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                if (this.recordedChunks.length > 0) {
                    const blob = new Blob(this.recordedChunks, { type: this.recordedChunks[0].type });
                    const url = URL.createObjectURL(blob);
                    this.onRecordingStoppedCallback(url, `screen-recording-${Date.now()}.webm`);
                } else {
                    console.warn("Recording stopped but no data chunks were recorded.");
                    this.onRecordingStoppedCallback(null, null); // Indicate no valid recording
                }
                this.recordedChunks = [];
                this.stopStreamAndCleanUp(); // Stop tracks after recording data is processed
            };

            this.mediaStream.oninactive = () => {
                console.log("MediaStream became inactive (e.g., user stopped sharing).");
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                } else {
                    // If recorder is not active, but stream became inactive (e.g., user cancelled sharing)
                    // We need to inform the UI and clean up.
                    // Call the callback BEFORE cleaning up, as cleanup nullifies it.
                    if (this.onStreamInactiveCallback) {
                        this.onStreamInactiveCallback(); // Notify UI about inactive stream
                    }
                    this.stopStreamAndCleanUp(); // Clean up if stream ends without active recording
                }
            };

            this.mediaRecorder.start();
            console.log('Recording started');

        } catch (err) {
            console.error('Error starting recording:', err);
            alert('Could not start screen recording. Please ensure you granted permissions. Error: ' + err.message);
            // Call the inactive callback before cleaning up
            if (this.onStreamInactiveCallback) {
                this.onStreamInactiveCallback(); // Notify UI about stream ending due to error
            }
            this.stopStreamAndCleanUp(); // Ensure clean up even if start fails
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            console.log('Recording stopped');
        }
    }

    // Stops all tracks in the current media stream and resets internal state
    stopStreamAndCleanUp() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        this.mediaRecorder = null; // Ensure recorder instance is cleared
        // Reset callbacks to prevent stale references
        this.onStreamActiveCallback = null;
        this.onRecordingStoppedCallback = null;
        this.onStreamInactiveCallback = null;
    }
}