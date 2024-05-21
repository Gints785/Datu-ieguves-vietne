$(document).ready(function(){
    //console.log("jQurey strāda!")
    let edit = false;
    fetchPrecugrupas()
    
    fetchkategorijas()
    let filteredProducts = [];
    let artikuls = [];
    let KATEGORIJA = '';
    let PRECUGRUPA = '';
  
    let pageSwitchEnabled = true; 


    let currentPage = 1;
    const batchSize = 30; // Change this value as needed
    fetchProducts();
    getTotalPagesAndUpdateMaxInput();

    // Function to fetch products based on page number
    function fetchProducts(page) {
        $.ajax({
            url: 'data/product-info.php',
            type: 'GET',
            data: { 
                page: page,
                batch_size: batchSize
            },
            success: function(response) {
                const preces_info = JSON.parse(response);
                displayProducts(preces_info);
             
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }

    
    $('#prevPage').click(function() {
        if (currentPage > 1) {
            currentPage--; 
            fetchProducts(currentPage); 
            updatePageNumber(); 
        }
    });

    
    $('#nextPage').click(function() {
        var totalPages = parseInt($('#totalPages').text()); 
        if (currentPage < totalPages) { 
            currentPage++; 
            fetchProducts(currentPage); 
            updatePageNumber(); 
        }
    });
    
   
    function updatePageNumber() {
        $('#pageNumInput').val(currentPage);
    }

    
    $('#pageNumInput').change(function() {
        const newPage = parseInt($(this).val());
        if (newPage >= 1) {
            currentPage = newPage; 
            fetchProducts(currentPage); 
        } else {
            
            $(this).val(currentPage);
        }
    });
    
    function getTotalPagesAndUpdateMaxInput() {
        $.ajax({
            url: 'data/get-total-pages.php',
            type: 'GET',
            data: { batch_size: batchSize }, // Send the batch size parameter if needed
            success: function(response) {
                var totalPages = parseInt(response);
                $('#totalPages').text(totalPages); // Update the total pages display
                $('#pageNumInput').attr('max', totalPages); // Set the max attribute of the input field
             

            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }

   



  
    $(document).on('click', '#Reset_price_selection', function() {
      
        $('#pagination').show();
        $('#dataArtikuls').val('');
        pageSwitchEnabled=true;   
        console.log('filteredProducts', filteredProducts);
        fetchProducts(currentPage);
        artikuls = [];
        KATEGORIJA = '';
        PRECUGRUPA = '';
        
      
    });
    
   
   
    
   

   $('#productForma').submit(e => {
    e.preventDefault();
    

   
    const initialData = $('#productForma').data('initialData');
    console.log('Initial Data:', initialData);
    const postData = {
        artikuls: $('#artikuls').val(),
        barbora: $('#barbora').val(),
        lats: $('#lats').val(),
        citro: $('#citro').val(),
        rimi: $('#rimi').val(),
        alkoutlet: $('#alkoutlet').val(),
        id: $('#productID').val(),
        action: edit === false ? 'add' : 'edit'
    };
    console.log('Post Data:', postData);

    const postDataForComparison = { ...postData };
    delete postDataForComparison.action;


    const initialDataForComparison = { ...initialData };
    delete initialDataForComparison.action;
    
    const changedFields = Object.keys(postDataForComparison).filter(key => postDataForComparison[key] !== initialDataForComparison[key]);
    console.log('Changed Fields:', changedFields);

       if (changedFields.length === 0) {
        
    } else if (postData.action !== 'add') {
        showAlert('Veiksmīgi rediģēts!');
    }
 
    if (postData.action === 'add') {
        $.post('data/check.php', postData, (response) => {
            console.log('Response from check.php:', response); 

            if (response === 'eksiste') {
                alert('Šāda prece jau eksistē!');
            } else if (response === 'neeksiste') {
                alert('Šāds artikuls neeksistē!');
            } else if (response === 'success') {
                
                const url = edit === false ? 'data/product-add.php' : 'data/product-edit.php';
                $.post(url, postData, (response) => {
                    $("#productForma").trigger('reset');
                    console.log("Filtered Products:", filteredProducts); 

                    fetchProducts();

                    $(".modal").hide();
                    edit = false;
                    showAlert('Veiksmīgi pievienots!');
                });
            } else {
         
                alert('An error occurred while checking artikuls!');
            }
        });
    } else {
     
    
       
        const url = edit === false ? 'data/product-add.php' : 'data/product-edit.php';
        $.post(url, postData, (response) => {
            $("#productForma").trigger('reset');
            console.log("Filtered Products:", filteredProducts); 
            if (pageSwitchEnabled) {
                fetchProducts(currentPage);              
            } else {
                getProductInfo();
            }
            $(".modal").hide();
            edit = false;
        
        });
    }
});
    
    

    
    $(document).on('click', '.product-item',(e)=>{
       
       
        $(".modal").css('display' ,'flex')
        const element = $(this)[0].activeElement.parentElement.parentElement
        console.log(element)
        const id = $(element).attr('productID')
      
        $.post('data/product-single.php',{id},(response) => {
            const product_info = JSON.parse(response)
            $('#artikuls').val(product_info.artikuls)
            $('#barbora').val(product_info.barbora)
            $('#lats').val(product_info.lats)          
            $('#citro').val(product_info.citro)
            $('#rimi').val(product_info.rimi)
            $('#alkoutlet').val(product_info.alkoutlet)
            $('#productID').val(product_info.id)
            edit = true

            const modalTitle = edit ? 'Rediģēt produktu' : 'Pievienot produktu';
            $('h1').text(modalTitle);
            if (edit === true) {
                $('#artikuls').prop('disabled', true).css({
                    'background-color': '#e6e6e6',
                });
                
              
            } 
            const initialData = {
                artikuls: product_info.artikuls,
                barbora: product_info.barbora,
                lats: product_info.lats,
                citro: product_info.citro,
                rimi: product_info.rimi,
                alkoutlet: product_info.alkoutlet,
                id: product_info.id
            };
            $('#productForma').data('initialData', initialData);
        })
    e.preventDefault()
    })


    
    $('#Price_selection').click(function() {
    
       
        console.log("CALLED:");
        const enteredArtikuls = $('#dataArtikuls').val().trim() ? $('#dataArtikuls').val().trim().split(/\s+/) : [];
        console.log("Entered artikuls:", enteredArtikuls);
        artikuls = enteredArtikuls;
        const enteredKategorija = $('#kateg').val();
        console.log("Entered Kategorija:", enteredKategorija);
        KATEGORIJA = enteredKategorija;
        const enteredPrecugrupa = $('#precgroup').val();
        console.log("Entered Precugrupa:", enteredPrecugrupa);
        PRECUGRUPA = enteredPrecugrupa;
        
        if (enteredArtikuls.length > 0 || enteredKategorija || enteredPrecugrupa) {
        getProductInfo();
        pageSwitchEnabled=false;   
        }else{
        
        $('#pagination').show();
        fetchProducts();   
        
        }
    });
    
    // Function to handle AJAX request and processing
    function getProductInfo() {
        $('#pagination').hide();
       
        $.ajax({
            url: 'data/product-filter.php',
            type: 'GET',
            success: function (response) {
               

                const preces_info = JSON.parse(response);
                
                console.log("All artikuls in preces_info:", preces_info.map(preces => preces.artikuls));
                console.log("All kategorijas in preces_info:", preces_info.map(preces => preces.kateg_id));
                console.log("All precugrupas in preces_info:", preces_info.map(preces => preces.grupas_id));
    
                let filteredPreces = preces_info;
               
                // Filter by kategorija first
                let filteredPrecesAndKategorijaAndPrecugrupa = filteredPreces;
                if (KATEGORIJA !== '') {
                    filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => preces.kateg_id === KATEGORIJA);
                }
    
                // If kategorija is selected or if no kategorija is selected but precugrupa is, then filter by precugrupa
                if (KATEGORIJA !== '' || PRECUGRUPA !== '') {
                    if (PRECUGRUPA !== '') {
                        filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => preces.grupas_id === PRECUGRUPA);
                    }
                }
    
                // Filter by artikuls within the filtered category and precugrupa
                let filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls = filteredPrecesAndKategorijaAndPrecugrupa;
                if (artikuls.length > 0) {
                    filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => artikuls.includes(preces.artikuls));
                }
                
                filteredProducts = filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls;
                console.log("Filtered Products:", filteredProducts); 
                displayProducts(filteredProducts);
              
                $('#dataArtikuls').val('');
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }
   
    
    function displayProducts(preces_info) {
        filteredProducts = preces_info;
        let template = '';
        preces_info.forEach(preces_info => {
    
            template += `
                <tr productID="${preces_info.id}">
                    <td>${preces_info.id}</td>
                    <td>${preces_info.artikuls}</td>
                    <td>${preces_info.nosaukums}</td>
                    <td>${preces_info.barbora}</td>
                    <td>${preces_info.lats}</td>
                    <td>${preces_info.citro}</td>
                    <td>${preces_info.rimi}</td>
                    <td>${preces_info.alkoutlet}</td>
    
                    <td>
                        <a href="#" class="product-item btn-edit"><i class="far fa-edit"></i></a>
                    </td>
                </tr>`;
        });
        $('#prod_info').html(template);
    }



    $(document).on('click', '#new',(e)=>{
        $(".modal").css('display' ,'flex')
        $(".modal_conform").css('display' ,'flex')
        $('#artikuls').prop('disabled', false).css({
            'background-color': '#f6f6f6',
            'cursor': 'auto'
        });
    })

    $(document).on('click', '#import',(e)=>{
        $(".modal_import").css('display' ,'flex')
        const modalTitle = 'Importē preces';
        $('h1').text(modalTitle);
     
    })

    
    
    
    
    $(document).on('click', '.close_modal',(e)=>{
        $(".modal").hide()
        $(".modal_import").hide()
        edit = false
        $('#artikuls').prop('disabled', false).css({
            'background-color': '#f6f6f6',
            'cursor': 'auto'
        });
        $("#productForma").trigger('reset')
        const modalTitle = 'Pievienot produktu';
        $('h1').text(modalTitle);
        $('#input-file').val('');
    })
    
 
    })




    

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('input-file');
const listSection = document.querySelector('.list-section');
const listContainer = document.querySelector('.list');



dropArea.addEventListener('dragenter', handleDragEnter, false);
dropArea.addEventListener('dragover', handleDragOver, false);
dropArea.addEventListener('dragleave', handleDragLeave, false);
dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('mouseover', highlight, false);
dropArea.addEventListener('mouseout', unhighlight, false);





function handleDragEnter(e) {
    e.preventDefault();
    console.log('Drag entered');

    e.stopPropagation();
}

function handleDragOver(e) {
    e.preventDefault();
   
  
    e.stopPropagation();
    highlight();
}

function handleDragLeave(e) {
    e.preventDefault();
    console.log('Drag left');
    
    e.stopPropagation();
    unhighlight();
}

function highlight() {
    dropArea.style.border =' 3px solid #096eccb4';
    dropArea.style.borderStyle  = 'dashed';
    
  
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.style.border ='3px solid rgba(209, 209, 209, 0.607)';
    dropArea.style.borderStyle  = 'dashed';
   
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    e.preventDefault();
    console.log('Drop detected');
    const dt = e.dataTransfer;
    const files = dt.files;
    e.stopPropagation();
    
    handleFiles(files);
    dropfile(files);
}


function handleCrossClick(event) {
    console.log('Cross clicked');
    fileInput.disabled = false;
    fileInput.value = ''; 
    
    // Remove the corresponding list item from the DOM
    const listItem = event.target.closest('li');
    listItem.remove();
    
    // Hide the list if there are no files remaining
 
    listSection.style.display = 'none';
    
}
function disable() {
    console.log('disable called!');
    
    listSection.style.display = 'none';
   
    
}

// Adding event listener to the list container and delegating the click event to the SVG elements
listContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('cross') || event.target.tagName === 'path') {
        handleCrossClick(event);
    }
});

function handleFiles(files) {
    listContainer.innerHTML = '';

    dropArea.style.border ='3px solid rgba(209, 209, 209, 0.607)';
    dropArea.style.borderStyle  = 'dashed';
   

    console.log('Handling files');
    
    
    // Iterate through each dropped file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name; // Get the file name
        console.log('Dropped file:', fileName);
        listSection.style.display = 'block' ;  

        // Create HTML structure for the file
        const listItem = document.createElement('li');
        listItem.classList.add('in-prog');
        listItem.innerHTML = `
            <div class="col">
                <img src="images/img_2.png" alt="" style="width:90%;">
            </div>
            <div class="col">
                <div class="file-name">
                    <div class="name">${fileName}</div>
                </div>
                <div class="file-size">${(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <div class="col">
                <svg xmlns="http://www.w3.org/2000/svg" class="cross" height="20" width="20"><path d="m5.979 14.917-.854-.896 4-4.021-4-4.062.854-.896 4.042 4.062 4-4.062.854.896-4 4.062 4 4.021-.854.896-4-4.063Z"/></svg>
              
            </div>
        `;

        // Append the file item to the list container
        listContainer.appendChild(listItem);
    }
    

}

function selectfile(files) {
    fileInput.files = files;
  
}

function dropfile(files) {
    fileInput.files = files;
 
}
$('#input-file').on('change', function(e) {
    var fileInput = e.target;
    
    console.log('File input value:', fileInput.value); // Log the file input value
    
    // Check if any files are selected
    if (fileInput.files.length === 0) {
        // File input is empty (no file selected)
        console.log('No file selected!');
        disable(); // Call the disable function
        // You can perform any actions you need here, such as showing an alert
    }
});

fileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    selectfile(files);
    handleFiles(files);
});



