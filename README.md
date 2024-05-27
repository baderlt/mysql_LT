# Mysql_Lt

A simple ORM for MySQL databases.

[![npm version](https://badge.fury.io/js/mysql-orm.svg)](https://badge.fury.io/js/mysql-orm)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Examples](#examples)
  - [Insert](#insert)
  - [Select](#select)
  - [Update](#update)
  - [Delete](#delete)
  - [Join](#join)
  - [Aggregate Functions](#aggregate-functions)
  - [dbStatement](#dbstatement)
- [Support](#support)


## Installation

```bash
npm install mysql_lt

```
## Usage

```javascript
import MysqlOrm from 'mysql-orm';

MysqlOrm.connect({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_db'
})

/// model User extends from MysqlOrm
class User extends MysqlOrm  {
    static table ="users";
    static _filables=["nom","Email","password"];
  }
    // insert new User
    const user= new User({nom:"bader","Email":"baderlatrache10@gmail.com","password":"12345678"});
     user.save();
    // select operation
    User.select('*').where('nom', '=', "bader").get().then(results => {
        console.log(results);
    });

```
## API
* connect(config:Object): Connect to the MySQL database.
* where(column:String, condition:String, value:Any): Add a WHERE condition.
* orWhere(column:String, condition:String, value:Any): Add an OR WHERE condition.
* select(fields:String): Specify fields for selection.
* limit(limit:Number): Set a limit on the number of rows returned.
* Offset(number:Number): Set an offset for the rows returned.
* GroupBy(fields:String): Specify GROUP BY fields.
* having(column:String,condition:String,value:Any): Adds a HAVING condition .
* OrderBy(column:String, order:String): Specify ORDER BY columns.
* Join(table:String, t1:String, t2:String): Add an INNER JOIN.
* LeftJoin(table:String, t1:String, t2:String): Add a LEFT JOIN.
* RightJoin(table:String, t1:String, t2:String): Add a RIGHT JOIN.
* get(): Execute a SELECT query and return results.
* first(): Execute a SELECT query and return the first result.
* all(): Execute a SELECT query and return all results.
* update(data:Object): Execute an UPDATE query.
* delete(): Execute a DELETE query.
* save(): Insert new data into the database.
* statement(query:String,params:Array) : Execute a raw SQL statement.

## Configuration
```javascript
const config={
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_db'
}
MysqlOrm.connect(config)

```
## Examples
## Insert
  ```javascript
  const user= new User({nom:"bader","Email":"baderlatrache10@gmail.com","password":"12345678"}).save();
  ```
## Select 
  ```javascript
  // simple 
  User.select('*').where('nom', '=', "bader").get()
  // with or condition "orWhere()"
  User.select('*').where('nom', '=', "bader").orWhere("nom","=","alami").get()
  // select specify fields for selection in the query
  User.select('nom,id').where('nom', '=', "bader").select("password").get()
  ```
## Update   
  ```javascript
 // Update user information
 User.where('id', '=', 1).update({ nom: "new_name",Email: "new_email@gmail.com"}); 
  ```
## Delete 
  ```javascript
 // Delete user by ID
 User.where('id', '=', 1).delete()
```
## Join 
 ```javascript
  // Inner join with another table
User.select('users.nom', 'profiles.bio')
  .Join('profiles', 'users.id', 'profiles.user_id')
  .where('users.nom', '=', "bader").GroupBy("profiles.type").get()

// Left join with another table
User.select('users.nom', 'profiles.bio')
.LeftJoin('profiles', 'users.id', 'profiles.user_id')
 .where('users.nom', '=', "bader").OrderBy("nom","Desc").get().

// Right join with another table
User.select('users.nom', 'profiles.bio')
.ReftJoin('profiles', 'users.id', 'profiles.user_id')
 .where('users.nom', '=', "bader").OrderBy("id","Desc").get().
```
## Aggregate Functions
```javascript
// Count users
User.select('COUNT(*) as count').get();
// Group by and having conditions
User.select('nom', 'COUNT(*) as count').GroupBy('nom').having('count', '>', 1).get();
```
## dbStatement 
```javascript
// Define the SQL query 
const query = 'SELECT * FROM users WHERE nom = ?';
// Define the parameters for the query. This is an array containing the value to match against 'nom'.
const params = ['bader'];
// Execute the SQL query using the statement method of MysqlOrm. This method takes the query and parameters as arguments.
MysqlOrm.statement(query, params)
    .then(result => {
        console.log('Query executed successfully:', result);
    })
    .catch(error => {
        console.error('Error executing query:', error);
    });
```

## Support
  If you have any questions or need help, feel free to open an issue or contact me directly at baderlatrache10@gmail.com

  



  
