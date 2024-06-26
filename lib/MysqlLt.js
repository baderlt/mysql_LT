import mysql from 'mysql';

class MysqlOrm {

    #data;
    // Static properties to store query conditions, fields, limits, etc.
    static _transactions = { run: false, requests: [] };
    static _conditions_ = [];
    static _select_Fields = "";
    static _limit_ = null;
    static _Group_By = "";
    static _order_by = [];
    static _Join_ = [];
    static _offset_ = null;
    static _having = [];
    // Constructor to initialize the database connection and table name
    constructor(data) {
        this.table = this.constructor.table || this.constructor.name.toLowerCase() + "s";
        this.db = null;
        if (!(typeof data == 'object' && data != null && !Array.isArray(data))) { throw new Error("Invalid data type:" + data) }
        let keys_data = Object.keys(data).sort();
        if (!Array.isArray(this.constructor._filables) || !this.constructor._filables) { throw new Error(`You must add the fillables in the model "${this.constructor.name}" like (static _filables=${[...keys_data]})`); }
        let keys_filables = this.constructor._filables.sort();
        // Check for missing or mismatched keys
        for (let i = 0; i < keys_filables.length; i++) {
            if (keys_filables[i] !== keys_data[i]) {
                if (!keys_data[i]) {
                    throw new Error(`Missing required field: "${keys_filables[i]}"`);
                } else {
                    throw new Error(`Unexpected field "${keys_data[i]}" is not allowed`);
                }
            }
        }
        // Check for extra keys in data that are not in filables
        if (keys_data.length > keys_filables.length) {
            console.log(`Extra fields found in data that are not in the filables model`);
        }
        this.#data = data;
    }

    // Static method to reset all static properties (cleanup method)
    static destroyInstance() {
        this._conditions_ = [];
        this._select_Fields = "";
        this._limit_ = null;
        this._Group_By = "";
        this._order_by = [];
        this._Join_ = [];
        this._offset_ = null;
        this._having = [];
        return;
    }