$('#productimport').submit(e => {
    e.preventDefault(); // Prevent default form submission
    
    // Get the file input field
    var fileInput = $('#input-file')[0];

    // Check if any files are selected
    if (fileInput.files.length > 0) {
        // Extract the file extension
        var fileName = fileInput.files[0].name;
        var fileExtension = fileName.split('.').pop().toLowerCase();
        
        // Check if the file extension is one of the typical Excel extensions
        if (fileExtension === 'xls' || fileExtension === 'xlsx' || fileExtension === 'xlsm') {
            // Create FormData object
            var formData = new FormData();
            formData.append('file', fileInput.files[0]); // Append the file to FormData
            
            // Send the FormData to the server using AJAX
            $.ajax({
                url: 'data/import.php', // Replace 'your_php_script.php' with the URL of your PHP script
                type: 'POST',
                data: formData,
                processData: false, // Prevent jQuery from automatically processing the form data
                contentType: false, // Prevent jQuery from automatically setting the content type
                success: function(response) {
                    console.log('File sent successfully!');
                    console.log('Server Response:', response);
                    location.reload();
                    // Handle server response if needed
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    // Handle errors if needed
                }
            });
        } else {
            // Show alert if the file is not an Excel file
            console.error('File is not an Excel file!');
            showAlert('Ir atļauti tikai Excel faili!');
        }
    } else {
        // Show browser error message if no files are selected
        console.error('No file selected!');
        showAlert('Nav atlasīts neviens fails!');
    }
});




