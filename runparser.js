
// helper functions for the parser demo

function appendElement(parent, element, text) {
  var elem = document.createElement(element);
  if (text)
    elem.appendChild(document.createTextNode(text));
  parent.appendChild(elem);
  return elem
}

function runParser(input) {
  var resultsDiv = document.getElementById("results");
  var startTime = new Date();
  var parseChart = parse(input, grammarRoot, grammarRules);
  var parseTime = new Date() - startTime;
  var parseResults = parseChart.edgesForCat(grammarRoot);

  appendElement(resultsDiv, "H3", '"' + document.getElementById("input").value + '"');
  if (parseResults) { 
    var resultList = appendElement(resultsDiv, "OL");
    for (var i in parseResults) 
      appendElement(resultList, "LI", serialize(parseResults[i]));
  } else {
    appendElement(resultsDiv, "P", "No results found!");
  }

  appendElement(resultsDiv, "P", "Chart size: " + serialize(parseChart.statistics()));
  appendElement(resultsDiv, "P", "Parse time: " + parseTime + " ms");
}

function runWordParser() {
  runParser(document.getElementById("input").value.split(/\s+/));
}

function runCharacterParser() {
  runParser(document.getElementById("input").value.split(""));
}

