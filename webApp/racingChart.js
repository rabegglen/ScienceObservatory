
/// Importing the data

import { data } from "./dataHandler.js"



///////////////////////////////////////////////////////////////////////////////




const halo = function(text, strokeWidth) {
text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
  .style('fill', '#ffffff')
   .style( 'stroke','#ffffff')
   .style('stroke-width', strokeWidth)
   .style('stroke-linejoin', 'round')
   .style('opacity', 0.7);
 
}   







/// function to play the animation

d3.select('#replay').on('click', function() {
  // console.log("my Ass hurts")


  d3.select("#racing").select("svg").remove()

  var tickDuration = 800;
  // d3.select("#racing").select("svg").select('g').remove();





  var svg = d3.select("#racing").append("svg")
  .attr("width", 1120)
  .attr("height", 800);




// duration of ticks



// how the graph will look like in terms of width, height and number of bars

var top_n = 15;
var height = 800;
var width = 1120;


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
// .html('See what happened in 45 Years of Science funded by the SNSF');


// Subtitle
let subTitle = svg.append("text")
.attr("class", "subTitle")
.attr("y", 55)
.html("Approximierte Jährliche Ausgaben, TCHF");


let caption = svg.append('text')
.attr('class', 'caption')
.attr('x', width)
.attr('y', height-5)
.style('text-anchor', 'end')
.html('Jahr');


var year = 1976;

// console.log("data is here", data)

const halo = function(text, strokeWidth) {
  text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
    .style('fill', '#ffffff')
     .style( 'stroke','#ffffff')
     .style('stroke-width', strokeWidth)
     .style('stroke-linejoin', 'round')
     .style('opacity', 0.7);
   
  }   







// console.log("did shit really work?", OAyear)



//// this is super clonky, but I found no other way

function dataHistory(data){

  //if (error) throw error;
    
    // console.log("Data in Function", data);
    // console.log("year taken: ", year)
    
     data.forEach(d => {
      d.value = +d.value,
      d.lastValue = +d.lastValue,
      d.value = isNaN(d.value) ? 0 : d.value,
      d.year = +d.year,
      d.colour = d3.interpolatePlasma(Math.random())
    });

   // console.log(data);
  
   
//// get the OA data running


// let OAData = new Array()
// 
// 
// data.forEach(d => {
// 
//   var OAD = new Array()
// 
//   OAD.year = +d.year,
//   OAD.meanopenAccPerc = +d.meanopenAccPerc
//   OAD.meanclosAccPerc = +d.meanclosAccPerc
//   OAD.lastValueopenAcc = +d.lastValueopenAcc
//   OAD.lastValueclosAcc = +d.lastValueclosAcc
//  // console.log(d.name)
//  
//  OAData.push(OAD)
// 
// })
// 
// 
// OAData = _.uniqBy(OAData, 'year')
// console.log('output: ', OAData);



////////////////////////

   
   let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0, top_n);

    yearSlice.forEach((d,i) => d.rank = i);

/////////////////// Get a slice of the OA data

//  let OADataSlice = OAData.filter(d => d.year == year)
//
//  console.log('OADataSlice: ', OADataSlice)
//  
//   console.log('yearSlice: ', yearSlice)




///////////////// construct the environment of the plot


//// The racing bar plot 

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








let ticker = d3.interval(e => {

  // console.log(yearSlice)

  yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0,top_n);

    

  yearSlice.forEach((d,i) => d.rank = i);

  



  // let OADataSlice = OAData.filter(d => d.year == year)

  // console.log('IntervalYear: ', OADataSlice);



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


  //console.log(year)
 





 if(year == 2020) ticker.stop();
 year = d3.format('.1f')((+year) + 0.1);






},tickDuration);













d3.select('#x2').on('click', function() {

  tickDuration = 400;


})




    

   


};
  

dataHistory(data)


});