function showAlert(message) {
    const alertDiv = $('<div class="alert"></div>');
    alertDiv.text(message);
    $('body').append(alertDiv);
    alertDiv.css({
        fontWeight: 'bold',
        padding: '10px 20px', 
        fontSize: '20px',
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgb(80 80 80)',
        borderRadius: '10px',
        zIndex: '9999',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.56)',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
    });
    $('body').append(alertDiv);

    setTimeout(() => {
        alertDiv.fadeOut('slow', () => {
            alertDiv.remove();
        });
    }, 1100);
}








function fetchPrecugrupas() {
    $.ajax({
        url: 'data/precugrupa.php',
        type: 'GET',
        success: function (response) {
            const precugrupa_info = JSON.parse(response);

            displayPrecugrupas(precugrupa_info);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
        }
    });
}
function displayPrecugrupas(precugrupa_info) {
    var selectBox = document.getElementById('precgroup'); 
    selectBox.innerHTML = '';
    
    // Add default option
    var defaultOption = document.createElement('option');
    defaultOption.value = ''; 
    defaultOption.textContent = '-Visas pr.grupas-'; 
    selectBox.appendChild(defaultOption);

    // Populate options from retrieved data
    precugrupa_info.forEach(function(precugrupa) {
        var option = document.createElement('option');
        option.value = precugrupa.id; 
        option.textContent = precugrupa.nosaukums; 
        selectBox.appendChild(option);
    });
}











