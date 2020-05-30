// import{ OAyrEx } from "./dataHandler.js"
// import{ oaRatioDiscYr } from "./dataHandler.js"
// import{ OARatioYr } from "./dataHandler.js"
import{ OASumYr } from "./dataHandler.js"



// console.log("this was imported", OAyrEx)

// 
// console.log("did shit really work also in the second js?", OAyear)

// var dataOAyrEx = OAyrEx
// var dataYrDisc = oaRatioDiscYr
// var dataOARatioyr = OASumYr

// console.log("OAyrEx", OAyrEx)
// console.log("oaRatioDiscYr", oaRatioDiscYr)
console.log("OASumYr", OASumYr)

///// Build a line plot with the yearly OA data /////////////////


// set the dimensions and margins of the graph
var xline = 70 /// this one controls the whole x axis placement of the legend

var margin = {top: 50, right: 200, bottom: 30, left: 60},
    width = 1300 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#linePlot")
  .append("svg")
  //.attr('viewBox', '0 0 1000 700')
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")
     // .attr('preserveAspectRatio','xMinYMin');


var yearparser = function(data){
  return { date: d3.timeParse("%Y")(data.Publication_Year),
   yearNumber: data.Publication_Year,
   valueOA: data.sumOA,
   valueCA: data.sumCA,
   value: data.sumOA }
}


let data = new Array
for(var i in OASumYr){

  var yrd = yearparser(OASumYr[i])
  // console.log(yrd)
  data.push(yrd)

}
console.log(data)


data = data.filter(d => d.yearNumber >= 1997)



  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.valueOA; })])
    .range([ height, 0 ]);
  var yAxis = svg.append("g")
    .call(d3.axisLeft(y));


    

  // maxima & minima


  var valuesOA = new Array
  for(let i in data){

    let val = data[i].valueOA
    valuesOA.push(val)


  }



  // console.log("values1", values)
  var minOA = Math.min.apply(Math, valuesOA);
  var maxOA = Math.max.apply(Math, valuesOA);
  
  


  var valuesCA = new Array
  for(let i in data){

    let val = data[i].valueCA
    valuesCA.push(val)


  }



  // console.log("values1", values)
  var minCA = Math.min.apply(Math, valuesCA);
  var maxCA = Math.max.apply(Math, valuesCA);
  





var colGradient = function(d, max){

  console.log("max in function", max)

  return {date: d.date,
    valueCA: d.valueCA,
    valueOA: d.valueOA,
    colGrCA: d.valueCA / maxCA, 
    colGrOA: d.valueOA / maxOA
}
}








//////////// get the tooltip together ////////////////



var tooltip = d3.select("#linePlot")
.append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "black")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("color", "white")




var mouseover = function(d) {
      tooltip
        .style("opacity", 1)
  }


var mousemove = function(d) {

    tooltip
    .html("Number of Publications: " + d.value + "<br>" + "Year Published: " + d.yearNumber)	
    .style("left", (d3.mouse(this)[0]+30) + "px")
    .style("top", (d3.mouse(this)[1]+120) + "px")

  }

var mouseleave = function(d) {

    tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)

  }



///// Add a scale for the ordinal bubbles //////

var valueTypes = ["valueOA", "valueCA"]

var myColor = d3.scaleOrdinal()
  .domain(valueTypes)
  .range(d3.schemeSet3 );



//// the bubbles //////////







console.log("data", data)

  var dot = svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d.date); } )
        .attr("cy", function (d) { return y(d.valueOA); } )
        .attr("r", function (d) { return Math.log(d.valueOA) * 5; } )
        .attr("stroke", "black")
        .style("fill", function (d) {

         var colGR = colGradient(d, maxOA)
         //console.log("colGR" , colGR)
         var colGrOA = colGR.colGrOA 


          return d3.interpolateBlues(colGrOA)
        }

          // return "#ff9900" }
            )
        .style("opacity", 0.7)
        .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )








  





