$(document).on('click', '#new',(e)=>{
    $(".modal_conform").css('display' ,'flex')
    resetCheckboxes();
})


document.getElementById('close_modal').addEventListener('click', function() {
   
    document.querySelector('.modal_conform').style.display = 'none';
});




const checkboxes = document.querySelectorAll('input[type="checkbox"]');

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {

        const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
        
      
        if (checkedCount === 0) {
            this.checked = true;
        }
    });
});

function resetCheckboxes() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true; 
    });
}



function launchPythonScripts() {

    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    var selectedCheckboxes = [];


    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
         
            selectedCheckboxes.push(checkbox.id);
           
        }
    });
    console.log(selectedCheckboxes);





    var xhr = new XMLHttpRequest();

    xhr.open('POST', 'data/python.php', true);

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function() {
        if (xhr.status === 200) {
           
            console.log('Python scripts executed successfully.');
   
            
        } else {
        
            console.log('Error executing Python scripts.');
        }
    };


    xhr.onerror = function() {
        newButton.disabled = false;
        newButton.classList.remove('disabled');
  
        console.log('Error executing Python scripts.');
    };

    xhr.send('selectedCheckboxes=' + JSON.stringify(selectedCheckboxes));
}


document.getElementById('launchScripts').addEventListener('click', function(event) {
    

    launchPythonScripts();
});


window.addEventListener('DOMContentLoaded', function() {
    var newButtonDisabled = localStorage.getItem('newButtonDisabled');
    if (newButtonDisabled) {

        var newButton = document.getElementById('new');
        newButton.disabled = true;
        newButton.classList.add('disabled');
    }
});



