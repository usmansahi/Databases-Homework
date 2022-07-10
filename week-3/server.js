const express = require('express');
const  {Pool, Client} = require('pg');
const bodyParser = require("body-parser");

const { user } = require('pg/lib/defaults');
const res = require('express/lib/response');

const app = express();
const port = 3001
app.use(bodyParser.json());
//app.use(express.urlencoded({extended}))

const pool = new Pool({
    user: 'usman',
    host: 'localhost',
    database: 'cyf_ecommerce',
    password: 'usman0987.',
    port: 5432
});
app.get("/products", (req, res) => {
    const newproduct = req.query.productname
  
    const allProducts =
        "select products.product_name,suppliers.supplier_name " +
        "from products " +
        "INNER join suppliers on products.supplier_id=suppliers.id"
  
    const productByName =
        "select products.product_name,suppliers.supplier_name " +
        "from products " +
        "INNER join suppliers on products.supplier_id=suppliers.id " +
        "where products.product_name like $1"
  
    if(newproduct){
        pool.query(productByName,[newproduct])
             .then((result) => res.json(result.rows))
    } else {
        pool.query(allProducts)
            .then(result => {
                res.json(result.rows)
            })
    }
  });
  // Add a new GET endpoint /customers/:customerId to load a single customer by ID
  app.get('/customers/:customerId', (req,res)=>{
      const customerId = req.params.customerId;
      const customerById = 'select * from customers where id = $1';
      pool.query(customerById,[customerId])
      .then((result)=> res.json(result.rows))
      .catch((error) =>console.log('there is error ' + error))

  })
  // Add a new POST endpoint /customers to create a new customer.
  app.post('/customers', (req,res)=>{
    const customerName = req.body.name;
    const customerAddress = req.body.address;
    const customerCity = req.body.city;
    const customerCountry = req.body.country;
   
    const insertCustomer = 'INSERT INTO customers (name,address,city,country) VALUES($1, $2, $3, $4)';
    pool.query(insertCustomer,[customerName,customerAddress,customerCity,customerCountry])
    .then(() => res.send('customer created'))
    .catch((error) => console.log('there is error' + error))

  })
  // Add a new POST endpoint /products to create a new product (with a product name, a price and a supplier id).
  // Check that the price is a positive integer and that the supplier ID exists in the database, otherwise return an error.
  app.post('/products/:supplierId', (req,res)=>{
      const supplierId =req.params.supplierId;
      const productName = req.body.product_name;
      const productPrice = req.body.unit_price;
      
      const chekSupplierId= 'select * from products where id = $1';
      console.log(chekSupplierId)
      const newProduct = 'insert into products(product_name, unit_price, supplier_id ) Values($1, $2, $3)';
      console.log(newProduct)
      pool
      .query(chekSupplierId,[newProduct])
      .then(result =>{
          if(result.rows.length > 0){
              pool.query(newProduct,[supplierId,productName, productPrice])
              .then(()=> res.send('newProduct created'))
              .catch(error =>console.error('something is worng when adding product' + error))
          }else{
            res.status(400).send("supplier_id " + supplierId + " does not exist")
          }
      })
      .catch(error => console.error("Something is wrong " + error))
  }) ///
  // Add a new POST endpoint /customers/:customerId/orders to create a new order (including an order date, and an order reference)
  // for a customer. Check that the customerId corresponds to an existing customer or return an error
  app.post("/customers/:customerId/orders", (req, res) => {
    let customerId = req.params.customerId;
    let orderDate = req.body.order_date;
    let orderRef = req.body.order_reference;

    const checkCustomer = "select * from customers where id = $1"
    const insertOrder = "insert into orders(order_date, order_reference, customer_id) values($1, $2, $3)";
    pool.query(checkCustomer, [customerId])
        .then(result => {
            if (result.rows.length > 0) {
                pool.query(insertOrder, [orderDate, orderRef, customerId])
                    .then(() => res.send("Order created"))
                    .catch(error => console.error("Something is wrong when adding new order" + error))
            } else {
                res.status(400).send("Customer id " + customerId + " does not exist")
            }
        })
        .catch(error => console.error("Something is wrong " + error))
})





app.listen(port, function(){
    console.log('server is listening on 30001 ')
});