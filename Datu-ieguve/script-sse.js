document.addEventListener("DOMContentLoaded", function() {
    var eventSource;

    // Function to update the status class of a specific element
    function updateStatus(id, newStatus) {
        var cleanId = id + '_ind';
        var element = document.getElementById(cleanId);
        
        if (element) {
            console.log('Updating element:', id, 'with status:', newStatus);
            element.classList.remove('open', 'in-progress', 'dead');
            element.classList.add(newStatus);
        } else {
            console.error('Element not found with ID:', id);
        }
    }

    // Function to handle server-sent events
    function handleSSE() {
        eventSource = new EventSource('data/sse.php');

        eventSource.onmessage = function(event) {
            var data = JSON.parse(event.data);
            console.log('Received SSE data:', data);
            if (data.error) {
                console.error(data.error);
            } else {
                // Remove the "status " prefix from the status before updating
                var statusWithoutPrefix = data.status.replace('status ', '');
                updateStatus(data.column, statusWithoutPrefix);
            }
        };

        eventSource.onerror = function(error) {
            console.error('Server-Sent Events error:', error);
            eventSource.close();

            // Try to reconnect after a delay
            setTimeout(function() {
                console.log('Attempting to reconnect...');
                handleSSE();
            }, 5000); // Reconnect after 5 seconds
        };
    }

    // Start handling server-sent events
    handleSSE();
});
