/// dumpster



function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }
  
  // importing le data
  
  
  // callback function in case of errors
  function displayError(xhr, textStatus, errorThrown) {
    console.log(textStatus);
    console.log(errorThrown);
  }
  
  
  
  $.ajax({
    'async': false,
    'global': false,
    'url': "/JoinedP3.json",
    'dataType': "json",
    'success': function(data) {
      p3Dat = data;
    }
  })
  
  console.log("p3Dat = ", p3Dat) // P3 Data successfully imported
  
  
  // let's start visualising this stuff
  
  //// This section will provide a brief overview over the history of science funding
  
  // prepare data: amount by discipline
  
  
  moneyAndDiscipline = new Array();
  discipline = new Array();
  
  
  for(i in p3Dat){
  
    money = p3Dat[i]["Approved_Amount"]
    disci = p3Dat[i]["Discipline_Name"]
  
    Dosh = new Array();
  
    Dosh.Discipline_Name = disci;
    Dosh.Approved_Amount = money;
  
    moneyAndDiscipline.push(Dosh)
  
    discipline.push(disci)
  
  
  }
  
  discipline = discipline.filter( onlyUnique ) // get a unique list of scinece disciplines
  
  
  var moneyByDiscipline = [];
  
  moneyAndDiscipline.reduce(function(res, value) {
    if (!res[value.Discipline_Name]) {
      res[value.Discipline_Name] = { Discipline_Name: value.Discipline_Name, Approved_Amount: 0 };
      moneyByDiscipline.push(res[value.Discipline_Name])
    }
    res[value.Discipline_Name].Approved_Amount += value.Approved_Amount;
    return res;
  }, {});
  
  
  
  console.log("moneyByDisciplines", moneyByDiscipline)
  
  
  
  var disciplines = new Array();
  var moneys = new Array();
  
  
  for(i in moneyByDiscipline){
  
    disc = moneyByDiscipline[i]["Discipline_Name"]
  
    // mon[disc] = moneyByDiscipline[i]["Approved_Amount"]
  
    mon = {[disc]: moneyByDiscipline[i]["Approved_Amount"]};
  
  
    disciplines.push(disc);
    moneys.push(mon)
  
  
    
  }
  
  
  console.log("disciplines", disciplines)
  console.log("moneys:", moneys)
  
  
  // for(i in moneys){
  // 
  //   console.log(moneys[i])
  // 
  // }
  
  
  
  var moneyDat = moneyByDiscipline;
  var moneyVis = moneyDat.reduce(
    (obj, item) => Object.assign(obj, { [item.Discipline_Name]: item.Approved_Amount }), {});
  
  console.log("moneyVis: ", moneyVis)
  





// set the dimensions and margins of the graph
var width = 1000
    height = 1000
    margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin



// trying to add a tooltip



// append the svg object to the div called 'donut'
var svg = d3.select("#donut")
  .append("svg")
    .attr("width", width) // defining width and height of the svg
    .attr("height", height)
  .append("g") // This is the graph area
    .attr("transform", "translate(" + height * 2 / 2 + "," + height / 2 + ")") // will position the graph




// set the color scale
var color = d3.scaleOrdinal()
  .domain(disciplines)
  .range(d3.schemeDark2);






// Compute the position of each group on the pie:
var pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

console.log("data_ready", data_ready)




// The arc generator
var arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)





// Another arc that won't be drawn. Just for labels positioning
var outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)





// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)
  .on("mouseover", function (d) {
    d3.select("#tooltip")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px")
        .style("opacity", 1)
        .select("#value")
        .text(d.data.key);
});








// Add the polylines between chart and labels:
svg
  .selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      var posC = outerArc.centroid(d); // Label position = almost the same as posB
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })








// Add the polylines between chart and labels:
svg
  .selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
    .text( function(d) { return d.data.key } )
    .attr('transform', function(d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })    








// let's make analogous to the donut a bar chart to visualise history better
// goal is to animate the overall approved money over time
// this could include data grouped by discipline but also gender


// science disciplines first







// define the svg canvas dimensions 



var svg = d3.select("#racing").append("svg")
  .attr("width", 1500)
  .attr("height", 1200);

// duration of ticks

var tickDuration = 500;

// how the graph will look like in terms of width, height and number of bars

var top_n = 15;
var height = 1200;
var width = 1500;


const margin = {
  top: 80,
  right: 0,
  bottom: 5,
  left: 0
};

