document.addEventListener("DOMContentLoaded", function() {
    var eventSource;


    function updateStatus(id, newStatus) {
        var cleanId = id + '_ind';
        var element = document.getElementById(cleanId);
        
        if (element) {
            // console.log('Updating element:', id, 'with status:', newStatus);
            element.classList.remove('open', 'in-progress', 'dead');
            element.classList.add(newStatus);
        } else {
            console.error('Element not found with ID:', id);
        }
    }

    function handleSSE() {
        eventSource = new EventSource('data/sse.php');

        eventSource.onmessage = function(event) {
            var data = JSON.parse(event.data);

            if (data.error) {
                console.error(data.error);
            } else {
                if (data.status) {
            
                    var statusWithoutPrefix = data.status.replace('status ', '');
                    updateStatus(data.column, statusWithoutPrefix);
                }
                if (data.button_state !== undefined) {
                    updateButtonState(data.button_state);
                }
            }
        };

        eventSource.onerror = function(error) {
          
            eventSource.close();

      
            setTimeout(function() {
                
                handleSSE();
            }, 2000); 
        };
    }


    function updateButtonState(buttonState) {
        var button = document.getElementById('new');
        console.log('Received button state:', buttonState);
        
        if (button) {
            if (buttonState === true) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        } else {
          
        }
    }



    handleSSE();

  
    
});
