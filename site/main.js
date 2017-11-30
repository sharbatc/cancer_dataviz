function TreemapParent (){
  d3.csv("clinical_data.csv",function(data)
  {
    var  clin_data={};
    clin_data.header = Object.keys(data[0]);
    clin_data.data=data.slice(0).map(function (row){
      return clin_data.header.map(function (h){ return row[h]; });
    });
    console.log(clin_data.header)
    var csv = new dex.csv(clin_data).include([3,1,2,15,12,7,9,11,5,6])
    var tree = dex.charts.d3.Sunburst({
      'parent': '#Sunburst',
      'csv': csv
    }).render()
  })
}
