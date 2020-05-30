/// Bubble chart //////

import{ PublicationStatusYear } from "./dataHandler.js"

console.log("PublicationStatusYear", PublicationStatusYear)

var data = PublicationStatusYear

data = data.filter(d => d.Publication_Year >= 1997)

console.log(data)

// dims and margins of the plot //////

var xline = 850 /// this one controls the whole x axis placement of the legend

var margin = {top: 40, right: 400, bottom: 60, left: 100},
    width = 1300 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page //////
var svg = d3.select("#bubbleChart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");



//      var svg = d3.select("#bubbleChart")
//      .append("svg")
//      .attr('viewBox', '0 0 1300 800')
//    
//    .append("g")
//      .attr("transform",
//            "translate(" + margin.left + "," + margin.top + ")")
//      // .attr('preserveAspectRatio','xMinYMin');
        



// make the chart relative to the data - get the years

var removeSpecialChars = function(d){

  var str = d.replace(/\s/g, '_')
  str = str.replace(/[;|,|\-|/|(|)|&]/g,  '_')
  //console.log(str)
  return str


 }


 var removeUnderlines = function(d){

  var str = d.replace(/_/g, ' ')

  //console.log(str)
  return str


 }


/// parse the years so they get into the axis in a proper format
var yearparser = function(data){
    return { date: d3.timeParse("%Y")(data.Publication_Year),
     valueOA: data.sumOA,
     valueCA: data.sumCA,
     yearNumber: data.Publication_Year,
     DisciplineHierarchy: data.Discipline_Name_Hierarchy,
     DisciplineHeararchyDOM: removeSpecialChars(data.Discipline_Name_Hierarchy),
     value: data.sumOA  } /// valueOA as value for initiation of the plot - gets later reassigned
  }






let plotData = new Array // pass the years through a loop, because I don't know better
for(var i in data){

  var yrd = yearparser(data[i])
  // console.log(yrd)
  plotData.push(yrd)

}
console.log("Plot Data", plotData)
  
  




// set x axis //////
var x = d3.scaleTime()
.domain(d3.extent(plotData, function(d) { return d.date; }))
.range([ 0, width ]);
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x).ticks(10))



  // Add X axis labels
  svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+50 )
      .text("Publication Year");



// set Y axis //////


// get min and max of the number of publications per access mode


//// for open access //////
let publicationsCA = new Array
let publicationsOA = new Array


for(i in plotData){

    let pbls = plotData[i].value 
    publicationsOA.push(pbls)
}

console.log(publicationsOA)

let maxOA = Math.max.apply(Math, publicationsOA)
let minOA = Math.min.apply(Math, publicationsOA)

// console.log(maxOA)
// console.log(minOA)


/// borders for closed access //////


for(i in plotData){

    let pbls = plotData[i].valueCA 
    publicationsCA.push(pbls)
}


let maxCA = Math.max.apply(Math, publicationsCA)
let minCA = Math.min.apply(Math, publicationsCA)

//////////////////////////


/// set the y axis //////
var y = d3.scaleLinear()
  .domain([minOA, maxOA])
  .range([ height, 0]);
var yAxis = svg.append("g")
      .call(d3.axisLeft(y));



  



/// labels for y axis //////


svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20 )
    .text("Number of Publications")
    .attr("text-anchor", "start")



// Add a scale for bubble size - very useful indeed //////
var z = d3.scaleSqrt()
  .domain([200000, 1310000000])
  .range([ 2, 30]);



//// add the bubble color - for this we need all the discipline hierarchy names //////

let DiscpHierarch = new Array

for(i in plotData){

    let dshr = plotData[i].DisciplineHierarchy
    DiscpHierarch.push(dshr)

}

var disciplines = _.uniq(DiscpHierarch)/// Lodash is beautiful

console.log(disciplines)



let DiscpHierarchDOM = new Array

for(i in plotData){

    let dshr = plotData[i].DisciplineHeararchyDOM
    DiscpHierarchDOM.push(dshr)

}

