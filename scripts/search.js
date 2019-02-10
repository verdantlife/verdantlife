
   var searchResults = document.getElementById("search-list");
   var totalNutrition = null; //to be initialized after first item is selected



   //standard daily values for a 2,000 calorie diet from fda.gov & nih.gov
   var caloriesDV = 2000;
   var totalFatDV = 65; // less than 65g recommended
   var saturatedFatDV = 20; // less than 20g recommended
   var cholesterolDV = 300; //less than 300mg recommended
   var sodiumDV = 2400; //less than 2,400 mg recommended
   var carbohydratesDV = 300; // 300g recommended
   var dietaryFiberDV = 25; //25g recommended
   var proteinDV = 50; //50g recommended
   var vitaminADV = 5000; //5000 IU recommended
   var vitaminCDV = 60; //60mg recommended
   var calciumDV = 1000; //1000mg recommended
   var ironDV = 18; //18mg recommended
/*
To add or remove a nutritient, update these functions:
Item()
addToNutritionObject()
removeFromNutritionObject()
renderNutritionobject()
*/



function search() {
     var filter = document.getElementById("search-input").value.toLowerCase();
     //clear if empty
     if(filter == "") {
       searchResults.style.display = "none";
     } else {
       searchResults.style.display = "block";
     }

     var xhttp = new XMLHttpRequest(); // to get standard reference products
     var table = document.createElement("table");

     xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
         var jsonResponse = JSON.parse(this.responseText); //get object form of search results
         //format JSON information as a table
         var items = jsonResponse.list.item;

         searchResults.className = "active";
         for(var i = 0; i < items.length; i++) {
           var row = document.createElement("tr");
           row.className = "search-item";
           var ndbno = String(items[i].ndbno);
           row.setAttribute("onclick", "addItem('"+ndbno+"')");
           var td = document.createElement("td");
           var itemName = document.createTextNode(titleCase(items[i].name));
           if(items[i].ds == "SR") {
             var strong = document.createElement("strong");
             strong.appendChild(itemName);
             td.appendChild(strong);
             row.appendChild(td);
             table.insertBefore( row, table.childNodes[0] );
           } else {
           	 itemName = document.createTextNode(titleCase(items[i].name, items[i].manu));
             td.appendChild(itemName);
             row.appendChild(td);
             table.appendChild(row);
           }
         }

         //move rows with keyword to top
         for(var i = 0; i < table.rows.length; i++) {
           if(table.rows[i].cells[0].innerText.length > filter.length) {
             if(table.rows[i].cells[0].innerText.substring(0, filter.length).toLowerCase() == filter) {
               var row = table.rows[i];
               table.deleteRow(i);
               table.insertBefore(row, table.childNodes[0]);
             }
           }
         }
       }
       if(table.rows.length == 0) {
         var row = document.createElement("tr");
         var td = document.createElement("td");
         var message = document.createTextNode("We didn't find any results. Change your keywords and try again.");
         td.appendChild(message);
         row.appendChild(td);
         table.appendChild(row);
         searchResults.className = "active";
         getAll =true;
       }
       //place the table underneath the search bar
         searchResults.innerHTML = table.innerHTML;
      table.innerHTML = "";
      var col = document.createElement("col");
      col.style="width: 100%";
      searchResults.insertBefore(col, searchResults.firstChild);

     }

     //request info with params q=searchquery max=number of results per page
     xhttp.open("GET", "https://api.nal.usda.gov/ndb/search?q=" + filter +"&api_key=qGpAduUf8qhnEvjBibnQGLq1yVTOlDd5UlwbEZ7C&max=100",true);
     xhttp.send();

   }


   //Constructor for item object
