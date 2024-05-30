$(document).ready(function(){
    // Uncomment to check if jQuery is loaded and function is executed
    // console.log("jQuery is ready");

    let edit = false;
   
    fetchkategorijas();
    fetchPrecugrupas();


    let pageSwitchEnabled = true; 


    let currentPage = 1;
    const batchSize = 30; // Change this value as needed
    fetchpreces(currentPage);
    getTotalPagesAndUpdateMaxInput();

 
    



    $(document).on('click', '#Reset_price_selection', function() {
        $('#pagination').show();
        fetchpreces(currentPage);
        $('#artikuls').val('');     
        pageSwitchEnabled=true;   
    });
    

    function fetchpreces(page) {
    
        $.ajax({
            url: 'data/preces-info.php',
            type: 'GET',
            data: { 
                page: page,
                batch_size: batchSize,
                
            },           
            success: function(response) {
                const preces_info = JSON.parse(response);
                displayPreces(preces_info);
             
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }



    $('#prevPage').click(function() {
        if (currentPage > 1) {
            currentPage--; 
            fetchpreces(currentPage); 
            updatePageNumber(); 
        }
    });

    
    $('#nextPage').click(function() {
        var totalPages = parseInt($('#totalPages').text()); 
        if (currentPage < totalPages) { 
            currentPage++; 
            fetchpreces(currentPage); 
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
            fetchpreces(currentPage); 
        } else {
            
            $(this).val(currentPage);
        }
    });
    
    function getTotalPagesAndUpdateMaxInput() {
        $.ajax({
            url: 'data/get-total-pages_2.php',
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






    $('#Price_selection').click(function() {
        const enteredArtikulsRaw = $('#artikuls').val().trim();
        const enteredArtikuls = enteredArtikulsRaw ? enteredArtikulsRaw.split(/\s+/) : 0; 
        console.log("Entered artikuls:", enteredArtikuls);
        
        const enteredKategorija = $('#kateg').val();
        console.log("Entered Kategorija:", enteredKategorija);

        const enteredPrecugrupa = $('#precgroup').val();
        console.log("Entered Precugrupa:", enteredPrecugrupa);
        if (enteredArtikuls !== null || enteredKategorija || enteredPrecugrupa) {
            
            pageSwitchEnabled=false;   
            $('#pagination').hide();
            
        $.ajax({
            url: 'data/preces-filter.php',
            type: 'GET',
            success: function (response) {
                const preces_info = JSON.parse(response);
         
                console.log("All artikuls in preces_info:", preces_info.map(preces => preces.artikuls));
                console.log("All kategorijas in preces_info:", preces_info.map(preces => preces.kateg_id));
                console.log("All precugrupas in preces_info:", preces_info.map(preces => preces.grupas_id));

                let filteredPreces = preces_info;

                // Filter by kategorija first
                let filteredPrecesAndKategorijaAndPrecugrupa = filteredPreces;
                if (enteredKategorija !== '') {
                    filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => preces.kateg_id === enteredKategorija);
                }

                // If kategorija is selected or if no kategorija is selected but precugrupa is, then filter by precugrupa
                if (enteredKategorija !== '' || enteredPrecugrupa !== '') {
                    if (enteredPrecugrupa !== '') {
                        filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => preces.grupas_id === enteredPrecugrupa);
                    }
                }

                // Filter by artikuls within the filtered category and precugrupa
                let filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls = filteredPrecesAndKategorijaAndPrecugrupa;
                if (enteredArtikuls.length > 0) {
                    filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => enteredArtikuls.includes(preces.artikuls));
                }
                console.log('filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls',filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls);
                displayPreces(filteredPrecesAndKategorijaAndPrecugrupaAndArtikuls);
                
                $('#artikuls').val('');
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
        }else{
        
        $('#pagination').show();
        fetchpreces();   
        
        }
    });

    function displayPreces(preces_info) {
        let template = '';
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoString = sevenDaysAgo.toISOString().slice(0, 10);
        //console.log("Today's Date:", today); 
        
        preces_info.forEach(preces_info => {
            //console.log("preces_info", preces_info); 
            const isPriceStable_barbora = preces_info.date_barbora_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_barbora));
            const isPriceStable_lats = preces_info.date_lats_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_lats));
            const isPriceStable_citro = preces_info.date_citro_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_citro));
            //console.log("Date from Server: cena citro", preces_info.citro_akcija);
            const isPriceStable_rimi = preces_info.date_rimi_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_rimi));
            const isPriceStable_alkoutlet = preces_info.date_alkoutlet_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_alkoutlet));
            //console.log("Date from Server: barbora_string7", sevenDaysAgoString);
            //console.log("Date from Server: barbora_date7", preces_info.date_lats_7);
            //console.log("Date from Server: barbora", preces_info.date_lats);
    
            template += `
                <tr>
                    <td class="top">${preces_info.artikuls}</td>
                    <td class="top">${preces_info.nosaukums}</td>
                    <td class="top" style="text-align:center;">${preces_info.cena}</td>



                    <td class="hoverable-number" style="${isPriceStable_barbora ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_barbora">
                            <a href="#">
                                <span class="product-data hoverable-pointer" >
                                    <span class="cena">${preces_info.cena_barbora}</span>  
                                    <span class="akcija" style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.barbora_akcija}</span> 
                                </span>
                            </a>
                        <p class="time" style="display: ${preces_info.cena_barbora && preces_info.date_barbora !== today ? 'inline' : 'none'}; ${preces_info.barbora_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.barbora_akcija ? 'inline' : 'none'};">%</p><p class="date7" >${preces_info.date_barbora_7}</p><p class="date" >${preces_info.date_barbora}</p>
                    </td>



                    <td class="hoverable-number" style="${isPriceStable_lats ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_lats">
                            <a href="#">
                                <span class="product-data hoverable-pointer"> 
                                    <span class="cena">${preces_info.cena_lats}</span>  
                                    <span class="akcija" style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.lats_akcija}</span> 
                                </span>
                            </a>
                        <p class="time" style="display: ${preces_info.cena_lats && preces_info.date_lats !== today ? 'inline' : 'none'}; ${preces_info.lats_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.lats_akcija ? 'inline' : 'none'};">%</p><p class="date7" >${preces_info.date_lats_7}</p><p class="date" >${preces_info.date_lats}</p>
                    </td>



                    <td class="hoverable-number" style="${isPriceStable_citro ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_citro">
                            <a href="#">
                                <span class="product-data hoverable-pointer" >
                                    <span class="cena">${preces_info.cena_citro}</span> 
                                    <span class="akcija" style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.citro_akcija}</span> 
                                </span>
                            </a>
                        <p class="time" style="display: ${preces_info.cena_citro && preces_info.date_citro !== today ? 'inline' : 'none'}; ${preces_info.citro_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.citro_akcija ? 'inline' : 'none'};">%</p><p class="date7" >${preces_info.date_citro_7}</p><p class="date" >${preces_info.date_citro}</p>
                    </td>



                    <td class="hoverable-number" style="${isPriceStable_rimi ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_rimi">
                            <a href="#">
                                <span class="product-data hoverable-pointer" >
                                    <span class="cena">${preces_info.cena_rimi}</span> 
                                    <span class="akcija" style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.rimi_akcija}</span> 
                                </span>
                            </a>
                        <p class="time" style="display: ${preces_info.cena_rimi && preces_info.date_rimi !== today ? 'inline' : 'none'}; ${preces_info.rimi_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.rimi_akcija ? 'inline' : 'none'};">%</p><p class="date7" >${preces_info.date_rimi_7}</p><p class="date" >${preces_info.date_rimi}</p>
                    </td>



                    <td class="hoverable-number" style="${isPriceStable_alkoutlet ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_alkoutlet">
                            <a href="#">
                                <span class="product-data hoverable-pointer" >
                                    <span class="cena">${preces_info.cena_alkoutlet}</span>
                                    <span class="akcija" style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.alkoutlet_akcija}</span>
                                </span>
                            </a>
                        <p class="time" style="display: ${preces_info.cena_alkoutlet && preces_info.date_alkoutlet !== today ? 'inline' : 'none'}; ${preces_info.alkoutlet_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.alkoutlet_akcija ? 'inline' : 'none'};">%</p><p class="date7" >${preces_info.date_alkoutlet_7}</p><p class="date" >${preces_info.date_alkoutlet}</p>
                    </td>
                </tr>
            `;
        });
        $('#preces_info').html(template);
      
    }
    
    

    
   
    
    $(document).on('click', '.close_modal',(e)=>{
        $(".modal").hide()
        $(".modal_export").hide()
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
                case 'cena_citro':
                    $('#data_WEB').val("citro_history");
                    $('#data_WEB_2').val("citro");
                    break;
                case 'cena_rimi':
                    $('#data_WEB').val("rimi_history");
                    $('#data_WEB_2').val("rimi");
                    break;
                case 'cena_alkoutlet':
                    $('#data_WEB').val("alkoutlet_history");
                    $('#data_WEB_2').val("alkoutlet");
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
        google.charts.load('current', { 'packages': ['corechart', 'controls'] });
    
        // Set a callback to run when the Google Visualization API is loaded.
        google.charts.setOnLoadCallback(fetchData);
        console.log('drawChart');
        function fetchData() {
            // Make AJAX request to history-info.php
            console.log('fetchData');
            $.ajax({
                url: 'data/history-info.php',
                type: 'GET',
                data: { dataID: dataID, dataWEB: dataWEB, dataWEB_2: dataWEB_2 },
                success: function (data,) {
                    console.log('Data received from history-info.php:', data); // Log the received data
               
                    // Parse the received JSON data
                    var jsonData = JSON.parse(data);
                    
                    var data = jsonData.data;

                    var dataInfo = jsonData.data_info;
                
                    // Sort data by date
                    data.sort(function(a, b) {
                        return new Date(a[0]) - new Date(b[0]);
                    });
                
                    // Create the DataTable
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn('datetime', 'DateTime');
                    dataTable.addColumn('number', '');
                    dataTable.addColumn('number', 'Akcija');
                    
                    data.filter(entry => entry.length === 3 )
                    .forEach(function(entry) {
                        var datetime = new Date(entry[0]); 
                        var price = entry[1]; 
                        var akcija = entry[2]; 

                  
                        if (akcija !== 0) {
                            // Add the row to the DataTable with separate columns for Price and Akcija
                            dataTable.addRow([datetime, price, akcija]);
                        } else {
                            // Add the row to the DataTable with a placeholder value for Akcija
                            dataTable.addRow([datetime, price, null]); // You can use any placeholder value here
                        }
                    });
                    var view = new google.visualization.DataView(dataTable);

                    view.setColumns([0, 1, {
                        calc: function(dataTable, row) {             
                            var akcija = dataTable.getValue(row, 2);
      
                            return akcija === null ? null : 'point { size: 5; fill-color: rgb(255, 213, 0); }';
                        },
                        type: 'string',
                        role: 'style'
                    }, {
                        calc: function(dataTable, row) {
                            var akcija_2, akcija;
                            akcija = dataTable.getValue(row, 2);
                            akcija_2 = akcija;
                            return akcija_2; // Return the value of "akcija_2"
                        },
                        type: 'number',
                        role: 'style'
                    }]);



            
                    var formatter = new google.visualization.PatternFormat('Cena: {1}, Pilnā cena: {2}');
                   
                    formatter.format(dataTable, [1, 1, 2]);
                 
                  

                    var firstNestedArray = dataInfo[0];
                    console.log('firstNestedArray:', firstNestedArray);
  
              
                    var number = firstNestedArray[1]; 
                    var url = firstNestedArray[2]; 
                    var name = firstNestedArray[0];
                    var date = firstNestedArray[3];
                    var price = firstNestedArray[4];
                    if (price !== 0) {
                        document.getElementById('priceContainer').textContent = price;
                    }else{
                        document.getElementById('priceContainer').textContent = ""; 
                    }


                    if (date !== 0) {
                        document.getElementById('dateContainer').textContent = date;
                    }else{
                        document.getElementById('dateContainer').textContent = ""; 
                    }
                  
                  
                    if (number !== 0) {
                        document.getElementById('akcijaContainer').textContent = number;
                        var akcijaContainerDiv = document.getElementById('akcijaContainer').parentNode;
                        if (akcijaContainerDiv) {
                            akcijaContainerDiv.style.display = 'flex';
                        }
                    }else{
                        document.getElementById('akcijaContainer').textContent = ""; 
                        var akcijaContainerDiv = document.getElementById('akcijaContainer').parentNode;
                        if (akcijaContainerDiv) {
                            akcijaContainerDiv.style.display = 'none'; 
                        }
                    }
                   
                    var urlContainer = document.getElementById('urlContainer');
                    urlContainer.innerHTML = '<a href="' + url + '" target="_blank">' + url + '</a>';

                    document.getElementById('productFormHeading').textContent = name; 
                                        
                 
                            
                    // Set chart options
                    var options = {
                     
                     
                        legend: { position: 'top' },
                        series: {
                            0: { // 'DateTime' series
                                // Customize options for the 'DateTime' series
                                visibleInLegend: false // Do not show in the legend
                            },
                            1: { // 'Cena' series
                                // Customize options for the 'Cena' series
                                visibleInLegend: true // Show in the legend
                            }                 
                        },
                        chartArea: { width: '80%' },
                        hAxis: {
                            // Initially, set format to show year
                            format: 'dd MMM',
                            slantedText: true,
                            slantedTextAngle: 90,
                            minorGridlines: {
                                count: 0
                            }
                        },
                        vAxis: {
                            title: 'Cena',
                            format: '#,##0.00 €'
                        },
                      
                        series: {
                            0: {
                                pointsVisible: true,
                                pointSize: 6,
                                pointShape: 'circle',
                                lineWidth: 2
                                
                            }
                        
                        }
                        
                    };

                    try {
                        var numRows = dataTable.getNumberOfRows();
                        console.log('Number of rows in the DataTable:', numRows);
                        // Calculate the date range of the available data
                        var minDate = dataTable.getValue(0, 0); // Assuming the first column contains dates
                        var maxDate = dataTable.getValue(dataTable.getNumberOfRows() - 1, 0);
                        var dataRange = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24); // Difference in days
                    } catch (error) {
                        console.error('An error occurred while calculating date range:', error);
                    }
                    
                   


                try {
                    // Determine the format for hAxis based on the data range
                    var hAxisFormat;
                    var ticksInterval; // Interval between ticks on the horizontal axis
                    if (dataRange > 365) {
                        // If the data range is greater than a year, show only the year
                        hAxisFormat = 'yyyy';
                        ticksInterval = 220; // Display ticks every year
                    } else if (dataRange > 30) {
                        // If the data range is greater than a month, show month and year
                        hAxisFormat = 'MMM yyyy';
                        ticksInterval = 30; // Display ticks every month
                    } else {
                        // If the data range is less than a month, show day, month, and year
                        hAxisFormat = 'dd MMM ';
                        ticksInterval = 1; // Display ticks every day
                    }
                } catch (error) {
                    console.error('An error occurred while determining hAxis format:', error);
                }
                
                try {
                    // Create a ControlWrapper for the ChartRangeFilter
                    var control = new google.visualization.ControlWrapper({
                        controlType: 'ChartRangeFilter',
                        containerId: 'control_div',
                        options: {
                            filterColumnIndex: 0,
                            ui: {
                                chartType: 'LineChart',
                                chartOptions: {
                                    chartArea: { width: '80%' },
                                    hAxis: { format: hAxisFormat, ticks: calculateTicks(minDate, maxDate, ticksInterval) }, // Set the hAxis format and ticks
                                },
                                chartView: {
                                    columns: [0, 1]
                                },
                            }
                        }
                    });
                } catch (error) {
                    console.error('An error occurred while creating ControlWrapper:', error);
                }
                    

                    

                   

                
                    function calculateTicks(minDate, maxDate, interval) {
                        var ticks = [];
                        for (var d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + interval)) {
                            ticks.push(new Date(d));
                        }
                        return ticks;
                    }
                   
                    
                    var seriesVisibility = [true, true];
                
                    // Create a ChartWrapper for the LineChart
                    var chart = new google.visualization.ChartWrapper({
                      chartType: 'LineChart',
                      containerId: 'chart_div',
                      options: options,
                      dataTable: dataTable
                    });
                    
                    google.visualization.events.addListener(chart, 'select', function () {
                        var selectedItem = chart.getChart().getSelection()[0];
                    
                        if (selectedItem !== undefined) {
                            var selectedSeries = selectedItem.column;
                            
                            if (selectedSeries === null) {
                                // No series selected, return
                                return;
                            }
                    
                            if (selectedItem.row === null) {
                                // Toggle the visibility of the selected series
                                var seriesIndex = selectedSeries - 1; // Adjust index to match series data
                                var seriesHidden = chart.getOptions().series[seriesIndex].visible;
                                chart.getOptions().series[seriesIndex].visible = !seriesHidden;
                                chart.draw();
                              
                            }
                        }
                    });
                 
                    google.visualization.events.addListener(control, 'statechange', function () {
                        // Get current state of the control
                        var state = control.getState();
                        
                        // Adjust hAxis format based on selected range
                        var selectedRange = state.range;
                        var diffDays = (selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 3600 * 24);
                        if (diffDays > 365) {
                            // If the selected range is greater than a year, show only the year
                            chart.setOption('hAxis.format', 'yyyy');
                        } else if (diffDays > 30) {
                            // If the selected range is greater than a month, show month and year
                            chart.setOption('hAxis.format', 'MMM yyyy');
                        } else {
                            // If the selected range is less than a month, show day, month, and year
                            chart.setOption('hAxis.format', 'dd MMM');
                        }
                        
                     
                    });
                  
                   
                    var exportCounter = 0;
     

              
        
                                      
                    document.getElementById('export_history').onclick = exportFunction;

                    function exportFunction(event) {
                        // Remove the event listener from the export button to ensure it can only be triggered once
                        

                        event.stopPropagation();
                        event.cancelBubble = true;
                        
                        console.log('test');
                        exportCounter++;


                   
                        // Get the DataTable from the chart
                        var dataTable = chart.getDataTable();
                        console.log('Export function executed ' + exportCounter + ' times');
                        
                        console.log('dataTable',dataTable);

                        // Get the number of rows and columns in the DataTable
                        var numRows = dataTable.getNumberOfRows();
                        var numCols = dataTable.getNumberOfColumns();
                    
                        // Extract the content of the element with ID "productFormHeading"
                        var productFormHeading = document.getElementById('productFormHeading').textContent;
                    
                        // Create an array to store the exported data
                        var exportedData = [];
                    
                        // Loop through each row in the DataTable
                        for (var row = 0; row < numRows; row++) {
                            var isVisible = false;
                    
                            // Loop through each series to check if any series has a non-null value at this row
                            for (var col = 1; col < numCols; col++) { // Skip the first column (DateTime)
                                if (dataTable.getValue(row, col) !== null) {
                                    isVisible = true;
                                    break;
                                }
                            }
                    
                            // If at least one series has a non-null value at this row, consider it as visible
                            if (isVisible) {
                                var rowData = [];
                    
                                // Extract the data from the DataTable for this row
                                for (var j = 0; j < numCols; j++) {
                                    if (j !== 2) { // Exclude the akcija column
                                        rowData.push(dataTable.getValue(row, j));
                                    }
                                }
                    
                                // Push the rowData to exportedData
                                exportedData.push(rowData);
                                
                            }
                        }
                    
                        // Log the exported data to the console
                        console.log('Exported data:', exportedData);
                    
                        // Convert numeric values to strings with periods as decimal separators
                        exportedData = exportedData.map(function(row) {
                            return row.map(function(cell) {
                                return typeof cell === 'number' ? cell.toString().replace(',', '.') : cell;
                            });
                        });
                    
                        // Insert the column headers
                        exportedData.unshift(['datums', 'cena', 'pilnā cena']);
                    
                        // Create a new workbook
                        var wb = XLSX.utils.book_new();
                    
                        // Convert the exported data to a worksheet
                        var ws = XLSX.utils.aoa_to_sheet(exportedData);
                    
                        // Append the worksheet to the workbook
                        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    
                        // Write the workbook to binary format
                        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
                    
                        // Convert the binary string to a buffer
                        var buf = new ArrayBuffer(wbout.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i < wbout.length; i++) {
                            view[i] = wbout.charCodeAt(i) & 0xFF;
                        }
                    
                        // Create a Blob object from the buffer
                        var blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    
                        // Create a download link
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = productFormHeading + '.xlsx'; // Use the productFormHeading as the default file name
                        link.click();
                        exportedData = [];
                        
                        
                    };
                    
                                        


                    





                    // Draw the dashboard
                    var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
                    dashboard.bind(control, chart);
                    dashboard.draw(view,dataTable, options);
                    

                    
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching data:', error);
                }
            });
        }
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
   
   





    $(document).on('click', '#export',(e)=>{
       $(".modal_export").css('display' ,'flex')
  
       $('#artikuls').prop('disabled', false).css({
            'background-color': '#f6f6f6',
           'cursor': 'auto'
        });
    })
  


    document.getElementById('export_check').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
    
        // Your export logic
        var tableBody = document.getElementById('preces_info');
        var rows = tableBody.querySelectorAll('tr');
        var customName = document.querySelector('.inp').value.trim();
        var filename = customName ? customName : 'exported_data';
        var data = [];
    
       
        var columnIndexes = [];
        var columnNamesRow = [];
        document.querySelectorAll('.column input[type="checkbox"]:not(.main input[type="checkbox"])').forEach(function(checkbox, index) {
            if (checkbox && checkbox.checked) {
                columnIndexes.push(index);
                columnNamesRow.push(checkbox.getAttribute('id'));
            }
        });
        data.push(columnNamesRow);

        rows.forEach(function(row) {
            var rowData = [];
            row.querySelectorAll('td.top,span.cena,span.akcija,p.date,p.date7').forEach(function(cell, cellIndex) {
                // Check if the column index corresponds to a selected column
                if (columnIndexes.includes(cellIndex)) {
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









});