let barPadding = (height-(margin.bottom+margin.top)) / (top_n*5);



// get in some text

// Title
let title = svg.append('text')
.attr('class', 'title')
.attr('y', 24)
.html('45 Years of Science funded by the SNSF');


// Subtitle
let subTitle = svg.append("text")
.attr("class", "subTitle")
.attr("y", 55)
.html("Approximated Yearly Expenses, TCHF");


let caption = svg.append('text')
.attr('class', 'caption')
.attr('x', width)
.attr('y', height-5)
.style('text-anchor', 'end')
.html('Year');


let year = 1976;







ourFile = "dataCompiling/DisciplineAmountsPerYear.json"
testFile = "testData.json"

function dataHistory(data){
  //if (error) throw error;
    
    console.log("Data in Function", data);
    console.log("year taken: ", year)
    
     data.forEach(d => {
      d.value = +d.value,
      d.lastValue = +d.lastValue,
      d.value = isNaN(d.value) ? 0 : d.value,
      d.year = +d.year,
      d.colour = d3.hsl(Math.random()*360,0.75,0.75)
    });

   console.log(data);
  
   let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0, top_n);

    yearSlice.forEach((d,i) => d.rank = i);
  
   console.log('yearSlice: ', yearSlice)

   let x = d3.scaleLinear()
      .domain([0, d3.max(yearSlice, d => d.value)])
      .range([margin.left, width-margin.right-65]);

   let y = d3.scaleLinear()
      .domain([top_n, 0])
      .range([height-margin.bottom, margin.top]);

   let xAxis = d3.axisTop()
      .scale(x)
      .ticks(width > 500 ? 5:2)
      .tickSize(-(height-margin.top-margin.bottom))
      .tickFormat(d => d3.format(',')(d));

   svg.append('g')
     .attr('class', 'axis xAxis')
     .attr('transform', `translate(0, ${margin.top})`)
     .call(xAxis)
     .selectAll('.tick line')
     .classed('origin', d => d == 0);

   svg.selectAll('rect.bar')
      .data(yearSlice, d => d.name)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', x(0)+1)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(d.rank)+5)
      .attr('height', y(1)-y(0)-barPadding)
      .style('fill', d => d.colour);
    
   svg.selectAll('text.label')
      .data(yearSlice, d => d.name)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.value)-8)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
      .style('text-anchor', 'end')
      .html(d => d.name);
    
  svg.selectAll('text.valueLabel')
    .data(yearSlice, d => d.name)
    .enter()
    .append('text')
    .attr('class', 'valueLabel')
    .attr('x', d => x(d.value)+5)
    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
    .text(d => d3.format(',.0f')(d.lastValue));

  let yearText = svg.append('text')
    .attr('class', 'yearText')
    .attr('x', width-margin.right)
    .attr('y', height-25)
    .style('text-anchor', 'end')
    .html(~~year)
    .call(halo, 10);



//// the code I copy pasted



let ticker = d3.interval(e => {

  yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0,top_n);

  yearSlice.forEach((d,i) => d.rank = i);
 
  //console.log('IntervalYear: ', yearSlice);

  x.domain([0, d3.max(yearSlice, d => d.value)]); 
 
  svg.select('.xAxis')
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .call(xAxis);

   let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);

   bars
    .enter()
    .append('rect')
    .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
    .attr('x', x(0)+1)
    .attr( 'width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(top_n+1)+5)
    .attr('height', y(1)-y(0)-barPadding)
    .style('fill', d => d.colour)
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5);
      
   bars
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(d.rank)+5);
        
   bars
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(top_n+1)+5)
      .remove();

   let labels = svg.selectAll('.label')
      .data(yearSlice, d => d.name);
 
   labels
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.value)-8)
    .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
    .style('text-anchor', 'end')
    .html(d => d.name)    
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
         

    labels
      .transition()
      .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
 
   labels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(top_n+1)+5)
        .remove();
     

 
   let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);

   valueLabels
      .enter()
      .append('text')
      .attr('class', 'valueLabel')
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(top_n+1)+5)
      .text(d => d3.format(',.0f')(d.lastValue))
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
        
   valueLabels
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)+5)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .tween("text", function(d) {
           let i = d3.interpolateRound(d.lastValue, d.value);
           return function(t) {
             this.textContent = d3.format(',')(i(t));
          };
        });
  
 
  valueLabels
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(top_n+1)+5)
      .remove();

  yearText.html(~~year);
 
 if(year == 2020) ticker.stop();
 year = d3.format('.1f')((+year) + 0.1);
},tickDuration);


    

   


};
  









