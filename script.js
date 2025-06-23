import { Recorder } from 'recorder';
import { UI } from 'ui';

document.addEventListener('DOMContentLoaded', () => {
    const recorder = new Recorder();
    const ui = new UI();

    ui.init(
        async () => { // onStartClick callback from UI
            ui.updateRecordingState(true);
            ui.disableDownloadButton(); // Ensure download is disabled on new recording attempt
            ui.hidePreview(); // Hide old preview until new stream is active

            const qualitySettings = ui.getRecordingQuality(); // Get selected quality settings

            await recorder.startRecording(
                qualitySettings, // Pass quality settings to recorder
                (stream) => { // onStreamActive callback for Recorder
                    ui.showPreview(stream);
                },
                (url, filename) => { // onRecordingStopped callback for Recorder
                    ui.updateRecordingState(false);
                    if (url) {
                        ui.setDownloadLink(url, filename);
                    } else {
                        ui.disableDownloadButton(); // No recording data, disable download
                    }
                    ui.hidePreview(); // Hide preview after recording stops
                },
                () => { // onStreamInactive callback for Recorder (e.g., user cancels sharing or error)
                    ui.updateRecordingState(false);
                    ui.hidePreview();
                    ui.disableDownloadButton();
                }
            );
        },
        () => { // onStopClick callback from UI
            recorder.stopRecording();
            // UI state will be updated by the onRecordingStopped or onStreamInactive callbacks
            // triggered by the recorder's internal state changes.
        }
    );
});