function Item(obj, measure) {
  if(typeof measure !== "undefined") {
    this.measure = measure;
  } else if(obj !== 0){
    //Example: this.measure = Sandwich, 59g
    this.measure = titleCase(obj.report.food.nutrients[0].measures[0].label) + ", " + obj.report.food.nutrients[0].measures[0].eqv + obj.report.food.nutrients[0].measures[0].eunit;
  }
  var that = this;
  if(obj !== 0) {
    this.numberOfItems = 1.0;
    this.name = obj.report.food.name;
    this.jsonObj = obj;
    //Each nutrient's value

    this.nutrients = {
      "measure": that.measure,
      "calories" : parseFloat(getNutrientByName("Energy",this.measure, obj)),
      "totalFat" : parseFloat(getNutrientByName("Total lipid (fat)", this.measure, obj)),
      "saturatedFat" : parseFloat(getNutrientByName("Fatty acids, total saturated", this.measure, obj)),
      "monounsaturatedFat" : parseFloat(getNutrientByName("Fatty acids, total monounsaturated", this.measure, obj)),
      "polyunsaturatedFat" : parseFloat(getNutrientByName("Fatty acids, total polyunsaturated", this.measure, obj)),
      "transFat" : parseFloat(getNutrientByName("Fatty acids, total trans", this.measure, obj)),
      "cholesterol" : parseFloat(getNutrientByName("Cholesterol", this.measure, obj)),
      "sodium" : parseFloat(getNutrientByName("Sodium, Na", this.measure, obj)),
      "carbohydrates" : parseFloat(getNutrientByName("Carbohydrate, by difference", this.measure, obj)),
      "dietaryFiber" : parseFloat(getNutrientByName("Fiber, total dietary", this.measure, obj)),
      "sugars" : parseFloat(getNutrientByName("Sugars, total", this.measure, obj)),
      "protein" : parseFloat(getNutrientByName("Protein", this.measure, obj)),
    };
    //calculate daily value for each nutrient in this item, based on global variables holding the FDA standard daily values
    this.nutrients["caloriesDV"] = (this.nutrients.calories / caloriesDV) * 100,
    this.nutrients["totalFatDV"] = (this.nutrients.totalFat / totalFatDV) * 100, // less than 65g recommended
    this.nutrients["saturatedFatDV"] = (this.nutrients.saturatedFat / saturatedFatDV) * 100, // less than 20g recommended
    this.nutrients["cholesterolDV"] = (this.nutrients.cholesterol / cholesterolDV) * 100, //less than 300mg recommended
    this.nutrients["sodiumDV"] = (this.nutrients.sodium / sodiumDV)*100, //less than 2,400 mg recommended
    this.nutrients["carbohydratesDV"] = (this.nutrients.carbohydrates / carbohydratesDV)*100, // 300g recommended
    this.nutrients["dietaryFiberDV"] = (this.nutrients.dietaryFiber / dietaryFiberDV)*100, //25g recommended
    this.nutrients["proteinDV"] = (this.nutrients.protein/proteinDV)*100,
    this.nutrients["vitaminADV"] = (getNutrientByName("Vitamin A, IU", this.measure, obj) / vitaminADV) * 100,
    this.nutrients["vitaminCDV"] = (getNutrientByName("Vitamin C, total ascorbic acid", this.measure, obj) / vitaminCDV) * 100,
    this.nutrients["calciumDV"] = (getNutrientByName("Calcium, Ca", this.measure, obj) / calciumDV) * 100,
    this.nutrients["ironDV"] = (getNutrientByName("Iron, Fe", this.measure, obj) / ironDV) * 100;
  } else {
    this.nutrients = {
      "calories" : 0,
      "totalFat" : 0,
      "saturatedFat":0,
      "monounsaturatedFat" : 0,
      "polyunsaturatedFat" : 0,
      "transFat" : 0,
      "cholesterol" : 0,
      "sodium" : 0,
      "carbohydrates" : 0,
      "dietaryFiber" : 0,
      "sugars" : 0,
      "protein" : 0,
      "totalFatDV" : 0, // less than 65g recommended
      "saturatedFatDV" : 0, // less than 20g recommended
      "cholesterolDV" : 0, //less than 300mg recommended
      "sodiumDV" : 0,
      "carbohydratesDV" : 0, // 300g recommended
      "dietaryFiberDV": 0, //25g recommended
      "proteinDV": 0,
      "vitaminADV" : 0,
      "vitaminCDV" : 0,
      "calciumDV": 0,
      "ironDV": 0
    }
  }
  for(key in this.nutrients) {
    if(isNaN(this.nutrients[key]) && key != "measure") {
      console.log(key + " data for "+this.name+" is not yet available");
      this.nutrients[key] = 0;
    }
  }

  this.add = function(itemObj) {
    for(key in this.nutrients) {
      this.nutrients[key] += itemObj.numberOfItems * itemObj.nutrients[key];
    }
  }
  this.subtract = function(itemObj) {
    for(key in this.nutrients) {
      this.nutrients[key] -= itemObj.numberOfItems * itemObj.nutrients[key];
    }
  }
}

