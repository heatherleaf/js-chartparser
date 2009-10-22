
var grammarRoot = '$utterance';

var grammarRules = {
 $utterance: [['$iwant', '$order', function(){out = rules.$order}, 
	       '$please']],
 $iwant:  [[], ['I', 'would', 'like'], ['give', 'me']],
 $please: [[], ['please']],
 
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
	   "$pizzaword", "with", "$toppings",
	   function (){out.toppings = rules.$toppings}],
	   ],
 $pizzaword: [["pizza"], ["pizzas"]],
 
 $kindofdrink: [['$cokeword', function(){out='coke';}],
		['$pepsiword', function(){out='pepsi';}],
		],
 $cokeword: [["coke"], ["cokes"], ["coca", "cola"], ["coca", "colas"]],
 $pepsiword: [["pepsi"], ["pepsis"]],
 
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
}

