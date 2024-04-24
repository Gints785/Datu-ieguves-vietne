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
        console.log("Today's Date:", today); 
        
        preces_info.forEach(preces_info => {
            const isPriceStable_barbora = preces_info.date_barbora_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_barbora));
            const isPriceStable_lats = preces_info.date_lats_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_lats));
            const isPriceStable_citro = preces_info.date_citro_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_citro));
            console.log("Date from Server: cena citro", preces_info.citro_akcija);
            const isPriceStable_rimi = preces_info.date_rimi_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_rimi));
            const isPriceStable_alkoutlet = preces_info.date_alkoutlet_7 <= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_alkoutlet));
            //console.log("Date from Server: barbora_string7", sevenDaysAgoString);
            //console.log("Date from Server: barbora_date7", preces_info.date_lats_7);
            //console.log("Date from Server: barbora", preces_info.date_lats);
    
            template += `
                <tr>
                    <td>${preces_info.artikuls}</td>
                    <td>${preces_info.nosaukums}</td>
                    <td style="text-align:center;">${preces_info.cena}</td>

                    <td class="hoverable-number" style="${isPriceStable_barbora ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_barbora">
                        <a href="#"><span class="product-data hoverable-pointer" >${preces_info.cena_barbora} <span style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.barbora_akcija}</span> </span></a>
                        <p class="time" style="display: ${preces_info.cena_barbora && preces_info.date_barbora !== today ? 'inline' : 'none'}; ${preces_info.barbora_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.barbora_akcija ? 'inline' : 'none'};">%</p>
                    </td>

                    <td class="hoverable-number" style="${isPriceStable_lats ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_lats">
                        <a href="#"><span class="product-data hoverable-pointer" >${preces_info.cena_lats} <span style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.lats_akcija}</span> </span></a>
                        <p class="time" style="display: ${preces_info.cena_lats && preces_info.date_lats !== today ? 'inline' : 'none'}; ${preces_info.lats_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.lats_akcija ? 'inline' : 'none'};">%</p>
                    </td>

                    <td class="hoverable-number" style="${isPriceStable_citro ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_citro">
                        <a href="#"><span class="product-data hoverable-pointer" >${preces_info.cena_citro} <span style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.citro_akcija}</span> </span></a>
                        <p class="time" style="display: ${preces_info.cena_citro && preces_info.date_citro !== today ? 'inline' : 'none'}; ${preces_info.citro_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.citro_akcija ? 'inline' : 'none'};">%</p>
                    </td>

                    <td class="hoverable-number" style="${isPriceStable_rimi ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_rimi">
                        <a href="#"><span class="product-data hoverable-pointer" >${preces_info.cena_rimi} <span style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.rimi_akcija}</span> </span></a>
                        <p class="time" style="display: ${preces_info.cena_rimi && preces_info.date_rimi !== today ? 'inline' : 'none'}; ${preces_info.rimi_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.rimi_akcija ? 'inline' : 'none'};">%</p>
                    </td>


                    <td class="hoverable-number" style="${isPriceStable_alkoutlet ? 'background-color: #ffff23b3;' : ''}" data_ID="${preces_info.artikuls}" data-type="cena_alkoutlet">
                        <a href="#"><span class="product-data hoverable-pointer" >${preces_info.cena_alkoutlet} <span style="text-decoration: line-through; font-weight: 400;  font-size:10px; ">${preces_info.alkoutlet_akcija}</span> </span></a>
                        <p class="time" style="display: ${preces_info.cena_alkoutlet && preces_info.date_alkoutlet !== today ? 'inline' : 'none'}; ${preces_info.alkoutlet_akcija ? '' : 'padding-left: .8rem;'}"><i class="fa-solid fa-clock"></i></p>
                        <p class="akc" style="display: ${preces_info.alkoutlet_akcija ? 'inline' : 'none'};">%</p>
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
    
        function fetchData() {
            // Make AJAX request to history-info.php
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
                    dataTable.addColumn('number', 'Cena');
                
             
                    data.filter(entry => entry.length === 2 && typeof entry[1] === 'number')
                    .forEach(function(entry) {
                        var datetime = new Date(entry[0]); 
                        var price = entry[1]; 
                        dataTable.addRow([datetime, price]);
                    });
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

                
                    // Calculate the date range of the available data
                    var minDate = dataTable.getValue(0, 0); // Assuming the first column contains dates
                    var maxDate = dataTable.getValue(dataTable.getNumberOfRows() - 1, 0);
                    var dataRange = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24); // Difference in days

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




                    





                    // Draw the dashboard
                    var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
                    dashboard.bind(control, chart);
                    dashboard.draw(dataTable, options);

                    
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













