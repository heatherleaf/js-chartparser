
//////////////////////////////////////////////////////////////////////
// a logging function
//  - uncomment if you want to debug the parsing process
function LOG(str) {
  // console.log("" + str);
}


//////////////////////////////////////////////////////////////////////
// we need to be able to clone objects between different edges
// borrowed from http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
function clone(obj){
  if (obj == null || typeof(obj) != 'object') {
    return obj;
  }
  var temp = new obj.constructor(); 
  for (var key in obj) {
    temp[key] = clone(obj[key]);
  }
  return temp;
}


//////////////////////////////////////////////////////////////////////
// objects are by default printed "[Object]"
// we change this behaviour, to be able to use objects in hash tables
Object.prototype.toString = function toString() {
  var str = "{";
  for (var key in this) {
    str += key + ":" + this[key] + ";";
  }
  return str + "}";
};


//////////////////////////////////////////////////////////////////////
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
  this.add = function add(edge) {
    var subchart, cat;
    if (edge.isPassive) {
      subchart = this.passives[edge.start];
      cat = edge.lhs;
    } else {
      subchart = this.actives[edge.end];
      cat = edge.next.content;
    }
    if (!(cat in subchart)) {
      subchart[cat] = {};
    }
    if (edge in subchart[cat]) {
      return false;
    } else {
      subchart[cat][edge] = edge;
      return true;
    }
  }

  // Chart.resultsForRule(lhs, start, end)
  // return all parse results for the given lhs, start, and end
  //  - start, end are optional; defaults to 0, numberOfWords
  this.resultsForRule = function resultsForRule(lhs, start, end) {
    start = start || 0;
    end = end || numberOfWords;
    var results = [];
    var finalEdges = this.passives[start][lhs];
    for (var i in finalEdges) {
      if (finalEdges[i].end == end) {
	results.push(finalEdges[i].out);
      }
    }
    return results;
  }
  
  // Chart.allEdges() / Chart.allPassiveEdges() / Chart.allActiveEdges()
  // return an array of all (passive/active) edges in the chart
  this.allEdges = function allEdges() {
    return this.allPassiveEdges().concat(this.allActiveEdges());
  }
  this.allPassiveEdges = function allPassiveEdges() {
    var edges = [];
    for (var i in this.passives) 
      for (var j in this.passives[i]) 
	for (var k in this.passives[i][j])
	  edges.push(this.passives[i][j][k]);
    return edges;
  }
  this.allActiveEdges = function allActiveEdges() {
    var edges = [];
    for (var i in this.actives) 
      for (var j in this.actives[i]) 
	for (var k in this.actives[i][j])
	  edges.push(this.actives[i][j][k]);
    return edges;
  }

  // Chart.statistics()
  // return the number of edges in the chart
  this.statistics = function statistics() {
    var passives = this.allPassiveEdges().length;
    var actives = this.allActiveEdges().length;
    return {nrEdges: passives+actives, nrPassiveEdges: passives, nrActiveEdges: actives};
  }
}


//////////////////////////////////////////////////////////////////////
// parse edges: passive and active

function PassiveEdge(start, end, lhs, out) {
  this.start = start;
  this.end = end;
  this.lhs = lhs;
  this.out = out;
  this.isPassive = true;

  var str = "[" + start + "-" + end + "] $" + lhs + " := " + out;
  this._string = str;
  this.toString = function toString() {return this._string;} 
}

function ActiveEdge(start, end, lhs, next, rest, out, rules) {
  this.start = start;
  this.end = end;
  this.lhs = lhs;
  this.next = next;
  this.rest = rest;
  this.out = out;
  this.rules = rules;
  this.isPassive = false;

  var str = "<" + start + "-" + end + "> $" + lhs + " -> " + next + 
    ", " + rest + " := " + out + " <- " + rules;
  this._string = str;
  this.toString = function toString() {return this._string;} 
}