var disciplinesDOM = _.uniq(DiscpHierarchDOM)/// Lodash is beautiful

///// Add a scale for the bubbles //////
var myColor = d3.scaleOrdinal()
  .domain(disciplinesDOM)
  .range(d3.schemeSet3 );




//////////// get the tooltip together ////////////////



var tooltip = d3.select("#bubbleChart")
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


//// what happens for highlighting things



  // What to do when one group is hovered
  var highlight = function(d){
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    // console.log(d)
    d = removeSpecialChars(d)
    // console.log(d)
    d3.selectAll("."+d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  var noHighlight = function(d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }





console.log("plotData: ", plotData)

//// add the bubbles //////


// Add dots
var dot = svg.append('g')
  .selectAll("dot")
  .data(plotData)
  .enter()
  .append("circle")
    .attr("class", function(d) { return "bubbles " + d.DisciplineHeararchyDOM })
    .attr("cx", function (d) { return x(d.date); } )
    .attr("cy", function (d) { return y(d.value); } )
    .attr("r", function (d) { return Math.log(d.value) * 5; } )
    .style("fill", function (d) { return myColor(d.DisciplineHeararchyDOM); } )
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )




  



/// the buttons to switch between OA and CA

var allGroup = ["valueOA", "valueCA"]


d3.select("#selectButton")
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
  }; 
}) // text showed in the menu
.attr("value", function (d) { return d; }) // corresponding value returned by the button








// var dataFilter = plotData.map(function(d){return {
//   Date : d.date ,
//   value:d.valueOA,
//   DisciplineHierarchy: d.DisciplineHierarchy,
//  } })
// 
// console.log("data filter:", dataFilter)

//// for updating the selected option from the drop down


function update(selectedGroup) {


  /// for dynamic axes we need two maxima or minima to we can orientate against


    // console.log("selected Group", selectedGroup)

      // Create new data with the selection?
      var dataFilter = plotData.map(function(d){return {
         Publication_Year: d.date,
         yearNumber: d.yearNumber,
         value:d[selectedGroup],
         DisciplineHierarchy: d.DisciplineHierarchy,
         DisciplineHeararchyDOM: d.DisciplineHeararchyDOM
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
        .attr("class", function(d) { return "bubbles " + d.DisciplineHeararchyDOM })
        .attr("cx", function (d) { return x(d.Publication_Year); } )
        .attr("cy", function (d) { return y(d.value); } )
        .attr("r", function (d) { return Math.log(d.value) * 5; } )
        .style("fill", function (d) { return myColor(d.DisciplineHeararchyDOM); } )
        .on("mouseover", mouseover )
        .on("mousemove", mousemove )
        .on("mouseleave", mouseleave )
    


    }




  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // console.log(selectedOption)
    // run the updateChart function with this selected option
    update(selectedOption)
})





////////// Add a legend /////////////////////////////





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
   // svg
   //   .selectAll("legend")
   //   .data(valuesToShow)
   //   .enter()
   //   .append("text")
   //     .attr('x', xLabel)
   //     .attr('y', function(d){ return height - 100 - z(d) } )
   //     .text( function(d){ return d/1000000 } )
   //     .style("font-size", 10)
   //     .attr('alignment-baseline', 'middle')

   // // Legend title
   // svg.append("text")
   //   .attr('x', xCircle)
   //   .attr("y", height - 100 +30)
   //   .text("Number of Publications")
   //   .attr("text-anchor", "middle")


      
    // Add one dot in the legend for each name.
    var size = 20


    svg.selectAll("myrect")
      .data(disciplinesDOM)
      .enter()
      .append("circle")
        .attr("cx", xline)
        .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return myColor(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)


    // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(disciplinesDOM)
      .enter()
      .append("text")
        .attr("x", xline + size*.8)
        .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "#00134d")
        .text(function(d){ 
          d = removeUnderlines(d)
          // console.log(d)
          return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)