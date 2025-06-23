export class UI {
    constructor() {
        this.videoPreview = document.getElementById('videoPreview');
        this.startRecordingBtn = document.getElementById('startRecording');
        this.stopRecordingBtn = document.getElementById('stopRecording');
        this.downloadVideoBtn = document.getElementById('downloadVideo');
        this.bridgeStatusSpan = document.getElementById('bridgeStatus');
    }

    init(onStartClick, onStopClick) {
        this.startRecordingBtn.addEventListener('click', onStartClick);
        this.stopRecordingBtn.addEventListener('click', onStopClick);

        // Initial UI state setup
        this.disableDownloadButton();
        this.stopRecordingBtn.disabled = true;
        this.videoPreview.style.display = 'none'; // Hide preview until recording starts
        this.bridgeStatusSpan.textContent = 'Disconnected';
        this.bridgeStatusSpan.style.color = 'red';
    }

    updateRecordingState(isRecording) {
        this.startRecordingBtn.disabled = isRecording;
        this.stopRecordingBtn.disabled = !isRecording;
        if (isRecording) {
            this.disableDownloadButton(); // Disable download when a new recording starts
        }
    }

    showPreview(stream) {
        this.videoPreview.srcObject = stream;
        this.videoPreview.style.display = 'block';
        this.videoPreview.muted = true; // Mute preview to avoid audio feedback loop
    }

    hidePreview() {
        this.videoPreview.srcObject = null;
        this.videoPreview.style.display = 'none';
    }

    setDownloadLink(url, filename) {
        if (url && filename) {
            this.downloadVideoBtn.href = url;
            this.downloadVideoBtn.download = filename;
            this.downloadVideoBtn.disabled = false;
        } else {
            this.disableDownloadButton();
        }
    }

    disableDownloadButton() {
        this.downloadVideoBtn.href = '#'; // Reset href to avoid previous download
        this.downloadVideoBtn.download = '';
        this.downloadVideoBtn.disabled = true;
    }

    // Method to update bridge status (conceptual, not dynamic in this app)
    // setBridgeStatus(status, color) {
    //     this.bridgeStatusSpan.textContent = status;
    //     this.bridgeStatusSpan.style.color = color;
    // }
}