// set the dimensions and margins of the graph
let widthdonut = 450
    heightdonut = 450
    margindonut = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
let radius = Math.min(widthdonut, heightdonut) / 2 - margindonut



// append the svg object to the div called 'donut'
let svgdonut = d3.select("#donut")
  .append("svg")
    .attr("width", widthdonut)
    .attr("height", heightdonut)
  .append("g")
    .attr("transform", "translate(" + widthdonut / 2 + "," + heightdonut / 2 + ")");


let datadonut = new Array()


datadonut = {a: OADataSlice.meanopenAccPerc, b: OADataSlice.meanclosAccPerc}



// set the color scale
let color = d3.scaleOrdinal()
  .domain(["a", "b"])
  .range(d3.schemeDark2);

// Compute the position of each group on the pie:
let pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
  let data_ready = pie(d3.entries(datadonut))

// The arc generator
let arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
let outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svgdonut
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

// Add the polylines between chart and labels:
svgdonut
  .selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      var posC = outerArc.centroid(d); // Label position = almost the same as posB
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })

// Add the polylines between chart and labels:
svgdonut
  .selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
    .text( function(d) { console.log(d.data.key) ; return d.data.key } )
    .attr('transform', function(d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })
















if(OADataSlice[0].meanclosAccPerc == 0 && OADataSlice[0].meanopenAccPerc == 0){



  d3.select("#donut").select('svg').remove()

  



} else {


  console.log("Tha Movie is on!!! Tha Movie is on!!!")
// set the dimensions and margins of the graph
let widthdonut = 450
    heightdonut = 450
    margindonut = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
let radius = Math.min(widthdonut, heightdonut) / 2 - margindonut



// append the svg object to the div called 'donut'
let svgdonut = d3.select("#donut")
  .append("svg")
    .attr("width", widthdonut)
    .attr("height", heightdonut)
  .append("g")
    .attr("transform", "translate(" + widthdonut / 2 + "," + heightdonut / 2 + ")");


    let datadonut = new Array()


    datadonut = {a: OADataSlice.meanopenAccPerc, b: OADataSlice.meanclosAccPerc}



// set the color scale
let color = d3.scaleOrdinal()
  .domain(["a", "b"])
  .range(d3.schemeDark2);

// Compute the position of each group on the pie:
let pie = d3.pie()
  .sort(null) // Do not sort group by size
  .value(function(d) {return d.value; })
  let data_ready = pie(d3.entries(datadonut))

// The arc generator
let arc = d3.arc()
  .innerRadius(radius * 0.5)         // This is the size of the donut hole
  .outerRadius(radius * 0.8)

// Another arc that won't be drawn. Just for labels positioning
let outerArc = d3.arc()
  .innerRadius(radius * 0.9)
  .outerRadius(radius * 0.9)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svgdonut
  .selectAll('allSlices')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

// Add the polylines between chart and labels:
svgdonut
  .selectAll('allPolylines')
  .data(data_ready)
  .enter()
  .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      var posC = outerArc.centroid(d); // Label position = almost the same as posB
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })

// Add the polylines between chart and labels:
svgdonut
  .selectAll('allLabels')
  .data(data_ready)
  .enter()
  .append('text')
    .text( function(d) { console.log(d.data.key) ; return d.data.key } )
    .attr('transform', function(d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })





}
















    
// 





  // set the dimensions and margins of the graph



























/// This section is a scrapyard and used only to get snippets