function fetchkategorijas() {
    $.ajax({
        url: 'data/kategorija.php',
        type: 'GET',
        success: function (response) {
            const kategorija_info = JSON.parse(response);

            displayKategorijas(kategorija_info);
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
        }
    });
}
function displayKategorijas(kategorija_info) {
    var selectBox = document.getElementById('kateg'); // Assuming 'kateg' is the ID of your select element
    selectBox.innerHTML = ''; // Clear existing options
    
    // Add default option
    var defaultOption = document.createElement('option');
    defaultOption.value = ''; // Set the value of the default option as needed
    defaultOption.textContent = '-Visas kategorijas-'; // Text for the default option
    selectBox.appendChild(defaultOption);

    // Populate options from retrieved data
    kategorija_info.forEach(function(kategorija) {
        var option = document.createElement('option');
        option.value = kategorija.id; // Assuming 'id' is the key for the ID of the category
        option.textContent = kategorija.nosaukums; // Assuming 'nosaukums' is the key for the name of the category
        selectBox.appendChild(option);
    });
}

$(document).on('click', '.close_modal',(e)=>{
    $(".modal").hide()
    $(".modal_export_list").hide()
    edit = false
    $("#dataForma").trigger('reset')
   
  
})



$(document).on('click', '#export_list',(e)=>{
    $(".modal_export_list").css('display' ,'flex')

    $('#artikuls').prop('disabled', false).css({
         'background-color': '#f6f6f6',
        'cursor': 'auto'
     });
 })




 document.getElementById('export_check').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Your export logic
    var tableBody = document.getElementById('prod_info');
    var rows = tableBody.querySelectorAll('tr');
    var customName = document.querySelector('.inp').value.trim();
    var filename = customName ? customName : 'exported_data';
    var data = [];

    var columnNamesRow = ['artikuls', 'nosaukums', 'barbora', 'lats', 'citro', 'rimi', 'alkoutlet']; // Predefined column names
    // Modify the above array with your predefined column names

    data.push(columnNamesRow);

    rows.forEach(function(row) {
        var rowData = [];
        var cells = row.querySelectorAll('td');
        cells.forEach(function(cell, index) {
            // Exclude the first column (ID column)
            if (index !== 0) {
                rowData.push(cell.innerText);
            }
        });
        data.push(rowData);
    });
    

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    var wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});

    var buf = new ArrayBuffer(wbout.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < wbout.length; i++) {
        view[i] = wbout.charCodeAt(i) & 0xFF;
    }

    var blob = new Blob([buf], {type: 'application/octet-stream'});

    saveAs(blob, filename + '.xlsx');
    event.target.submit();
});