//calls the other functions to add the item
function addItem(ndbno) {
    document.getElementById('search-input').value = "";
     var request = new XMLHttpRequest();
     request.onreadystatechange = function() {
       if(this.readyState == 4 && this.status == 200) {
         var jsonObj = JSON.parse(this.responseText);

         var item = new Item(jsonObj);
         var measures = getAllMeasures(jsonObj);
         addToItemList(item, measures);
         if(totalNutrition == null) {
           totalNutrition = new Item(jsonObj);
           totalNutrition.name = "Total";
         } else {
           totalNutrition.add(item);
         }

         renderTotalNutrition();

       }
     }

     //request information on an item with ndbno = NDB Number and type=[b] for basic, [f] for full or [s] for statistics
    request.open("GET","https://api.nal.usda.gov/ndb/reports?format=json&ndbno=" + String(ndbno) + "&type=b&api_key=qGpAduUf8qhnEvjBibnQGLq1yVTOlDd5UlwbEZ7C", true);
     request.send();
   }

//return the value (how much), without the units, of a given nutrient
function getNutrientByName(nutrientName, measure, jsonObj) {
     var nutrients = jsonObj.report.food.nutrients;
     for(var i = 0; i < nutrients.length; i++) {
       if(nutrients[i].name == nutrientName) {
         if(measure=="100g") {
           return nutrients[i].value;
         } else {
           var measures = nutrients[i].measures;
           for(var j = 0; j < measures.length; j++) {
             if((measures[j].label +", " + measures[j].eqv + measures[j].eunit).toUpperCase() == measure.toUpperCase()) {
               return measures[j].value;
             }
           }
         }
       }
     }
     return "Nutrient not found";
   }

//update nutrition table to reflect change in quantity
function changeQuantity(link, newQuantity) {
  if(newQuantity == null || newQuantity == "undefined") {
    itemObj.numberOfItems = 0;
  }
  var itemObj = JSON.parse(link.getAttribute("item"));
  totalNutrition.subtract(itemObj);
  itemObj.numberOfItems = newQuantity;
  totalNutrition.add(itemObj);
    renderTotalNutrition();

  link.setAttribute("item", JSON.stringify(itemObj));
}