    // Static method to connect to the MySQL database using the provided config
    static connect(config) {
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection(config);
            connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to MySQL database: ' + err.stack);
                    reject(false);
                    return;
                }
                MysqlOrm.db = connection;
                console.log('Connected to MySQL database.');
                resolve(true);
            });
        });
    }

    // Static method to add a WHERE condition to the query
    static where(column, condition = "=", value) {
        this._conditions_ = [...this._conditions_, { type: " and", column, condition, value }];
        return this;
    }
    // Static method to add an OR WHERE condition to the query
    static orWhere(column, condition = "=", value) {
        this._conditions_ = [...this._conditions_, { type: "  OR", column, condition, value }];
        return this;
    }
    // Static method to specify fields for selection in the query
    static select(fields) {
        this._select_Fields += this._select_Fields != "" ? "," + fields : fields;
        return this;
    }
    /// Static method to set a limit on the number of rows returned
    static limit(limit = null) {
        if (limit != null && Number.isInteger(parseInt(limit)))
            this._limit_ = parseInt(limit)

        return this;
    }
    // Static method to set an offset for the rows returned
    static Offset(number = null) {
        if (number != null && Number.isInteger(parseInt(number)))
            this._offset_ = number;

        return this;
    }
    // Static method to specify GROUP BY fields
    static GroupBy(fields = null) {
        if (fields != null) {
            this._Group_By += this._Group_By != "" ? "," + fields : fields;
        }
        return this;
    }
    //Adds a HAVING condition to the query
    static having(column, condition, value) {
        this._having.push({ column, condition, value });
        return this;
    }
    // Static method to specify ORDER BY columns
    static OrderBy(column, order = "asc") {
        this._order_by.push({ column, order });
        return this;
    }

    // Static method to specify an INNER JOIN
    static Join(table, t1, t2) {
        if (table || t1 || t2) {
            this._Join_ = [...this._Join_, { Operation: 'INNER JOIN', table, t1, t2 }];
        }
        return this;
    }
    /// Static method to specify a LEFT JOIN 
    static LeftJoin(table, t1, t2) {
        if (table || t1 || t2) {
            this._Join_ = [...this._Join_, { Operation: "LEFT JOIN ", table, t1, t2 }];
        }
        return this;
    }
    // Static method to specify a RIGHT JOIN
    static RightJoin(table, t1, t2) {
        if (table || t1 || t2) {
            this._Join_ = [...this._Join_, { Operation: "RIGHT JOIN ", table, t1, t2 }];
        }
        return this;
    }

    // Static method to execute a SELECT query
    static get() {
        const { query, params } = this.GetQuery("select");
        this.destroyInstance();
        return this.statement(query, params)
    }

    // Static method to execute a SELECT query and return the first result 
    static first() {
        let { query, params } = this.GetQuery("select");
        this.destroyInstance();
        if (this._limit_ == null) {
            query += ` LIMIT 1`
            return this.statement(query, params);
        }
        return this.statement(query, params);

    }

    // Static method to execute a SELECT query and return all results 
    static all() {
        let query = `select ${this._select_Fields != "" ? this._select_Fields : "*"} from ${this.table}`;
        this.destroyInstance();
        return this.statement(query, []);
    }

    // Static method to execute an UPDATE query
    static update(data) {
        const { query, params } = this.GetQuery("update", data);
        this.destroyInstance();
        if (this._transactions.run) {
            this._transactions.requests.push({ query, params });
            return;
        } else {
            return this.statement(query, params);
        }
    }

    // Static method to execute a DELETE query
    static delete() {
        const { query, params } = this.GetQuery("delete");
        this.destroyInstance();
        if (this._transactions.run) {
            this._transactions.requests.push({ query, params });
            return;
        }
        return this.statement(query, params);
    }

    // Static method to execute a given SQL statement 
    static statement(query, params) {
        return new Promise((resolve, reject) => {
            if (MysqlOrm.db == null) reject("No database connection");
            MysqlOrm.db.query(
                query,
                params,
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
    }


    /// start a transaction 
    static beginTransaction() {
        this._transactions = { ...this._transactions, run: true };
    }
    /// commit a transaction
    static Commit() {
        if (!this._transactions.run) {
            return new Error('Cannot commit a transaction without starting');
        }
        if (this._transactions.requests.length == 0) {
            return new Error('Cannot commit a transaction without starting requests');
        }

        return new Promise(async (resolve, reject) => {
            if (MysqlOrm.db == null) reject("No database connection");
            try {
                await MysqlOrm.db.beginTransaction((err) => {
                    if (err) reject(err);

                    const executeRecursive = (index) => {
                        if (this._transactions.requests[index]) {
                            this.statement(this._transactions.requests[index].query, this._transactions.requests[index].params)
                                .then(() => executeRecursive(index + 1))
                                .catch((err) => {
                                    MysqlOrm.db.rollback(() => {
                                        this._transactions = { run: false, requests: [] }
                                        reject(err);
                                    })
                                })
                        } else {

                            MysqlOrm.db.commit(function (err) {
                                if (err) {
                                    MysqlOrm.db.rollback(function () {
                                        this._transactions = { run: false, requests: [] }
                                        reject(err)
                                    });
                                } else {
                                    this._transactions = { run: false, requests: [] }
                                    resolve({ status: 'success' });
                                }
                            });

                        }
                    }
                    executeRecursive(0);


                });
            } catch (e) {
                await MysqlOrm.db.rollback()
                await MysqlOrm.db.end()
                this._transactions = { run: false, requests: [] }
                return reject(e)
            }
        });
    }

    // Method to save (insert) data into the database
    save() {
        if (!this.#data) reject(`Missing data to insert into ${this.table}`);
        let keys = Object.keys(this.#data).join(",");
        let values = Object.values(this.#data);
        let params = new Array(values.length).fill("?").join(",");
        let query = ` INSERT INTO ${this.table} (${keys}) VALUES (${params})`;
        if (MysqlOrm._transactions.run) {
            MysqlOrm._transactions.requests.push({ query, params: values });
            return;
        }
        return MysqlOrm.statement(query, values);
    }

    // Static method to generate the full SQL query based on the operation type
    static GetQuery(Operation = null, data = null) {
        let query = "";
        let params = [];
        switch (Operation) {
            case "update":
                if (data == null) return { query: `update ${this.table} where 1=?`, params: 1 };
                query = `Update ${this.table}`;
                let keys = Object.keys(data);
                if (keys.length > 0) {
                    query += " SET "
                    for (let i of keys) {
                        query += ` ${i} = ?  ,`;
                        params.push(data[i]);
                    }
                    query = query.substring(0, query.length - 1);
                }
                if (this._conditions_.length > 0) {
                    query += ` Where  ${this._conditions_[0].column} ${this._conditions_[0].condition}  ? `;
                    params.push(this._conditions_[0].value);
                    for (let c = 1; c < this._conditions_.length; c++) {
                        query += ` ${this._conditions_[c].type} ${this._conditions_[c].column} ${this._conditions_[c].condition} ? `;
                        params.push(this._conditions_[c].value);
                    }
                }

                return { query, params };


            case "delete":
                query = `delete from ${this.table} Where `;
                if (this._conditions_.length > 0) {
                    query += ` ${this._conditions_[0].column} ${this._conditions_[0].condition}  ? `;
                    params.push(this._conditions_[0].value);
                    for (let c = 1; c < this._conditions_.length; c++) {
                        query += ` ${this._conditions_[c].type} ${this._conditions_[c].column} ${this._conditions_[c].condition} ? `;
                        params.push(this._conditions_[c].value);
                    }
                } else {
                    query += ' 1 = ?';
                    params.push(1);
                }
                return { query, params };

            case "select":
                query = `select ${this._select_Fields == "" ? "*" : this._select_Fields} from ${this.table} `;
                if (this._Join_.length > 0) {
                    for (let j of this._Join_) {
                        query += ` ${j.Operation} ${j.table} on ${j.t1} = ${j.t2} `
                    }
                }

                if (this._conditions_.length > 0) {
                    query += `where ${this._conditions_[0].column} ${this._conditions_[0].condition} ?`;
                    params.push(this._conditions_[0].value);
                    for (let c = 1; c < this._conditions_.length; c++) {
                        query += ` ${this._conditions_[c].type} ${this._conditions_[c].column} ${this._conditions_[c].condition} ? `;
                        params.push(this._conditions_[c].value);
                    }
                }
                if (this._Group_By != "") {
                    query += ` GROUP BY ${this._Group_By} `;
                }

                if (this._having.length > 0) {
                    query += ` HAVING ${this._having[0].column} ${this._having[0].condition} ?`;
                    params.push(this._having[0].value);
                    for (let h = 1; h < this._having.length; h++) {
                        query += ` AND ${this._having[h].column} ${this._having[h].condition} ?`;
                        params.push(this._having[h].value);
                    }
                }

                if (this._order_by.length > 0) {
                    query += ` ORDER BY `;
                    for (let o of this._order_by) {
                        query += ` ${o.column} ${o.order} ,`;
                    }
                    query = query.substring(0, query.length - 1);
                }
                if (this._limit_ != null) {
                    query += ` LIMIT ${this._limit_}`;
                }
                if (this._offset_ != null) {
                    query += ` OFFSET ${this._offset_}`;
                }
                return { query, params };

            default: return { query, params };
        }

    }


}

export default MysqlOrm;
