
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
  var parseChart = parse(input, grammar, grammar.$root);
  var parseTime = new Date() - startTime;
  var parseResults = parseChart.resultsForRule(grammar.$root);

  appendElement(resultsDiv, "H3", '"' + document.getElementById("input").value + '"');
  if (parseResults) { 
    var resultList = appendElement(resultsDiv, "OL");
    for (var i in parseResults) 
      appendElement(resultList, "LI", parseResults[i]);
  } else {
    appendElement(resultsDiv, "P", "No results found!");
  }

  var statistics = parseChart.statistics()
  appendElement(resultsDiv, "P", "Chart size: " + statistics.nrEdges + " edges" +
		" (" + statistics.nrPassiveEdges + " passive)");
  appendElement(resultsDiv, "P", "Parse time: " + parseTime + " ms" + 
		" (" + (parseTime / statistics.nrEdges).toFixed(2) + " ms/edge)");
}

function runWordParser() {
  runParser(document.getElementById("input").value.split(/\s+/));
}

function runCharacterParser() {
  runParser(document.getElementById("input").value.split(""));
}

