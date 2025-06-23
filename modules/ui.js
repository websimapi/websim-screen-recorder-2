export class UI {
    constructor() {
        this.videoPreview = document.getElementById('videoPreview');
        this.startRecordingBtn = document.getElementById('startRecording');
        this.stopRecordingBtn = document.getElementById('stopRecording');
        this.downloadVideoBtn = document.getElementById('downloadVideo');
        this.bridgeStatusSpan = document.getElementById('bridgeStatus');
        this.recordingQualitySelect = document.getElementById('recordingQuality'); // New element
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
        this.recordingQualitySelect.disabled = isRecording; // Disable quality selection during recording
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

    /**
     * Returns selected recording quality settings.
     * @returns {{frameRate: number, bitsPerSecond: number}}
     */
    getRecordingQuality() {
        const selectedValue = this.recordingQualitySelect.value;
        switch (selectedValue) {
            case 'low':
                return { frameRate: 15, bitsPerSecond: 1_000_000 }; // 1 Mbps
            case 'high':
                return { frameRate: 60, bitsPerSecond: 6_000_000 }; // 6 Mbps
            case 'medium':
            default:
                return { frameRate: 30, bitsPerSecond: 3_000_000 }; // 3 Mbps
        }
    }

    // Method to update bridge status (conceptual, not dynamic in this app)
    // setBridgeStatus(status, color) {
    //     this.bridgeStatusSpan.textContent = status;
    //     this.bridgeStatusSpan.style.color = color;
    // }
}