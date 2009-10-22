
var grammarRoot = '$utterance';

var grammarRules = {
 $utterance: [['$iwant', '$order', function(){out = rules.$order}, 
	       '$please']],
 
 $order: [['$drink', function(){out.drink = rules.$drink},
	   'and', '$pizza', function(){out.pizza = rules.$pizza}],
	  ['$drink', function(){out.drink = rules.$drink}],
	  ['$pizza', function(){out = {pizza: rules.$pizza}}],
	  ],
 
 $drink: [["$number", "$foodsize", "$kindofdrink",
	   function(){out.number = rules.$number;
		      out.drinksize = rules.$foodsize;
		      out.liquid = rules.$kindofdrink;}],
	   ],
 
 $pizza: [["$number", function(){out.number = rules.$number},
	   "$foodsize", function(){out.pizzasize = rules.$foodsize},
	   "pizzas", "with", "$toppings",
	   function (){out.toppings = rules.$toppings}],
	   ],
 
 $kindofdrink: [['coke', function(){out='coke';}],
		['pepsi', function(){out='pepsi';}],
		['coca', 'cola', function(){out='coke';}],
		],
 
 $foodsize: [[ function(){out = 'medium';}],
	     ['small', function(){out = 'small';}],
	     ['medium', function(){out = 'medium';}],
	     ['regular', function(){out = 'medium';}],
	     ['large', function(){out = 'large';}],
	     ],
 
 $toppings: [["$topping", function(){out = [rules.$topping]}],
	     ["$toppings", function(){out = rules.$toppings},
	      "and", "$topping", function(){out.push(rules.$topping)}],
	     ],
 
 $topping: [["anchovies", function(){out="anchovies"}],
	    ["pepperoni", function(){out="pepperoni"}],
	    ["mushroom", function(){out="mushrooms"}],
	    ["mushrooms", function(){out="mushrooms"}],
	    ],
 
 $number: [["a", function(){out=1}],
	   ["one", function(){out=1}],
	   ["two", function(){out=2}],
	   ["three", function(){out=3}],
	   ],
 
 $iwant: [[],
	  ['I', 'would', 'like'],
	  ['give', 'me'],
	  ],
 
 $please: [[], 
	   ['please'],
	   ],
}