/// get the OA / CA selection in 



/// the buttons to switch between OA and CA

var allGroup = ["valueOA", "valueCA"]


d3.select("#selectButtonYr")
.selectAll('myOptions')
   .data(allGroup)
.enter()
  .append('option')
.text(function (d) { 
  if(d == "valueOA"){
    d = "Open Access"
    return d
  } else if(d == "valueCA"){
    d = "Closed Access"
    return d
  } 
  //else if(d == "both"){
  //  d = "Both Access Types"
  //  return d
  //}; 
}) // text showed in the menu
.attr("value", function (d) { return d; }) // corresponding value returned by the button







function update(selectedGroup) {

  /// color gradients also for the update
console.log(selectedGroup)
  var colGradient = function(d, max){

    console.log("max in function", max)
  
    return {date: d.date,
      value: d.value,
      colGr: d.value / max 
  }
  }
console.log("data before datafilter: ", data)





// if(selectedGroup == "both"){





   



// console.log("dataFilter: ", dataFilter)




// var dataFilter = new Array
// console.log(valueTypes)
// 
// for(var j in valueTypes){
// 
//   for(i in data){
//   console.log(valueTypes[j])
//  var dtfil = {
//     date: data[i].date,
//     value: data[i][valueTypes[j]],
//     yearNumber: data[i].yearNumber,
//     OAType: valueTypes[j]
//    } 
// 
//    console.log(dtfil)
// 
//    dataFilter.push(dtfil)
// 
//   }
// 
// 
// 
// }
// 
// 
// 
// console.log("THE dataFilter: ", dataFilter)
// 
// var values = new Array
// for(let i in dataFilter){
// 
//  let val = dataFilter[i].value
//  values.push(val)
// 
// 
// }
// 
// // console.log("values1", values)
// 
// 
// var min = Math.min.apply(Math, values);
// var max = Math.max.apply(Math, values);
// 
// 
// 
// y.domain([0, max + 100])
// yAxis.transition().duration(1000).call(d3.axisLeft(y))
// 
// 
// 
// 
// 
// 
// dot
// .data(dataFilter)
// .enter()
// .append("circle")
// .transition()
// .duration(1000)
//   .attr("class", "bubble")
//   .attr("cx", function (d) { return x(d.date); } )
//   .attr("cy", function (d) { return y(d.value); } )
//   .attr("r", function (d) { return Math.log(d.value) * 5; } )
//   .style("fill", function (d) { 
//     console.log(d.OAType)
//     return myColor(d.OAType); } )
//   .on("mouseover", mouseover )
//   .on("mousemove", mousemove )
//   .on("mouseleave", mouseleave )
// 
// dot.exit().remove()

//} else {


  /// for dynamic axes we need two maxima or minima to we can orientate against


    // console.log("selected Group", selectedGroup)

      // Create new data with the selection?



      var dataFilter = data.map(function(d){return {
         date: d.date,
         value:d[selectedGroup],
         yearNumber: d.yearNumber
        } })





        



    // console.log("dataFilter: ", dataFilter)







    var values = new Array
    for(let i in dataFilter){

      let val = dataFilter[i].value
      values.push(val)


    }

    // console.log("values1", values)


    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);



    y.domain([0, max + 100])
    yAxis.transition().duration(1000).call(d3.axisLeft(y))



    


        dot
        .data(dataFilter)
        .transition()
        .duration(1000)
          .attr("cx", function (d) { return x(d.date); } )
          .attr("cy", function (d) { return y(d.value); } )
          .attr("r", function (d) { return Math.log(d.value) * 5; } )
          .attr("stroke", "black")
          .style("fill", function (d) { 

            // console.log("is d defined?", d)
  
           var colGR = colGradient(d, max)
           console.log("colGR" , colGR)
           var colGrOA = colGR.colGr 
  
  
            return d3.interpolateBlues(colGrOA)
          }
  
            // return "#ff9900" }
              )
          .style("opacity", 0.7)
          .on("mouseover", mouseover )
          .on("mousemove", mousemove )
          .on("mouseleave", mouseleave )

    
        }


    //}













  // When the button is changed, run the updateChart function
  d3.select("#selectButtonYr").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    console.log("selectedOption", selectedOption)
    // run the updateChart function with this selected option
    update(selectedOption)
})