//add product to list of current items
function addToItemList(itemObj, measures) {
  //the table of items
  var itemsList = document.getElementById("item-table");
  var numItems = document.createElement("input");
  numItems.setAttribute("type", "number");
  numItems.setAttribute("onchange", "changeQuantity(this.parentNode.parentNode.childNodes[1].firstChild, this.value)");
  numItems.setAttribute("onkeyup", "changeQuantity(this.parentNode.parentNode.childNodes[1].firstChild, this.value)")
  numItems.setAttribute("value", 1);
  numItems.setAttribute("min", "1");
  numItems.style = "width: 35px;"
  var itemName = document.createElement("span");
  itemName.className = "item-name";
  itemName.setAttribute("title", titleCase(itemObj.name));
  var itemNameValue = document.createTextNode(titleCase(itemObj.name));
  itemName.appendChild(itemNameValue);
  var conjunction = document.createTextNode(" of ");
  var td = document.createElement("td"); //the main td holding the item name and measure e.g. "1.5 oz of bananas"
  td.className = "item";
  var measureOptions = document.createElement('select');
  measureOptions.className = "measure measure-choices";
  measureOptions.setAttribute("onchange", "switchItem(this, this.parentNode.parentNode.childNodes[1].firstChild)");
  for(var i = 0; i < measures.length; i++) {
    var option = document.createElement('option');
    option.setAttribute("value", measures[i]);
    option.innerText = measures[i];
    measureOptions.appendChild(option);
  }
  td.appendChild(numItems);
  td.appendChild(measureOptions);
  td.appendChild(conjunction);
  td.appendChild(itemName);
  var x = document.createElement("td"); //the td holding the "x" icon
  var a = document.createElement("a");
  a.setAttribute("href", "#0");
  a.setAttribute("item", JSON.stringify(itemObj));
  a.setAttribute("onclick", "removeFromItemList(this.parentNode.parentNode, this.getAttribute('item'))");
  var img = document.createElement("img");
  img.className = "remove-icon";
  img.setAttribute("src","sources/x.png");
  img.setAttribute("alt", "remove this item");
  a.appendChild(img)
  x.appendChild(a);
  var tr = document.createElement("tr");
  tr.appendChild(td);
  tr.appendChild(x);
  itemsList.appendChild(tr);

}

//removes product from list of current items, also calls removefromnutritionobject()
function removeFromItemList(row, itemObj) {
  row.parentNode.removeChild(row);
  totalNutrition.subtract(JSON.parse(itemObj));
    renderTotalNutrition();
}

//returns a list of possible serving sizes and the default measurement
function getAllMeasures(jsonObj) {
  var measures = jsonObj.report.food.nutrients[0].measures;
  var measureNames = [];
  for(var i = 0; i < measures.length; i++) {
    measureNames.push(titleCase(measures[i].label) + ", " + measures[i].eqv + measures[i].eunit);
  }
  measureNames.push("100g");
  return measureNames;
}

//renders the totalNutrition object in either default or traditional form based on the class of the nutrition-table object
function renderTotalNutrition() {
  if(document.getElementById("total-nutrition-container").className == "traditional") {
    document.getElementById('nutrition-table').innerHTML = renderNutritionObject(totalNutrition, true).innerHTML;
  } else {
    renderNutritionObject(totalNutrition, false);
  }
}

