
// a logging function
//  - uncomment if you want to debug the parsing process
function LOG(str) {
  // console.log("" + str);
}


// we need to be able to clone objects between different edges
// borrowed from http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
function clone(obj){
    if(obj == null || typeof(obj) !== 'object')
        return obj;
    var temp = new obj.constructor(); 
    for (var key in obj) 
      if (obj.hasOwnProperty(key)) 
        temp[key] = clone(obj[key]);
    return temp;
}


// serialization of arbitrary objects
// this is used, e.g. for creating hash keys for any object
// simplified from http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript
function serialize(obj) {
  if (obj == null)
    return obj;
  
  if (obj.toSource)
    return obj.toSource();

  switch (typeof(obj)) {
  case 'function':
    return obj.toSource ? obj.toSource() : obj;
    
  case 'object':
    if (obj == null) 
      return obj;
    
    if (obj.toSource)
      return obj.toSource();

    var len = obj.length;
    if (len) {
      var str = '[';
      for (var i = 0; i <= len; i++)
	str += serialize(obj[i]) + ',';
      return str.replace(/\,$/, '') + ']';
      
    } else {
      var str = '{';
      for (var key in obj) 
	str += key + ':' + serialize(obj[key]) + ',';
      return str.replace(/\,$/, '') + '}';
    }
    
  default:
    return obj;
  }    
//   if (!(obj instanceof Object)) {
//     return obj;

//   } else if (obj.toSource instanceof Function) {
//     return obj.toSource();
  
//   } else if (obj instanceof Function) {
//     return obj;

//   } else if (obj instanceof Array) {
//     var str = '[';
//     for (var i in obj)
//       str += serialize(obj[i]) + ',';
//     return str.replace(/\,$/, '') + ']';

//   } else {
//     var str = '{';
//     for (var key in obj) 
//       str += key + ':' + serialize(obj[key]) + ',';
//     return str.replace(/\,$/, '') + '}';
//   }
}


// parse chart
// conceptually this is a set of edges, but it is optimized
function Chart(numberOfWords) {
  this.numberOfWords = numberOfWords;
  this.passives = new Array(numberOfWords);
  this.actives = new Array(numberOfWords);
  for (var i = 0; i <= numberOfWords; i++) {
    this.passives[i] = {};
    this.actives[i] = {};
  }

  // Chart.add(edge)
  // add the edge to the chart, return true if the chart was changed 
  // (i.e. if the chart didn't already contain the edge)
  this.add = function(edge) {
    var subchart, cat;
    if (edge.isPassive()) {
      subchart = this.passives[edge.start];
      cat = edge.lhs;
    } else {
      subchart = this.actives[edge.end];
      cat = edge.next();
    }
    if (!(cat in subchart)) 
      subchart[cat] = {};
    if (edge in subchart[cat]) {
      return false;
    } else {
      subchart[cat][edge] = edge;
      return true;
    }
  }

  // Chart.matchingEdges(edge)
  // return all edges in the chart that can be combined with the given edge
  // NOTE: the edges are returned as a hash table
  this.matchingEdges = function(edge) {
    if (edge.isPassive()) {
      return this.actives[edge.start][edge.lhs];
    } else {
      return this.passives[edge.end][edge.next()];
    }
  }
  
  // Chart.edgesForCat(lhs, start, end)
  // return all passive edge with the given lhs, start and end
  //  - start, end are optional; defaults to 0, number-of-words
  this.edgesForCat = function(lhs, start, end) {
    start = start || 0;
    end = end || numberOfWords;
    var results = [];
    var finalEdges = this.matchingEdges(new Edge('', [lhs], start));
    for (var i in finalEdges) 
      if (finalEdges[i].end == end) 
	results.push(finalEdges[i].out);
    return results;
  }
  
  // Chart.allEdges(bool)
  // return an array of all edges in the chart
  //  - onlyPassive (optional boolean): return only passive edges
  this.allEdges = function(onlyPassive) {
    var edges = [];
    for (var i in this.passives) 
      for (var j in this.passives[i]) 
	for (var k in this.passives[i][j])
	  edges.push(this.passives[i][j][k]);
    if (onlyPassive)
      return edges;
    for (var i in this.actives) 
      for (var j in this.actives[i]) 
	for (var k in this.actives[i][j])
	  edges.push(this.actives[i][j][k]);
    return edges
  }
  
  // Chart.statistics()
  // return some numbers for the chart
  this.statistics = function() {
    return {nrEdges: this.allEdges().length,
	    nrPassiveEdges: this.allEdges(true).length};
  }
}


