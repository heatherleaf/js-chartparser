
grammar = new Grammar('utterance');

grammar.utterance = [Ref('iwant'), Ref('order'), Tag("out = rules.order"), Optional(['please'])];
// grammar.utterance = [Ref('order'), Tag("out = rules.order"), Optional(['please'])];

grammar.iwant = [Optional([OneOf([['I', 'would', 'like'], 
				  ['give', 'me']])])];

grammar.order = [OneOf([[Ref('drink'), Tag("out.drink = rules.drink"),'and', Ref('pizza'), Tag("out.pizza = rules.pizza")],
			[Ref('drink'), Tag("out.drink = rules.drink")],
// 			])];
			[Ref('pizza'), Tag("out.pizza = rules.pizza")]])];

grammar.drink = [Ref("number"), Ref("foodsize"), Ref("kindofdrink"),
		 Tag("out.number = rules.number; out.drinksize = rules.foodsize; out.liquid = rules.kindofdrink;")];

grammar.pizza = [Ref("number"), Tag("out.number = rules.number"),
		 Ref("foodsize"), Tag("out.pizzasize = rules.foodsize"),
		 OneOf([["pizza"], ["pizzas"]]), 
		 "with", Ref("toppings"), Tag("out.toppings = rules.toppings")];

// grammar.kindofdrink = ['coke', Tag("out='coke';")];
grammar.kindofdrink = [OneOf([[Ref('cokeword'), Tag("out='coke';")],
			      [Ref('pepsiword'), Tag("out='pepsi';")]])];

grammar.cokeword = [OneOf([["coke"], ["cokes"], ["coca", "cola"], ["coca", "colas"]])];

grammar.pepsiword = [OneOf([["pepsi"], ["pepsis"]])];

grammar.foodsize = [Tag("out = 'medium';"),
		    Repeat(0, 1, [OneOf([['small', Tag("out = 'small';")],
					 ['medium'],
					 ['regular', Tag("out = 'medium';")],
					 ['large', Tag("out = 'large';")]])])];

grammar.toppings = [Ref("topping"), Tag("out = [rules.topping]"),
		    Repeat(0, Infinity, ["and", Ref("topping"), Tag("out.push(rules.topping)")])];

grammar.topping = [OneOf([["anchovies", Tag("out='anchovies'")],
			  ["pepperoni", Tag("out='pepperoni'")],
			  ["mushroom", Tag("out='mushrooms'")],
			  ["mushrooms", Tag("out='mushrooms'")]])];

// grammar.number = ["a", Tag("out=1")];
grammar.number = [OneOf([["a", Tag("out=1")],
			 ["one", Tag("out=1")],
			 ["two", Tag("out=2")],
			 ["three", Tag("out=3")]])];

grammar.$check();

