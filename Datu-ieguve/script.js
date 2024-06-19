$(document).ready(function(){
    // Uncomment to check if jQuery is loaded and function is executed
    // console.log("jQuery is ready");


    let edit = false;
   
    fetchkategorijas();
    fetchPrecugrupas();


    let pageSwitchEnabled = true; 


    let currentPage = 1;
    const batchSize = 30; 
    fetchpreces(currentPage);
    getTotalPagesAndUpdateMaxInput();

 
    function showLoading() {
      
        $('#loading-screen').show();
    }
    
    
    function hideLoading() {
      
        $('#loading-screen').hide();
    }



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
                hideLoading();
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
            data: { batch_size: batchSize }, 
            success: function(response) {
                var totalPages = parseInt(response);
                $('#totalPages').text(totalPages); 
                $('#pageNumInput').attr('max', totalPages); 
             

            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
            }
        });
    }

    $('#Price_selection').click(function() {
        const enteredArtikulsRaw = $('#artikuls').val().trim();
        // Sadala ievadītos artikulus ar atstarpi un noņem priekšējo/beidzošo atstarpi
        const enteredArtikuls = enteredArtikulsRaw ? enteredArtikulsRaw.split(/\s+/) : 0; 
        const enteredKategorija = $('#kateg').val();
        const enteredPrecugrupa = $('#precgroup').val();
        // Pārbauda, vai ir lietots kāds filtrs (artikuls, kategorija vai precugrupa)
        if (enteredArtikuls !== null || enteredKategorija || enteredPrecugrupa) {
            pageSwitchEnabled=false;   
            $('#pagination').hide();
        $.ajax({
            url: 'data/preces-filter.php',
            type: 'GET',
            success: function (response) {
                const preces_info = JSON.parse(response);
                let filteredPrecesAndKategorijaAndPrecugrupa = preces_info;
                console.log(filteredPrecesAndKategorijaAndPrecugrupa);
                // Vispirms filtrēt pēc kategorijas
                if (enteredKategorija !== '') {
                    filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => preces.kateg_id === enteredKategorija);
                }
                // Ja ir atlasīta kategorija vai ja nav atlasīta neviena kategorija, bet ir atlasīta precugrupa, tad filtrē pēc precugrupa
                if (enteredKategorija !== '' || enteredPrecugrupa !== '') {
                    if (enteredPrecugrupa !== '') {
                        filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => preces.grupas_id === enteredPrecugrupa);
                    }
                }
                // Filtrēt pēc artikuliem filtrētajā kategorijā un precugrupa
                if (enteredArtikuls.length > 0) {
                    filteredPrecesAndKategorijaAndPrecugrupa = filteredPrecesAndKategorijaAndPrecugrupa.filter(preces => enteredArtikuls.includes(preces.artikuls));
                }
                //Rādīt filtrētās preces, pamatojoties uz lietotajiem filtriem
                displayPreces(filteredPrecesAndKategorijaAndPrecugrupa);           
                $('#artikuls').val('');
            },
            error: function (status, error) {
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
            const isPriceStable_barbora = preces_info.date_barbora_7 >= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_barbora));
            const isPriceStable_lats = preces_info.date_lats_7 >= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_lats));
            const isPriceStable_citro = preces_info.date_citro_7 >= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_citro));
            //console.log("Date from Server: cena citro", preces_info.citro_akcija);
            const isPriceStable_rimi = preces_info.date_rimi_7 >= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_rimi));
            const isPriceStable_alkoutlet = preces_info.date_alkoutlet_7 >= sevenDaysAgoString && !isNaN(parseFloat(preces_info.cena_alkoutlet));
            //console.log("Date from Server: barbora_string7", sevenDaysAgoString);
            //console.log("Date from Server: barbora_date7", preces_info.date_lats_7);
            //console.log("Date from Server: barbora", preces_info.date_lats);
    
            template += `
                <tr>
                    <td class="top">${preces_info.artikuls}</td>
                    <td class="top">${preces_info.nosaukums}</td>
                    <td class="top" style="text-align:center;">${preces_info.cena}</td>
                    <td class="top" style="text-align:center;">${preces_info.papild_info}</td>


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
        $('#rowCount').html(`Skaits: ${preces_info.length}`);
      
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
         
                default:
              
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
    
        google.charts.load('current', { 'packages': ['corechart', 'controls'] });
    
   
        google.charts.setOnLoadCallback(fetchData);
        console.log('drawChart');
        function fetchData() {
          
            console.log('fetchData');
            $.ajax({
                url: 'data/history-info.php',
                type: 'GET',
                data: { dataID: dataID, dataWEB: dataWEB, dataWEB_2: dataWEB_2 },
                success: function (data,) {
                    console.log('Data received from history-info.php:', data); 
               
                  
                    var jsonData = JSON.parse(data);
                    
                    var data = jsonData.data;

                    var dataInfo = jsonData.data_info;
                
        
                    data.sort(function(a, b) {
                        return new Date(a[0]) - new Date(b[0]);
                    });
                
             
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
                       
                            dataTable.addRow([datetime, price, akcija]);
                        } else {
                     
                            dataTable.addRow([datetime, price, null]); 
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
                            return akcija_2; 
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
                    var shop = firstNestedArray[5];
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
                    document.getElementById('website').textContent = shop; 
                                        
                 
                            
                  
                    var options = {
                     
                     
                        legend: { position: 'top' },
                        series: {
                            0: { 
                                visibleInLegend: false 
                            },
                            1: { 
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
                    
                        var minDate = dataTable.getValue(0, 0); 
                        var maxDate = dataTable.getValue(dataTable.getNumberOfRows() - 1, 0);
                        var dataRange = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24); // Difference in days
                    } catch (error) {
                        console.error('An error occurred while calculating date range:', error);
                    }
                    
                try {
                  
                    var hAxisFormat;
                    var ticksInterval; 
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
                 
                    var control = new google.visualization.ControlWrapper({
                        controlType: 'ChartRangeFilter',
                        containerId: 'control_div',
                        options: {
                            filterColumnIndex: 0,
                            ui: {
                                chartType: 'LineChart',
                                chartOptions: {
                                    chartArea: { width: '80%' },
                                    hAxis: { format: hAxisFormat, ticks: calculateTicks(minDate, maxDate, ticksInterval) }, 
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
                          
                                return;
                            }
                    
                            if (selectedItem.row === null) {
                     
                                var seriesIndex = selectedSeries - 1; 
                                var seriesHidden = chart.getOptions().series[seriesIndex].visible;
                                chart.getOptions().series[seriesIndex].visible = !seriesHidden;
                                chart.draw();
                              
                            }
                        }
                    });
                 
                    google.visualization.events.addListener(control, 'statechange', function () {
            
                        var state = control.getState();
                        
             
                        var selectedRange = state.range;
                        var diffDays = (selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 3600 * 24);
                        if (diffDays > 365) {
                        
                            chart.setOption('hAxis.format', 'yyyy');
                        } else if (diffDays > 30) {
                       year
                            chart.setOption('hAxis.format', 'MMM yyyy');
                        } else {
                       
                            chart.setOption('hAxis.format', 'dd MMM');
                        }
                        
                     
                    });
                  
                   
                    var exportCounter = 0;
                                      
                    document.getElementById('export_history').onclick = exportFunction;

                    function exportFunction(event) {
                   
                        

                        event.stopPropagation();
                        event.cancelBubble = true;
                        
                        console.log('test');
                        exportCounter++;
 
                        var dataTable = chart.getDataTable();
                        console.log('Export function executed ' + exportCounter + ' times');
                        
                        console.log('dataTable',dataTable);

       
                        var numRows = dataTable.getNumberOfRows();
                        var numCols = dataTable.getNumberOfColumns();
                    
              
                        var productFormHeading = document.getElementById('productFormHeading').textContent;
                        var website = document.getElementById('website').textContent;
                        var combinedText = website + " - " + productFormHeading;
                    
       
                        var exportedData = [];

                        
                  
                        for (var row = 0; row < numRows; row++) {
                            var isVisible = false;
                    
          
                            for (var col = 1; col < numCols; col++) { 
                                if (dataTable.getValue(row, col) !== null) {
                                    isVisible = true;
                                    break;
                                }
                            }
                    
                
                            if (isVisible) {
                                var rowData = [];
                    
          
                                for (var j = 0; j < numCols; j++) {
                                    if (j !== 2) { 
                                        rowData.push(dataTable.getValue(row, j));
                                    }
                                }
                    
                       
                                exportedData.push(rowData);
                                
                            }
                        }
       
                        console.log('Exported data:', exportedData);
                    
           
                        exportedData = exportedData.map(function(row) {
                            return row.map(function(cell) {
                                return typeof cell === 'number' ? cell.toString().replace(',', '.') : cell;
                            });
                        });
                    
                        // Insert the column headers
                        exportedData.unshift(['datums', 'cena', 'pilnā cena']);

                        var websiteRow = [website, '', '']; 
                        exportedData.unshift(websiteRow);
                    
               
                        var wb = XLSX.utils.book_new();
              
                        var ws = XLSX.utils.aoa_to_sheet(exportedData);


                        var range = XLSX.utils.decode_range('A1:C1');
                        ws['!merges'] = [{ s: range.s, e: range.e }];

                 
                        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                        
             
                        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
                    
                
                        var buf = new ArrayBuffer(wbout.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i < wbout.length; i++) {
                            view[i] = wbout.charCodeAt(i) & 0xFF;
                        }
                    
          
                        var blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    
                   
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = combinedText + '.xlsx'; 
                        link.click();
                        exportedData = [];        
                    };  
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
        

        var defaultOption = document.createElement('option');
        defaultOption.value = ''; 
        defaultOption.textContent = '-Visas pr.grupas-'; 
        selectBox.appendChild(defaultOption);
    
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
        var selectBox = document.getElementById('kateg'); 
        selectBox.innerHTML = '';
        

        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-Visas kategorijas-'; 
        selectBox.appendChild(defaultOption);
    
     
        kategorija_info.forEach(function(kategorija) {
            var option = document.createElement('option');
            option.value = kategorija.id; 
            option.textContent = kategorija.nosaukums; 
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
        event.preventDefault(); 
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
