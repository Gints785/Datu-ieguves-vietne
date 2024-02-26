$(document).ready(function(){
    //console.log("jQurey strāda!")
    let edit = false;

    fetchProducts()
   
    $(document).on('click', '#Reset_price_selection', function() {
      
        fetchProducts();
    });
    let enteredArtikuls = [];
   
    
   

   $('#productForma').submit(e => {
    e.preventDefault();
    console.log("Entered artikuls2:", enteredArtikuls);
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
        $.post('check.php', postData, (response) => {
            console.log('Response from check.php:', response); 

            if (response === 'eksiste') {
                alert('Šāda prece jau eksistē!');
            } else if (response === 'neeksiste') {
                alert('Šāds artikuls neeksistē!');
            } else if (response === 'success') {
           
                const url = edit === false ? 'product-add.php' : 'product-edit.php';
                $.post(url, postData, (response) => {
                    $("#productForma").trigger('reset');
                    fetchProducts(enteredArtikuls);
                    $(".modal").hide();
                    edit = false;
                    showAlert('Veiksmīgi pievienots!');
                });
            } else {
         
                alert('An error occurred while checking artikuls!');
            }
        });
    } else {
     
    
       
        const url = edit === false ? 'product-add.php' : 'product-edit.php';
        $.post(url, postData, (response) => {
            $("#productForma").trigger('reset');
           
            fetchProducts(enteredArtikuls)
            $(".modal").hide();
            edit = false;
        
        });
    }
});
    
    function showAlert(message) {
        const alertDiv = $('<div class="alert"></div>');
        alertDiv.text(message);
        $('body').append(alertDiv);
        alertDiv.css({
            fontWeight: 'bold',
            padding: '10px 20px', 
            fontSize: '15px',
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgb(80 80 80)',
            borderRadius: '10px',
            zIndex: '9999',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            background: 'rgba(255, 255, 255, 0.16)',
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

    
    $(document).on('click', '.product-item',(e)=>{
       
       
        $(".modal").css('display' ,'flex')
        const element = $(this)[0].activeElement.parentElement.parentElement
        console.log(element)
        const id = $(element).attr('productID')
      
        $.post('product-single.php',{id},(response) => {
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
            $('h2').text(modalTitle);
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


    function fetchProducts(enteredArtikuls = []) {
        $.ajax({
            url: 'product-info.php',
            type: 'GET',
            success: function(response) {
                const preces_info = JSON.parse(response);
                const filteredPreces = filterPrecesByArtikuls(preces_info, enteredArtikuls);
                displayProducts(filteredPreces);
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }
    
    $('#Price_selection').click(function() {
        enteredArtikuls = $('#dataArtikuls').val().trim().split(/\s+/);
        console.log("Entered artikuls:", enteredArtikuls);
    
        if ($('#dataArtikuls').val().trim() === '') {
            return;
        }
        
        fetchProducts(enteredArtikuls);
        
        $('#dataArtikuls').val('');
    });
    
    function filterPrecesByArtikuls(preces_info, enteredArtikuls) {
        if (enteredArtikuls.length === 0) {
            return preces_info;
        }
        return preces_info.filter(preces => enteredArtikuls.includes(preces.artikuls));
    }
    
    function displayProducts(preces_info) {
        let template = '';
        preces_info.forEach(preces_info => {
    
            template += `
                <tr productID="${preces_info.id}">
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
        $('#artikuls').prop('disabled', false).css({
            'background-color': '#f6f6f6',
            'cursor': 'auto'
        });
    })
    
    
    
    $(document).on('click', '.close_modal',(e)=>{
        $(".modal").hide()
        edit = false
        $('#artikuls').prop('disabled', false).css({
            'background-color': '#f6f6f6',
            'cursor': 'auto'
        });
        $("#productForma").trigger('reset')
        const modalTitle = 'Pievienot produktu';
        $('h2').text(modalTitle);
    })
    
 

    
    
    
   
   
    
    
    
    
    
    })