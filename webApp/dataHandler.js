//// handling the data and later exporting it/////////


function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }
  
  
  // callback function in case of errors
  function displayError(xhr, textStatus, errorThrown) {
    console.log(textStatus);
    console.log(errorThrown);
  }
  
  function isInteger(argument) { return argument == ~~argument; }
  
  
  // importing data: Approved money per year per discipline
  
  
  $.ajax({
    'async': false,
    'global': false,
    'url': "inputData/DisciplineAmountsPerYear.json",
    'dataType': "json",
    'success': function(result) {
      data = result;
    }
  })
  

  // console.log(data)

  export var data 




/// sum of OA articles per year


  $.ajax({
    'async': false,
    'global': false,
    'url': "inputData/PublicationsPerYear.json",
    'dataType': "json",
    'success': function(result) {
      OASumYr = result;
    }
  })
  

  // console.log(OARatioYr)

  export var OASumYr 





// publication status per year and per discipline with meta data



$.ajax({
  'async': false,
  'global': false,
  'url': "inputData/PublicationStatusYearDisciplineHierarchy.json",
  'dataType': "json",
  'success': function(result) {
    PublicationStatusYear = result;
  }
})


// console.log(oaRatioDiscYr)

export var PublicationStatusYear 








// /// Discipline names in the data set
// 
//   $.ajax({
//     'async': false,
//     'global': false,
//     'url': "inputData/OARatioDiscYrNames.json",
//     'dataType': "json",
//     'success': function(result) {
//       OARatioDiscYrNames = result;
//     }
//   })
//   
// 
//   // console.log(oaRatioDiscYr)
// 
//   export var OARatioDiscYrNames 







/// Network data for the Sankey

$.ajax({
  'async': false,
  'global': false,
  'url': "inputData/networkData.json",
  'dataType': "json",
  'success': function(result) {
    nwData = result;
  }
})


// console.log(oaRatioDiscYr)

export var nwData 





  // make sure date formats are correct
  
  var parseTime = d3.timeParse("%Y-%m-%d");
  var formatDate = d3.timeFormat("%Y-%m-%d")
  

  
  
  
  
  let OAData = new Array()
  
  
  data.forEach(d => {
  
    var OAD = new Array()
  
    OAD.year = +d.year,
    OAD.meanopenAccPerc = +d.meanopenAccPerc
    OAD.meanclosAccPerc = +d.meanclosAccPerc
    OAD.lastValueopenAcc = +d.lastValueopenAcc
    OAD.lastValueclosAcc = +d.lastValueclosAcc
   // console.log(d.name)
   
   OAData.push(OAD)
  
  })
  
  
  OAData = _.uniqBy(OAData, 'year')
  
  
  // console.log("this is OA data:", OAData)
  
  //// OA also with discipline
  
  
  
  let OAyearDisc = new Array()
  
  
  data.forEach(d => {
  
    if(isInteger(d.year)){
      var OADyDis = new Array()
  
      //console.log("shit worked")
    OADyDis.name = d.name
    OADyDis.year = d.year,
    OADyDis.meanopenAccPerc = d.meanopenAccPerc
    OADyDis.meanclosAccPerc = d.meanclosAccPerc
    OADyDis.lastValueopenAcc = d.lastValueopenAcc
    OADyDis.lastValueclosAcc = d.lastValueclosAcc
   // console.log(d.name)
   OAyearDisc.push(OADyDis)
  
    } 
   
  
  })
  
  // console.log("This is OAyearDisc", OAyearDisc)
  
  
  
  
  
  
  
  /// filter the years without ticks, this means only integers have to get into the array
  
  let OAyear = new Array()
  
  
  OAData.forEach(d => {
  
    if(isInteger(d.year)){
      var OADy = new Array()
  
      //console.log("shit worked")
    OADy.year = d.year,
    OADy.meanopenAccPerc = d.meanopenAccPerc
    OADy.meanclosAccPerc = d.meanclosAccPerc
    OADy.lastValueopenAcc = d.lastValueopenAcc
    OADy.lastValueclosAcc = d.lastValueclosAcc
   // console.log(d.name)
   OAyear.push(OADy)
  
    } 
   
  
  })
  
  // console.log("This is OAyear", OAyear)
  

  
  export let OAyrEx = OAyear

  