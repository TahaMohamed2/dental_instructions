/**
 * Displays a QR image viewer.
 */
function viewQRImage() {
    // Check if a QR image viewer already exists and remove it
    const existingViewer = document.querySelector('.qr-image-viewer');
    if (existingViewer) {
        existingViewer.remove();
    }

    // Record the current scroll position
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Create a new div element for the QR image viewer
    const qrImageViewer = document.createElement('div');
    qrImageViewer.classList.add('qr-image-viewer');

    // Create a new img element for the QR image
    const qrImage = document.createElement('img');
    qrImage.src = 'resources/QR.png';
    qrImage.alt = 'QR';

    // Add an event listener for the image load event
    qrImage.addEventListener('load', () => {
        // Append the image to the QR image viewer
        qrImageViewer.appendChild(qrImage);
        // Append the QR image viewer to the body
        document.body.appendChild(qrImageViewer);
        // Set the display property to block
        qrImageViewer.style.display = 'block';
    });

    // Add an event listener for the image error event
    qrImage.addEventListener('error', () => {
        console.error('Failed to load QR image');
    });

    // Add an event listener for the click event
    qrImageViewer.addEventListener('click', () => {
        // Remove the QR image viewer from the body
        qrImageViewer.remove();
        // Scroll back to the original position
        window.scrollTo(scrollX, scrollY);
    });
}
