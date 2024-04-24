<!DOCTYPE html>
<html>

<head>
    <title>My Title</title>
    <meta charset="utf-8" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>

</head>
  <script>
// jshint esnext: true
google.charts.load('current', {'packages': ['corechart', 'table']});


var dataValues = [{DateScore: '2018-6-14', A: 1000, B: 900, C: 800, D: 700, E: 600, F: 500, NrS: 400, }, {DateScore: '2018-6-15', A: 1000, B: 900, C: 800, D: 700, E: 600, F: 500, NrS: 400, }, {DateScore: '2018-6-17', A: 1000, B: 900, C: 800, D: 700, E: 600, F: 500, NrS: 400, }, {DateScore: '2018-6-22', A: 800, B: 600, C: 1000, D: 900, E: 300, F: 100, NrS: 600, } ];

var Data = {
    displayed: [...dataValues],
    hidden: Object.keys(dataValues[0]).reduce((a, c) => {
        a[c] = false;
        return a;
    }, {}),
    map: Object.keys(dataValues[0])
};


google.charts.setOnLoadCallback(DrawChartScores);

function DrawChartScores() {

    var data = new google.visualization.DataTable();
    var options = {
        title: 'Scores',
        width: '80%',
        height: '80%',
        explorer: {
            keepInBounds: true,
            actions: ['dragToZoom', 'rightClickToReset']
        },
        series: Data.map.reduce((a, c, i) => {
            a[i] = {};
            return a;
        }, {})
    };

    data.addColumn('date', 'Day');
    data.addColumn('number', 'A');
    data.addColumn('number', 'B');
    data.addColumn('number', 'C');
    data.addColumn('number', 'D');
    data.addColumn('number', 'E');
    data.addColumn('number', 'F');
    data.addColumn('number', 'NrS');

    for (var i = 0; i < dataValues.length; i++) {
        let newRow = Object.values(dataValues[i]);
        newRow[0] = new Date(newRow[0]);
        data.addRow(newRow);
    }

    var chart = new google.visualization.AreaChart(document.getElementById('chartP'));
    var last = {
        column: true,
        row: true
    };


    function showHideSeries() {
        var sel = chart.getSelection();

        if (sel.length === 0 && last.row === null) {
            Data.hidden[Data.map[last.column]] = !Data.hidden[Data.map[last.column]];
        } else if (sel.length && sel[0].row === null) {
            // toggle the current item selected
            Data.hidden[Data.map[sel[0].column]] = !Data.hidden[Data.map[sel[0].column]];
            last = sel[0];
        } else {
            return;
        }

        vparse(data);
        options = vkillLegend(options);
        chart.draw(data, options);

    }

    google.visualization.events.addListener(chart, 'select', showHideSeries);
    chart.draw(data, options);

}

function vparse(data) {
    Data.displayed.reduce((a, c, i) => {
        for (let k in c) {
            if (k === "DateScore") continue;
            if (Data.hidden[k])
                data.setValue(i, Data.map.indexOf(k), null);
            else
                data.setValue(i, Data.map.indexOf(k), c[k]);
        }
        return true;
    }, []);
    return data;
}

function vkillLegend(options) {
    options.series = Object.keys(options.series).reduce((a, c, i) => {
        let current = {};
        if (Data.hidden[Data.map[i]]) current.color = "#CCCCCC";
        else c.color = null;
        a[i - 1] = current;
        return a;
    }, {});
    return options;
}


    

   

      

   
    
  </script>

<body>
    <div id="chartP" style="height:1000px"></div>
</body>
</html>
