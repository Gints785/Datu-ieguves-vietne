$(document).on('click', '#new',(e)=>{
    $(".modal_conform").css('display' ,'flex')
    resetCheckboxes();
})


document.getElementById('close_modal').addEventListener('click', function() {
    // Hide the modal
    document.querySelector('.modal_conform').style.display = 'none';
});




const checkboxes = document.querySelectorAll('input[type="checkbox"]');

// Add event listener to each checkbox
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
         // Count how many checkboxes are checked
        const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
        
        // If no checkbox is checked, prevent deselecting this one
        if (checkedCount === 0) {
            this.checked = true;
        }
    });
});

function resetCheckboxes() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true; // Reset all checkboxes to checked state
    });
}



function launchPythonScripts() {
    
    // Get all checkboxes
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    var selectedCheckboxes = [];

    // Iterate over each checkbox to find the selected ones
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            // If checkbox is checked, add its id to the selectedCheckboxes array
            selectedCheckboxes.push(checkbox.id);
           
        }
    });
    console.log(selectedCheckboxes);





    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();

    // Configure the request
    xhr.open('POST', 'data/python.php', true);

    // Set the appropriate Content-Type header
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Define what happens on successful data submission
    xhr.onload = function() {
        if (xhr.status === 200) {
           
            console.log('Python scripts executed successfully.');
   
            
        } else {
        
            console.log('Error executing Python scripts.');
        }
    };

    // Define what happens in case of error
    xhr.onerror = function() {
        newButton.disabled = false;
        newButton.classList.remove('disabled');
  
        console.log('Error executing Python scripts.');
    };

    // Send the request with selected checkboxes as data
    xhr.send('selectedCheckboxes=' + JSON.stringify(selectedCheckboxes));
}

// Add event listener to trigger the execution of the PHP script when the button is clicked
document.getElementById('launchScripts').addEventListener('click', function(event) {
    
    // Launch Python scripts by calling the function
    launchPythonScripts();
});


window.addEventListener('DOMContentLoaded', function() {
    var newButtonDisabled = localStorage.getItem('newButtonDisabled');
    if (newButtonDisabled) {
        // If "newButtonDisabled" is true, disable the #new button and add the disabled class
        var newButton = document.getElementById('new');
        newButton.disabled = true;
        newButton.classList.add('disabled');
    }
});