// parse edges
//  - lhs, rhs, start, are mandatory arguments
//  - end, dot, out, rules, are optional arguments
//    (defaulting to start, 0, {}, {}, respectively)
function Edge(lhs, rhs, start, end, dot, out, rules) {
  this.lhs = lhs;
  this.rhs = rhs;
  this.start = start;
  this.end = end || start;
  this.dot = dot || 0;
  this.out = out || {};
  this.rules = rules || {};

  // slight optimization: calculate the serialization once
  // NOTE: this means that edge must NOT be modified after creation!
  var str = "[" + this.start + "-" + this.end + "] " + serialize(this.lhs) + " ->";
  for (var i in this.rhs) {
    if (i === this.dot)
      str += " [*]";
    str += " " + serialize(this.rhs[i]);
  }
  if (this.dot === this.rhs.length)
    str += " [*]";
  str += "\n\t" + serialize(this.out) + " := " + serialize(this.rules);
  this._source = str;
  
  // Edge.toSource(), Edge.toString()
  // string representation of the edge
  // this can be used as a unique hash key
  this.toSource = function() {return this._source;}
  this.toString = function() {return this._source;} 

  // Edge.isPassive()
  // returns true if the edge is passive
  this.isPassive = function() {return this.dot >= this.rhs.length;}
  
  // Edge.next()
  // returns the symbol after the dot, provided the edge is active
  this.next = function() {return this.rhs[this.dot];}
  
  // Edge.combineWith(passive edge)
  // create a new edge which is this edge combined with a matching passive edge
  // NOTE: this presupposes that the edges match - no testing is done
  this.combineWith = function(passive) {
    var newOut = clone(this.out);
    var newRules = clone(this.rules);
    newRules[passive.lhs] = clone(passive.out);
    return new Edge(this.lhs, this.rhs, this.start, passive.end, this.dot+1, newOut, newRules);
  }
}


// the main parsing function: a simple top-down chartparser
//  - the words is an array of strings
//  - the root is a category (string)
//  - the grammar is a hash table of left-hand-sides mapping to arrays of right-hand-sides
// returns an array of all possible interpretations
function parse(words, root, grammar) {
  var chart = new Chart(words.length);
  var agenda = [];
  
  // add an edge to the chart and the agenda, if it does not already exist
  function addToChart(edge) {
    if (chart.add(edge))
      agenda.push(edge);
  }  
  
  // seed the agenda with words
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var edge = new Edge(word, [], i, i+1);
    addToChart(edge);
  }
  
  // seed the agenda with the starting rule
  for (var i in grammar[root]) {
    var edge = new Edge(root, grammar[root][i], 0);
    addToChart(edge);
  }
  
  // main loop
  while (agenda.length > 0) {
    var edge = agenda.pop();
    LOG(edge);
    
    if (edge.isPassive()) {
      // alt 1. the edge is passive
      // combine
      var actives = chart.matchingEdges(edge);
      for (var i in actives) {
	var newEdge = actives[i].combineWith(edge);
	LOG("+ COMBINE: " + newEdge);
	addToChart(newEdge);
      }

    } else {
      var next = edge.next();

      if (!(next instanceof Object)) {
	// alt 2. the next symbol is a category or terminal
	// combine
	var passives = chart.matchingEdges(edge);
	for (var i in passives) {
	  var newEdge = edge.combineWith(passives[i]);
	  LOG("+ COMBINE: " + newEdge);
	  addToChart(newEdge);
	}      
	// predict
	var rightHandSides = grammar[next];
	for (var i in rightHandSides) {
	  var newEdge = new Edge(next, rightHandSides[i], edge.end);
	  LOG("+ PREDICT: " + newEdge);
	  addToChart(newEdge);
	}
	
      } else if (next instanceof Function) {
	// alt 3. the next symbol is a semantic action
	// NOTE: 'out' and 'rules' are global variables, which are changed by the action
	out = clone(edge.out);
	rules = clone(edge.rules);
	next();
	var newEdge = new Edge(edge.lhs, edge.rhs, edge.start, edge.end, edge.dot+1, out, rules);
	LOG("+ ACTION: " + newEdge);
	addToChart(newEdge);
	
      } else {
	throw "Syntax error in edge: " + edge;
      }
    }
  }

  return chart;
//   // filter out only the root edges spanning the whold input
//   var results = [];
//   var finalEdges = chart.matchingEdges(new Edge('', [root], 0));
//   for (var i in finalEdges) 
//     if (finalEdges[i].end == words.length) 
//       results.push(finalEdges[i].out);
  
//   return results;
}