//////////////////////////////////////////////////////////////////////
// the main parsing function: a simple top-down chartparser
//  - 'words' is an array of strings
//  - 'grammar' is a hash table of left-hand-sides mapping to arrays of right-hand-sides
//  - 'root' is the starting category (a string)
//    if unspecified, use the '$root' property of the grammar
//  - 'filter' is an optional left-corner filter 
//    (a mapping from categories/rule-refs to words)
//    if specified, it is used when predicting new edges
// returns the final chart
function parse(words, grammar, root, filter) {
  if (!root) {
    root = grammar.$root;
  }
  var chart = new Chart(words.length);
  var agenda = [];

  var leftCornerFilter;
  if (filter == undefined) {
    leftCornerFilter = function() {return true};
  } else {
    leftCornerFilter = function leftCornerFilter(ruleref, position) {
      var leftCorners = filter[ruleref];
      return leftCorners ? words[position] in leftCorners : true;
    }
  }
  
  // add an edge to the chart and the agenda, if it does not already exist
  function addToChart(inference, start, end, lhs, rhs, out, rules) {
    var edge;
    if (rhs.length > 0) {
      var next = rhs[0];
      var rest = rhs.slice(1);
      switch (next.constructor) {
	
      case Array:
	// the next symbol is a sequence
	addToChart(inference+",SEQUENCE", start, end, lhs, next.concat(rest), out, rules);
	return;
	
      case RepeatClass:
	// the next symbol is a repetition
	var min = next.min;
	var max = next.max;
	// skip repeat 
	if (min <= 0) {
	  addToChart(inference+",SKIP", start, end, lhs, rest, out, rules);
	}
	// repeat 
	if (max > 0) {
	  var content = next.content;
	  var rhs = (max==1 ? [content] : [content, Repeat(min ? min-1 : min, max-1, content)]);
	  addToChart(inference+",REPEAT", start, end, lhs, rhs.concat(rest), out, rules);
	}
	return;
	
      case OneOfClass:
	// the next symbol is a disjunction
	var oneof = next.content;
	for (var i in oneof) {
	  var rhs = oneof[i].concat(rest);
	  addToChart(inference+",ONEOF", start, end, lhs, rhs, out, rules);
	} 
	return;
	
      case TagClass:
	// the next symbol is a semantic action
	out = clone(out);
	rules = clone(rules);
	eval(next.content);
	addToChart(inference+",TAG", start, end, lhs, rest, out, rules);
	return;
      }

      edge = new ActiveEdge(start, end, lhs, next, rest, out, rules);
    } else {
      edge = new PassiveEdge(start, end, lhs, out);
    }
    
    // try to add the edge; if successful, also add it to the agenda
    if (chart.add(edge)) {
      LOG("+ " + inference + ": " + edge);
      agenda.push(edge);
    }
  }
  
  // seed the agenda with the starting rule
  addToChart("INIT", 0, 0, root, grammar[root], {}, {});
  
  // main loop
  while (agenda.length > 0) {
    var edge = agenda.pop();
    var start= edge.start;
    var end  = edge.end;
    var lhs  = edge.lhs;
    var next = edge.next;
    LOG(edge);

    if (edge.isPassive) {
      // combine
      var actives = chart.actives[start][lhs];
      for (var i in actives) {
	var active = actives[i];
	var rules = clone(active.rules);
	rules[edge.lhs] = clone(edge.out);
	addToChart("COMBINE", active.start, end, active.lhs, active.rest, active.out, rules);
      }

    } else if (next.constructor == RefClass) {
      var ref = next.content;
      // combine
      var passives = chart.passives[end][ref];
      for (var i in passives) {
	var passive = passives[i];
	var rules = clone(edge.rules);
	rules[passive.lhs] = clone(passive.out);
	addToChart("COMBINE", start, passive.end, lhs, edge.rest, edge.out, rules);
      }
      // predict
      if (ref in grammar) {
	if (leftCornerFilter(ref, end)) {
	  addToChart("PREDICT", end, end, ref, grammar[ref], {}, {});
	}
      }

    } else if (next == words[end]) {
      // scan
      addToChart("SCAN", start, end+1, lhs, edge.rest, edge.out, edge.rules);
    }
  }

  return chart;
}