// // Ajax call to get the required data
//     $.ajax({
//     
//        url: endpoint,
//        async: false, 
//        
//       
//        data: {
//           dataType: 'json',
//            type: 'POST',
//            queryLn: 'SPARQL',
//            query: query1 ,
//            limit: 'none',
//            infer: 'true'
//  
//        },
//     
//     
//       success: function(data){
// 
//         stationData = data
// 
//       }, 
//       error: displayError
//        
//     });
// 
// 
// // console.log(stationData)
// 
// 
// 
// 
//        
//       var dat = stationData["childNodes"][0]["childNodes"][1]["childNodes"] // Very messy but well, what can you do if the input is messy as well
//   
//        // console.log('data1 = ', dat);
//   
//   
//         let arr = Array.prototype.slice.call(dat)
//   
//   
//        // console.log(arr)
//   
//         var stations = new Array();
//   // loop, which pseudo parses the data to a usable format
//       for(i in arr){
// 
//          
// 
//         // console.log("empty Array", stations)
//   
//          var sub = arr[i]["childNodes"];
//   
//   
//          let sub2 = Array.from(sub);
//   
//   
//          for(j in sub2){
// 
//           var pieces = sub2[j]["textContent"]
// 
//           if(j == 0){
//              var uri = pieces
//           } else if(j == 1){
//              var coord = pieces
// 
//              coord = coord.replace('POINT(', '')
//              coord = coord.replace(')', '')
//              coord = coord.split(' ')
//              
// 
//           } else if(j == 2){
//              var station = pieces
//           } else if(j == 3){
//              var id = pieces
//           }
//   
//           //console.log(pieces)
//   
//   
//          }
// 
//          var stat = new Array();
//          stat.uri = uri;
//          stat.coord = coord;
//          stat.station = station;
//          stat.id = id;
// 
// 
//         // console.log(stat)
// 
//          stations.push(stat)
// 
//   
//       };
// 
// 
// 
//   /// console.log(stations)
// 
//   // get a leaflet app set up
// 
// 
//   // search for Universität
//   var uni = stations.filter(function (el) {
//     return el.station.includes("niversi")
// 
//   })
// 
//   // get some coordinates
//   uniCoord = uni[0]["coord"]
// 
// 
//   // center the map by longitute and latitude of the Universitaet stop in Bern
//   var stationsMap = L.map('mapid').setView([uniCoord[1], uniCoord[0]], 36);
//   
//   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
//           attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//       }).addTo(stationsMap);
// 
// 
// 
// // now, get a circle for all them fuckers (stops)
// 
// // coordinates
// 
// for(i in stations){
// 
// 
//  var circle = L.circle([stations[i]["coord"][1], stations[i]["coord"][0]], {
//     color: '#005ce6',
//     fillColor: '#66c2ff',
//     fillOpacity: 0.5,
//     radius: 20
//  }).addTo(stationsMap);
// 
//  circle.bindPopup(
//      "<p>" + stations[i]["station"] + "</p>" + "<p id='popupText' style='display:none'>" + stations[i]["id"] + "</p>" 
//      );
// 
// // console.log(stations[i])
// 
// // console.log(stations[i]["coord"][1])
// // console.log(stations[i]["coord"][0])
// 
// }
// 
// // var popup = circle.getPopup();
// 
// 
// 
// 
// // var content = popup.getContent();
// // console.log(content)
// 
// // muy bueno
// 
// 
// 
// // showData() // This was a fucking hassle! // no longer used
// 
// 
// // some more data retrieval
// 
// 
//      $.ajax({
//      
//         url: endpoint,
//         async: false, 
//         
//        
//         data: {
//            dataType: 'json',
//             type: 'POST',
//             queryLn: 'SPARQL',
//             query: query2 ,
//             limit: 'none',
//             infer: 'true'
//   
//         },
//      
//      
//        success: function(data){
// 
//         arrivalData = data
// 
//        }, 
//        error: displayError
//         
//      });
//      
// 
// 
// 
//     // console.log(arrivalData)
//     
//         
//       var datArr = arrivalData["childNodes"][0]["childNodes"][1]["childNodes"];
//      // console.log('data2 = ', dat);
//    
//    
//    
//       let arrArr = Array.prototype.slice.call(datArr)
//    
//    
//        // console.log(arr)
//    
//         var ArrStations = new Array();
//    
//    
//    
//                 for(i in arrArr){
//    
//          
//    
//         // console.log("empty Array", stations)
//    
//          var sub = arrArr[i]["childNodes"];
//    
//    
//          let sub2 = Array.from(sub);
//    
//    
//          for(j in sub2){
//    
//           var pieces = sub2[j]["textContent"]
//    
//           if(j == 0){
//              var arrivalName = pieces
//           } else if(j == 1){
//    
//               var arrivalID = pieces
//    
//    
//           } else if(j == 2){
//              var departureCoord = pieces
//    
//              departureCoord = departureCoord.replace('POINT(', '')
//              departureCoord = departureCoord.replace(')', '')
//              departureCoord = departureCoord.split(' ')
//              
//    
//           } else if(j == 3){
//               var departureName = pieces
//           } 
//    
//           else if(j == 4){
//    
//              var departureID = pieces
//    
//           } else if(j == 5){
//               var arrivalCoord = pieces
//    
//               arrivalCoord = arrivalCoord.replace('POINT(', '')
//               arrivalCoord = arrivalCoord.replace(')', '')
//               arrivalCoord = arrivalCoord.split(' ')
//           }
//    
//           //console.log(pieces)
//    
//    
//          }
//    
//          var stat = new Array();
//          stat.arrivalName = arrivalName;
//          stat.arrivalID = arrivalID;
//          stat.arrivalCoord = arrivalCoord;
//          stat.departureName = departureName;
//          stat.departureID = departureID;
//          stat.departureCoord = departureCoord;
//    
//    
//         // console.log(stat)
//    
//         ArrStations.push(stat)
//    
//    
//       };
//    
//    
//       console.log(ArrStations)
//    
//    
// 
// 
// 
// // showDataArriv() // reproduces the method of the former one
// 
// 
// 
//        
// 
// 
// 
//     function displayError(xhr, textStatus, errorThrown) {
//           console.log(textStatus);
//           console.log(errorThrown);
//       }
//     
//     
// 
// 
//     
//     // Results --> ChildNodes --> Results
// 
// 
//     // console.log(arrivals)
//     
// 
// 
// 
// 
// ////////////////// getting some stuff done with maps ////////////////////////
// 
// 
// 
// 
// 
// 
// function mapCoords(callback){stationsMap.on('popupopen', function (e) {
//     
// 
//    // import {antPath} from 'leaflet-ant-path';
// 
//     var popup = e.popup;
// 
// 
//     var coords = new Array()
// 
//     var cont = popup["_content"];
//     var filterID = cont.match(/[0-9]{5,}/gi);
// 
//     var departure = ArrStations.filter(function (el) {
//         return el.departureID.includes(filterID)
//     
//       })
// 
//     // console.log(departure)
// 
// 
// 
// 
//     for(i in departure){
// 
//         var depID = departure[i]["departureID"];
//         var arrivalCoord = departure[i]["arrivalCoord"];
//         var departureCoord = departure[i]["departureCoord"];
// 
//         crd = [arrivalCoord.reverse(), departureCoord.reverse()]
//         coords.push(crd) 
//     }
// 
// 
//     // const path = antPath(coords, {
//     //     "delay": 400,
//     //     "dashArray": [
//     //       10,
//     //       20
//     //     ],
//     //     "weight": 5,
//     //     "color": "#0000FF",
//     //     "pulseColor": "#FFFFFF",
//     //     "paused": false,
//     //     "reverse": false,
//     //     "hardwareAccelerated": true
//     //   });
// 
//    // console.log(path)
// 
//     var active_polyline = L.featureGroup().addTo(stationsMap);
//     var polyline = L.polyline(coords).addTo(active_polyline);
// 
//     // var polyline = L.polyline.antPath(coords).addTo(active_polyline);
// 
//    // console.log(polyline)
// 
//    // d3.select(polyline).transition().duration(1000)
// 
//     // var markers = [
//     //     {pos: [51.51, -0.10], popup: "This is the popup for marker #1"},
//     //     {pos: [51.50, -0.09], popup: "This is the popup for marker #2"},
//     //     {pos: [51.49, -0.08], popup: "This is the popup for marker #3"}];
// // 
// // 
//     // coords.forEach(function (obj) {
// // 
//     //     var m = L.marker(obj).addTo(stationsMap),
//     //     // var m = L.marker(obj.pos).addTo(mymap),
//     //         p = new L.Popup({ autoClose: false, closeOnClick: false })
//     //                 .setContent(obj.popup)
//     //                 .setLatLng(obj.pos);
// // 
//     //         m.bindPopup(p);
//     //                 
//     //         // stationsMap.bindPopup(p);
//     // });
// 
// 
//   
// 
//     // active_polyline.clearLayers(stationsMap)
// 
//     callback(active_polyline);
// 
// 
// })
// };
// 
// 
// mapCoords(function(result){
// 
// console.log(result)
// blah = result
// console.log(blah)
// 
// stationsMap.on('popupclose', function (){
//     blah.clearLayers(stationsMap);
// })
// 
// 
//     // active_polyline.clearLayers(stationsMap)
// 
// })
// 
// 
// 
// 
// 
// 
// // console.log(active_polyline)
// // stationsMap.on('popupclose', function(){
// // 
// //     active_polyline.clearLayers(stationsMap)
// // 
// // })
// 
// console.log(filterID)
// // create a subset of the 'large' array in order to create networks