////////// Add a legend /////////////////////////////

// Add a scale for bubble size - very useful indeed //////
var z = d3.scaleSqrt()
  .domain([200000, 1310000000])
  .range([ 2, 30]);



    // Add legend: circles

    
    var valuesToShow = [10000000, 100000000, 1000000000]
    var xCircle = xline + 150
    var xLabel = xline 

    // svg
    //   .selectAll("legend")
    //   .data(valuesToShow)
    //   .enter()
    //   .append("circle")
    //     .attr("cx", xCircle)
    //     .attr("cy", function(d){ return height - 100 - z(d) } )
    //     .attr("r", function(d){ return z(d) })
    //     .style("fill", "none")
    //     .attr("stroke", "black")
// 
    // Add legend: segments
   //  svg
   //    .selectAll("legend")
   //    .data(valuesToShow)
   //    .enter()
   //    .append("line")
   //      .attr('x1', function(d){ return xCircle + z(d) } )
   //      .attr('x2', xLabel)
   //      .attr('y1', function(d){ return height - 100 - z(d) } )
   //      .attr('y2', function(d){ return height - 100 - z(d) } )
   //      .attr('stroke', 'black')
   //      .style('stroke-dasharray', ('2,2'))

    // Add legend: labels
   //  svg
   //    .selectAll("legend")
   //    .data(valuesToShow)
   //    .enter()
   //    .append("text")
   //      .attr('x', xLabel)
   //      .attr('y', function(d){ return height - 100 - z(d) } )
   //      .text( function(d){ return d/1000000 } )
   //      .style("font-size", 10)
   //      .attr('alignment-baseline', 'middle')

    // // Legend title
    // svg.append("text")
    //   .attr('x', xCircle)
    //   .attr("y", height - 100 +30)
    //   .text("Number of Publications")
    //   .attr("text-anchor", "middle")


















/////////////// slider to select the time ///////////////
//
//var years = new Array();
//
//for(let i in data){
//
//let yr = data[i].year;
//// console.log(i)
//years.push(yr)
//
//}
//
//// console.log(years)
//
//
//allYears = new Array();
//
//var MIN = console.log(Math.min.apply(Math, years)),
//    MAX = console.log(Math.max.apply(Math, years)) //--> [18,19,20,21,22,23] EXPECTED
//// 
//
//
//// The slider for the interactive doughnut chart
//
// var MIN=Math.min.apply(Math, years),MAX=Math.max.apply(Math, years) //--> [18,19,20,21,22,23] EXPECTED
// 
//   var allYears = Array.from({length:MAX-MIN+1},(v,k)=>k+MIN)
// 
// var dataTime = d3.range(0, allYears.length).map(function(d) {
//   return new Date(Math.min.apply(Math, allYears) + d, 10, 3);
// });
// 
// // console.log(dataTime)
// 
// var sliderTime = d3
//   .sliderBottom()
//   .min(d3.min(dataTime))
//   .max(d3.max(dataTime))
//   .step(1000 * 60 * 60 * 24 * 365)
//   .width(3000)
//   .tickFormat(d3.timeFormat('%Y'))
//   .tickValues(dataTime)
//   .default(new Date(1998, 10, 3))
//   .on('onchange', val => {
//     d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
//   });
// 
// var gTime = d3
//   .select('div#slider-time')
//   .append('svg')
//   .attr('width', 3000)
//   .attr('height', 200)
//   .append('g')
//   .attr('transform', 'translate(30,30)');
// 
// gTime.call(sliderTime);
// 
// d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
// console.log(sliderTime.value())
// 
//