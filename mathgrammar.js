
// a very ambiguous grammar for doing calculations

var grammarRoot = '$expr';

var grammarRules = {
 $expr: [['$expr', '$oper', '$expr2',
	  function(){out = rules.$oper(rules.$expr, rules.$expr2)}],
	 ['$unary', '$expr',
	  function(){out = rules.$unary(rules.$expr)}],
	 ['$number', function(){out = rules.$number}]],

 $expr2: [['$expr', function(){out = rules.$expr}]],

 $unary: [['-', function(){out = function(x){return -x}}]],

 $oper: [['+', function(){out = function(x,y){return x+y}}],
	 ['-', function(){out = function(x,y){return x-y}}],
	 ['*', function(){out = function(x,y){return x*y}}]],

 $number: [['$digit', function(){out = rules.$digit}],
	   ['$number', '$digit', 
	    function(){out = 10 * rules.$number + rules.$digit}]],

 $digit: [['0', function(){out = 0}],
	  ['1', function(){out = 1}],
	  ['2', function(){out = 2}],
	  ['3', function(){out = 3}],
	  ['4', function(){out = 4}],
	  ['5', function(){out = 5}],
	  ['6', function(){out = 6}],
	  ['7', function(){out = 7}],
	  ['8', function(){out = 8}],
	  ['9', function(){out = 9}]],
}
