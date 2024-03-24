$(document).ready(function(){
    // Uncomment to check if jQuery is loaded and function is executed
    // console.log("jQuery is ready");

    let edit = false;
    fetchpreces();


 
    



    $(document).on('click', '#Reset_price_selection', function() {
    
        fetchpreces();
        $('#artikuls').val('');
    });
    




    function fetchpreces() {
        $.ajax({
            url: 'data/preces-info.php',
            type: 'GET',
            success: function (response) {
                const preces_info = JSON.parse(response);
                displayPreces(preces_info);
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }

    $('#Price_selection').click(function() {
        const enteredArtikuls = $('#artikuls').val().trim().split(/\s+/); 
        console.log("Entered artikuls:", enteredArtikuls);
        
        
        if ($('#artikuls').val().trim() === '') {
            return; 
        }
        
        $.ajax({
            url: 'data/preces-info.php',
            type: 'GET',
            success: function (response) {
                const preces_info = JSON.parse(response);
                console.log("All artikuls in preces_info:", preces_info.map(preces => preces.artikuls)); 
                const filteredPreces = preces_info.filter(preces => enteredArtikuls.includes(preces.artikuls)); 
                console.log("Filtered artikuls:", filteredPreces.map(preces => preces.artikuls)); 
                displayPreces(filteredPreces);
                
                
                $('#artikuls').val('');
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    });

    function displayPreces(preces_info) {
        let template = '';
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoString = sevenDaysAgo.toISOString().slice(0, 10);
        //console.log("Today's Date:", today); 
        
        preces_info.forEach(preces_info => {
            const isPriceStable_barbora = preces_info.date_barbora_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_barbora));
            const isPriceStable_lats = preces_info.date_lats_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_lats));
            //console.log("Date from Server: barbora_string7", sevenDaysAgoString);
            //console.log("Date from Server: barbora_date7", preces_info.date_barbora_7);
            //console.log("Date from Server: barbora", preces_info.date_barbora);
            template += `
                <tr>
                    <td>${preces_info.artikuls}</td>
                    <td>${preces_info.nosaukums}</td>
                    <td style="text-align:center;">${preces_info.cena}</td>
                    <td class="hoverable-number" style="text-align:center; position: relative; ${isPriceStable_barbora ? 'background-color: yellow;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_barbora">
                        <a href="#"><span class="product-data hoverable-pointer" >${preces_info.date_barbora === today ? preces_info.cena_barbora : (preces_info.cena_barbora ? `<span class="underline">${preces_info.cena_barbora}</span>` : '')}</span></a>
                    </td>
                    <td class="hoverable-number" style="text-align:center; position: relative; ${isPriceStable_lats ? 'background-color: yellow;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_lats">
                        <a href="#"><span class="product-data hoverable-pointer">${preces_info.date_lats === today ? preces_info.cena_lats : (preces_info.cena_lats ? `<span class="underline">${preces_info.cena_lats}</span>` : '')}</span></a>
                    </td>
                    <td class="hoverable-number" style="text-align:center; position: relative;">
                        <span class="hoverable-pointer">${preces_info.date_citro === today ? preces_info.cena_citro : (preces_info.cena_citro ? `<span class="underline">${preces_info.cena_citro}</span>` : '')}</span>
                    </td>
                    <td class="hoverable-number" style="text-align:center; position: relative;">
                        <span class="hoverable-pointer">${preces_info.date_rimi === today ? preces_info.cena_rimi : (preces_info.cena_rimi ? `<span class="underline">${preces_info.cena_rimi}</span>` : '')}</span>
                    </td>
                    <td class="hoverable-number" style="text-align:center; position: relative;">
                        <span class="hoverable-pointer">${preces_info.date_alkoutlet === today ? preces_info.cena_alkoutlet : (preces_info.cena_alkoutlet ? `<span class="underline">${preces_info.cena_alkoutlet}</span>` : '')}</span>
                    </td>
                </tr>
            `;
        });
        $('#preces_info').html(template);
      
    }
    
    

    
   
    
    $(document).on('click', '.close_modal',(e)=>{
        $(".modal").hide()
        edit = false
        $("#dataForma").trigger('reset')
       
      
    })
 
   
   

    $(document).on('click', '.product-data',(e)=>{
       
       
        $(".modal").css('display' ,'flex')
        const element = $(this)[0].activeElement.parentElement
        console.log(element)
        const artikuls = $(element).attr('data_ID')
        const dataType = $(element).attr('data-type');
      
        $.post('data/preces-info.php',{artikuls},(response) => {
            
           
            $('#data_ID').val(artikuls)


            switch (dataType) {
                case 'cena_barbora':
                    $('#data_WEB').val("barbora_history");
                    $('#data_WEB_2').val("barbora");
                    break;
                case 'cena_lats':
                    $('#data_WEB').val("lats_history");
                    $('#data_WEB_2').val("lats");
                    break;
                case 'cena_rimi':
                    $('#data_WEB').val("rimi");
                    break;
                // Add more cases as needed for other data types
                default:
                    // Handle unknown data type
                    console.error("Unknown data type:", dataType);
            }
            
            edit = true
            drawChart();
        })
    e.preventDefault()
    })








    function drawChart() {
        var dataID = $('#data_ID').val();
        var dataWEB = $('#data_WEB').val();
        var dataWEB_2 = $('#data_WEB_2').val();
    
        console.log(dataID, dataWEB, dataWEB_2); 
        // Load the Visualization API and the linechart package.
        google.charts.load('current', { 'packages': ['corechart'] });
    
        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(fetchData);
    
        function fetchData() {
            // Make AJAX request to history-info.php
            $.ajax({
                url: 'data/history-info.php',
                type: 'GET',
                data: { dataID: dataID, dataWEB: dataWEB, dataWEB_2: dataWEB_2 },
                success: function (data) {
                    console.log('Data received from history-info.php:', data); // Log the received data
                
                    // Parse the received JSON data
                    var jsonData = JSON.parse(data);
                
                    // Sort data by date
                    jsonData.sort(function(a, b) {
                        return new Date(a[0]) - new Date(b[0]);
                    });
                
                  
                    // Create the DataTable
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn('datetime', 'DateTime');
                    dataTable.addColumn('number', 'Cena');
                
                    // Populate DataTable with the received data
                    jsonData.filter(entry => entry.length === 2 && typeof entry[1] === 'number')
                    .forEach(function(entry) {
                        var datetime = new Date(entry[0]); // Parse timestamp string into a Date object
                        var price = entry[1]; // Get the price value from the first array element
                        dataTable.addRow([datetime, price]);
                    });

                    var secondNestedArray = jsonData[0];
                
                    // Extract elements of the second nested array
                    var number = secondNestedArray[0]; // Get the first element of the array
                    var url = secondNestedArray[1]; // Get the second element of the array

                    // Output both the number and the URL simultaneously
                    if (number !== 0) {
                        document.getElementById('akcijaContainer').textContent = number;
                    }else{
                        document.getElementById('akcijaContainer').textContent = ""; 
                    }
                   
                    var urlContainer = document.getElementById('urlContainer');
                    urlContainer.innerHTML = '<a href="' + url + '" target="_blank">' + url + '</a>';
                                        
                 
                            
                    // Set chart options
                    var options = {
                        curveType: 'function',
                        legend: { position: 'bottom' },
                        hAxis: {
                            format: 'dd.MM.yyyy', // Format the date on the x-axis
                            ticks: [], // Empty array to remove default ticks
                            slantedText: true, // Rotate the labels
                            slantedTextAngle: 90, // Angle of rotation
                            minorGridlines: {
                                count: 0 // Hide minor gridlines
                            }
                        },
                        vAxis: {
                            title: 'Cena', // Label for the y-axis
                            format: '#,##0.00 €' // Format for the y-axis labels
                        },
                        series: {
                            0: { // Series index
                                pointsVisible: true, // Show data points
                                pointSize: 6, // Size of the data points
                                pointShape: 'circle', // Shape of the data points
                                lineWidth: 2 // Width of the line connecting the data points
                            }
                        }
                    };

                    
                    
                
                    // Instantiate and draw the chart
                    var chart = new google.visualization.LineChart(document.getElementById('chartContainer'));
                
                    chart.draw(dataTable, options);
                    

                    
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching data:', error);
                }
            });
        }
    }

























    
    document.getElementById('export').addEventListener('click', function() {
        var tableBody = document.getElementById('preces_info');
        var rows = tableBody.querySelectorAll('tr');
    
        var data = [];
    
       
        var columnNamesRow = [
            "Artikuls",
            "Preces nosaukums",
            "Cena datubāze",
            "Barbora",
            "Lats",
            "Citro",
            "Rimi",
            "Alkoutlet"
        ];
        data.push(columnNamesRow);
    
      
        rows.forEach(function(row) {
            var rowData = [];
            row.querySelectorAll('td').forEach(function(cell) {
                rowData.push(cell.innerText);
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
    
        saveAs(blob, 'exported_data.xlsx');
    });
});