//return the tables to put in a container with the nutrition facts of itemObj properly formatted
function renderNutritionObject(itemObj, isDefault) {
    if(isDefault) {
      if(itemObj === "undefined" || itemObj == null) {
        itemObj = new Item(0);
        return renderNutritionObject(itemObj, true);
      }
      var container = document.createElement("div");
      document.getElementById('nutrition-table').style = "  width: 240px;padding: 10px 10px;background-color: white;border: 3px solid black;display: inline-block;font-size: 12pt;"
      var nutritionTop = document.createElement("table");
      nutritionTop.className = "nutrition-top";
      var nutritionHeader = document.createElement("table");
      nutritionHeader.className = "nutrition-header";
      var nutritionBody = document.createElement("table");
      nutritionBody.className = "nutrition-body";
      var nutritionFooter = document.createElement("table");
      nutritionFooter.className = "nutrition-footer";
      var dailyValueNote = document.createElement("table");
      dailyValueNote.className = "daily-value-note";

      //nutritionTop
      var col = document.createElement("col");
      col.style = "width: 240px";
      nutritionTop.appendChild(col)
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      var text = document.createTextNode("Nutrition Facts");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionTop.appendChild(tr);

      //nutritionHeader
      col = document.createElement("col");
      col.style = "width: 240px";
      nutritionHeader.appendChild(col);

      tr = document.createElement("tr");
      td = document.createElement("td");
      text = document.createTextNode("Amount Per Serving");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionHeader.appendChild(tr);

      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "calories left-align";
      text = document.createTextNode("Calories " + Math.round(itemObj.nutrients.calories));
      td.appendChild(text);
      tr.appendChild(td);
      nutritionHeader.appendChild(tr);

      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "right-align";
      text = document.createTextNode("% Daily Value*");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionHeader.appendChild(tr);

      //nutrition nutritionBody
      col = document.createElement("col");
      col.style = "width: 200px";
      coltwo = document.createElement("col");
      coltwo.style = "width: 40px";
      nutritionBody.appendChild(col);
      nutritionBody.appendChild(coltwo);

      //total fat
      tr = document.createElement("tr");
      td = document.createElement("td");
      tdtwo = document.createElement("td");
      td.className = "total-fat left-align";
      tdtwo.className = "total-fat-dv right-align";
      text = document.createTextNode("Total Fat " + nearestTenth(itemObj.nutrients.totalFat) + "g");
      texttwo = document.createTextNode(Math.round(itemObj.nutrients.totalFatDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      tdtwo.appendChild(texttwo);
      tr.appendChild(tdtwo);
      nutritionBody.appendChild(tr);

      //saturated fat
      tr = document.createElement("tr");
      td = document.createElement("td");
      tdtwo = document.createElement("td");
      td.className = "saturated-fat left-indent";
      tdtwo.className = "saturated-fat-dv right-align";
      text = document.createTextNode("Saturated Fat " + nearestTenth(itemObj.nutrients.saturatedFat) + "g");
      texttwo = document.createTextNode(Math.round(itemObj.nutrients.saturatedFatDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      tdtwo.appendChild(texttwo);
      tr.appendChild(tdtwo);
      nutritionBody.appendChild(tr);

      //trans fat
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "trans-fat left-indent";
      td.setAttribute("colspan", "2");
      text = document.createTextNode("Trans Fat " + nearestTenth(itemObj.nutrients.transFat) + "g");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionBody.appendChild(tr);

      //cholesterol
      tr = document.createElement("tr");
      td = document.createElement("td");
      tdtwo = document.createElement("td");
      td.className = "sodium left-align";
      tdtwo.className = "saturated-fat-dv right-align";
      text = document.createTextNode("Cholesterol " + nearestTenth(itemObj.nutrients.cholesterol) + "mg");
      texttwo = document.createTextNode(Math.round(itemObj.nutrients.cholesterolDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      tdtwo.appendChild(texttwo);
      tr.appendChild(tdtwo);
      nutritionBody.appendChild(tr);

      //sodium
      tr = document.createElement("tr");
      td = document.createElement("td");
      tdtwo = document.createElement("td");
      td.className = "sodium left-align";
      tdtwo.className = "sodium-dv right-align";
      text = document.createTextNode("Sodium " + nearestTenth(itemObj.nutrients.sodium) + "mg");
      texttwo = document.createTextNode(Math.round(itemObj.nutrients.sodiumDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      tdtwo.appendChild(texttwo);
      tr.appendChild(tdtwo);
      nutritionBody.appendChild(tr);

      //carbohydrates
      tr = document.createElement("tr");
      td = document.createElement("td");
      tdtwo = document.createElement("td");
      td.className = "carbohydrates left-align";
      tdtwo.className = "sodium-dv right-align";
      text = document.createTextNode("Carbohydrates " + nearestTenth(itemObj.nutrients.carbohydrates) + "g");
      texttwo = document.createTextNode(Math.round(itemObj.nutrients.carbohydratesDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      tdtwo.appendChild(texttwo);
      tr.appendChild(tdtwo);
      nutritionBody.appendChild(tr);

      //dietary fiber
      tr = document.createElement("tr");
      td = document.createElement("td");
      tdtwo = document.createElement("td");
      td.className = "dietary-fiber left-indent";
      tdtwo.className = "dietary-fiber-dv right-align";
      text = document.createTextNode("Dietary Fiber " + nearestTenth(itemObj.nutrients.dietaryFiber) + "g");
      texttwo = document.createTextNode(Math.round(itemObj.nutrients.dietaryFiberDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      tdtwo.appendChild(texttwo);
      tr.appendChild(tdtwo);
      nutritionBody.appendChild(tr);

      //sugars
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "sugars left-indent";
      td.setAttribute("colspan", "2");
      text = document.createTextNode("Sugars " + nearestTenth(itemObj.nutrients.sugars) + "g");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionBody.appendChild(tr);

      //protein
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "protein left-align";
      td.setAttribute("colspan", "2");
      text = document.createTextNode("Protein " + nearestTenth(itemObj.nutrients.protein) + "g");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionBody.appendChild(tr);

      //nutrition footer
      col = document.createElement("col");
      col.style = "width: 240px";
      nutritionFooter.appendChild(col);


      //vitamin A
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "vitamin-a left-align";
      text = document.createTextNode("Vitamin A " + Math.round(itemObj.nutrients.vitaminADV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionFooter.appendChild(tr);

      //vitamin C
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "vitamin-c left-align";
      text = document.createTextNode("Vitamin C " + Math.round(itemObj.nutrients.vitaminCDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionFooter.appendChild(tr);

      //calcium
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "calcium left-align";
      td.setAttribute("colspan", "2");
      text = document.createTextNode("Calcium " + Math.round(itemObj.nutrients.calciumDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionFooter.appendChild(tr);

      //iron
      tr = document.createElement("tr");
      td = document.createElement("td");
      td.className = "iron left-align";
      text = document.createTextNode("Iron " + Math.round(itemObj.nutrients.ironDV) + "%");
      td.appendChild(text);
      tr.appendChild(td);
      nutritionFooter.appendChild(tr);

      //daily value note
      col = document.createElement("col");
      col.style = "width: 240px";
      dailyValueNote.appendChild(col);
      td = document.createElement("td");
      text = document.createTextNode("*Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.");
      td.appendChild(text);
      dailyValueNote.appendChild(td);



      container.appendChild(nutritionTop);
      container.appendChild(nutritionHeader);
      container.appendChild(nutritionBody);
      container.appendChild(nutritionFooter);
      container.appendChild(dailyValueNote);


		document.getElementById("toggle-rendering").innerHTML = "Format: <strong>Default</strong>/<a style='color: rgb(0, 139, 118)' href='javascript:toggleRendering()'>Graph</a>";


      return container;
    }

    if(itemObj==null) {
      itemObj = new Item(0);
    }
    document.getElementById('nutrition-table').style = "";
      // Load the Visualization API and the corechart package.
      google.charts.load('current', {'packages':['corechart']});

      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart);

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      function drawChart() {

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Nutrient Name');
        data.addColumn('number', 'Percent Daily Value');
        data.addRows([
          ['Calories ' + nearestTenth(itemObj.nutrients.calories), itemObj.nutrients.caloriesDV/100],
          ['Total Fat ' + nearestTenth(itemObj.nutrients.totalFat) + 'g', itemObj.nutrients.totalFatDV/100],
          ['Saturated Fat ' + nearestTenth(itemObj.nutrients.saturatedFat) + 'g', itemObj.nutrients.saturatedFatDV/100],
          ['Cholesterol ' + nearestTenth(itemObj.nutrients.cholesterol) + 'mg', itemObj.nutrients.totalFatDV/100],
          ['Sodium ' + nearestTenth(itemObj.nutrients.sodium) + 'mg', itemObj.nutrients.sodiumDV/100],
          ['Carbohydrates ' + nearestTenth(itemObj.nutrients.carbohydrates) + 'g', itemObj.nutrients.carbohydratesDV/100],
          ['Dietary Fiber ' + nearestTenth(itemObj.nutrients.dietaryFiber) + 'g', itemObj.nutrients.dietaryFiberDV/100],
          ['Protein ' + nearestTenth(itemObj.nutrients.protein) + 'g', itemObj.nutrients.proteinDV/100]
        ]);

        // Set chart options
        var options = {'title':'Nutrition Information, %DV',
                       'legend':'none',
                       height: 500,
                       'chartArea': {right: 20, top: 50, 'width': '70%', 'height': '80%'},
                     hAxis:{format:'#%',viewWindowMode:'explicit', viewWindow:{max:1, min:0}},
                   'wmode': 'transparent',
                   colors: ['#00d18b']};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.BarChart(document.getElementById('nutrition-table'));
        chart.draw(data, options);
      }

          document.getElementById("toggle-rendering").innerHTML = "Format: <a style='color: rgb(0, 139, 118)' href='javascript:toggleRendering()'>Default</a>/<strong>Graph</strong>";
    return null;
}

//change the measure of an item
function switchItem(measureOptions, link) {
  var itemObj = JSON.parse(link.getAttribute('item'));
  var newMeasure = measureOptions.options[measureOptions.selectedIndex].value;
  if(newMeasure == itemObj.measure) {
    return;
  }
  totalNutrition.subtract(itemObj);
  itemObj = new Item(itemObj.jsonObj, newMeasure);
  link.setAttribute('item', JSON.stringify(itemObj));
  totalNutrition.add(JSON.parse(link.getAttribute('item')));
  renderTotalNutrition();

}

//add a meal to the sql database for current user
function addMeal() {
  request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      alert(this.responseText); //change this later
    }
  }
  request.open("POST", "postmeal.php", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(totalNutrition));
}
   //function to hide menu when click away or empty box
   window.onclick = function(event) {
       if (event.target != document.getElementById('search-input')) {
           searchResults.style.display = "none";
       } else if(document.getElementById('search-input').value != "") {
         searchResults.style.display = "block";
       }
   }
//calls search when enter key is clicked
/*
document.getElementById('search-input').addEventListener("keyup", function(e) {
  e.preventDefault();
  if(e.keyCode === 13) {
    search();
  }
  if(document.getElementById('search-input').value == "") {
    searchResults.style.display = "none";
  }
});*/

//gets a list of ingredients for printing

function getIngredientList() {
	var itemList = document.getElementById("item-table").rows;
	var items = [];
	for(var i= 0; i < itemList.length; i++) {
		var measure = itemList[i].cells[0].childNodes[1].value;
		items.push([parseInt(measure.substring(measure.indexOf(",")+2), 10)*itemList[i].cells[0].childNodes[0].value, itemList[i].cells[0].childNodes[3].innerText]);
	}
	//sort items by measure
	function compare(a, b) {
		return b[0] - a[0];
	}
	items.sort(compare);
	var p = document.createElement("p");
	p.setAttribute("id", "ingredients-list");
	p.innerHTML = "<b>Ingredients: </b>";
	for(var i = 0; i < items.length; i++) {
		//if(items[i][1].indexOf(",") === -1) {
			p.innerText += items[i][1];
		/*} else {
			p.innerText += items[i][1].substring(items[i][1].indexOf(","), items[i]) + items[i][1].substring(0, items[i][1].indexOf(",")); //take out extra information
		}*/

		if(i !== items.length-1) {
			p.innerText += "; ";
		}
	}
	return p;

}


   // Returns string with first letter of each word capitalized, and manufacturer name if it applies
   function titleCase(str, manu) {
     var words = str.toLowerCase().split(" ");
     for(var i = 0; i < words.length; i++) {
       if(words[i].length > 1) {
         words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
       } else {
         words[i] = words[i].toUpperCase();
       }

     }
     if(words.indexOf("Gtin:") != -1) {
       words = words.slice(0, words.indexOf("Gtin")-1);
       words[words.length-1] = words[words.length-1].substring(0, words[words.length-1].length-1);
     }
     if(words.indexOf("Upc:") != -1) {
       words = words.slice(0, words.indexOf("Upc")-1);
       words[words.length-1] = words[words.length-1].substring(0, words[words.length-1].length-1);
     }
     if(manu !== "none" && manu !== "undefined" && manu != null) {
     	 words.unshift(manu);
     }

     return words.join(" ");
   }
   //return n rounded to the nearest tenth
   function nearestTenth(n) {
     return Math.round(n*10)/10;
   }
  function toggleRendering() {
    document.getElementById('total-nutrition-container').classList.toggle('traditional');
    renderTotalNutrition();
  }
