# mysql_lt

A simple ORM for MySQL databases.

## Installation

```bash
npm install mysql_lt
```
## Usage

```
import MysqlOrm from 'mysql-orm';

MysqlOrm.connect({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_db'
}).then(() => {
    // Perform database operations
    MysqlOrm.select('*').from('users').where('id', '=', 1).get().then(results => {
        console.log(results);
    });
}).catch(err => {
    console.error(err);
});
```
## API
* connect(config): Connect to the MySQL database.
* where(column, condition, value): Add a WHERE condition.
* orWhere(column, condition, value): Add an OR WHERE condition.
* select(fields): Specify fields for selection.
* limit(limit): Set a limit on the number of rows returned.
* Offset(number): Set an offset for the rows returned.
* GroupBy(fields): Specify GROUP BY fields.
* OrderBy(column, order): Specify ORDER BY columns.
* Join(table, t1, t2): Add an INNER JOIN.
* LeftJoin(table, t1, t2): Add a LEFT JOIN.
* RightJoin(table, t1, t2): Add a RIGHT JOIN.
* get(): Execute a SELECT query and return results.
* first(): Execute a SELECT query and return the first result.
* all(): Execute a SELECT query and return all results.
* update(data): Execute an UPDATE query.
* delete(): Execute a DELETE query.
* save(): Insert new data into the database.
