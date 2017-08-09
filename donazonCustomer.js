// load all our rquires
var Inquirer = require('inquirer');
var mysql = require("mysql");
var connection = mysql.createConnection ({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "9227340gilchrist",
	database: "donazon_db"
});



//Let's say hello to our new customer
console.log("Welcome to Donazon, the world's largest and greatest imaginary store. Take a look at our available products.");

function loadProducts() {


	var query = connection.query(

		//pull the current table for products with selected columns (product id, product nam and product price)
		"SELECT * from products", function(err, res) {
		if (err) throw err;
			for (var i=0; i<res.length; i++) {
			console.log(`
ID: ${res[i].item_id} | NAME: ${res[i].item_name} | PRICE: $${res[i].price}
			`);
		}
		productOrder();
		})
};



function productOrder() {
Inquirer.prompt([
	{
		message: "What product would you like to order? (Please enter item number).",
		name: "product",
		validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          } 
          console.log("\nPlease enter a number.");
          return false;
        }

	},
	{
		message: "How many would you like to purchase?",
		name: "quantity",
		validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          } 
          console.log("\nPlease enter a number.");
          return false;
        }
		//validate to make sure we get a number
   	}
	]).then(function(answer) {
		// Let's double-check the inventory to see if we can fill the order
			checkInventory(answer);

	})

}

function checkInventory(answer) {
	var query = connection.query(

		//pull the current table for products with selected columns (product id, product nam and product price)
		"SELECT * from products WHERE ?", 

		[
			{
				item_id: answer.product
			}
		],

		function (err, res) {
			var newQuantity = res[0].stock_quantity;
			var product = res[0].item_id;
			if (answer.quantity <= newQuantity) {
				console.log("We have enough inventory to fill your order");
				newQuantity = res[0].stock_quantity - answer.quantity;

				adjustInventory(answer, newQuantity, res[0].price);
			} else {
				console.log("Sorry, we only have " + res[0].stock_quantity + " items in stock.")
				loadProducts();
			}

		}
		);	
}

function adjustInventory(answer, newQuantity, price) {
	console.log(answer);
	console.log(newQuantity);

	var query = connection.query(

		//pull the current table for products with selected columns (product id, product nam and product price)
		"UPDATE products SET ? WHERE ?", 

		[
			{
				stock_quantity: newQuantity	
			},

			{
				item_id: answer.product
			}
		],

		function (err, res) {
			if (err) {
				console.log(err);
				return;
			}	
				createBill(answer, price);
		}
		);	
}

function createBill(answer, price) {
	console.log("You ordered " + answer.quantity + " items.")
	console.log("Let's add up your bill!");
	var total = price * answer.quantity;
	console.log("You owe us $" + total+ "! Pay up!" );
}

loadProducts();