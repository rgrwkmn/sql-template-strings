# SQL Template Strings

Turn template literals into prepared statements in the output format of your choosing.

Based on [felixfbecker/node-sql-template-strings](https://github.com/felixfbecker/node-sql-template-strings) with a few practically unecessary differences:

1. Customizable output for any SQL query method--supports mysql/mysql2 query object format by default.
2. Customizable query string substitution.
3. Convenient handling of variables that you want to use in the query but are not part of the prepared statement data.
4. Convenient array handling.

# Usage

## Mysql/Mysql2

Works with mysql/mysql2 library with no customizations.

Notice that the extra preceding `$` in `$${table}` causes the value to be literally concatenated into the query string, while other variables are prepared and added to the values array.

```javascript
const sql = require('sql-template-strings');
const table = 'projects';
const usefulness = 'redundant';
const limit = 25;
const offset = 0;
const query = sql`
  SELECT * FROM $${table}
  WHERE usefulness=${usefulness}
  LIMIT ${limit}
  OFFSET ${offset}
`
console.log(query);
/*
Query {
  sql: '\n' +
    '    SELECT * FROM projects\n' +
    '    WHERE usefulness=?\n' +
    '    LIMIT ?\n' +
    '    OFFSET ?\n' +
    '  ',
  values: [ 'redundant', 25, 0 ]
}
*/
```

## Postgres

Set the queryTextKey and sqlPrepareStrat as shown below to support postgres.

Notice that the extra preceding `$` in `$${table}` is causes the value to be literally concatenated into the query string, while other variables are prepared and added to the values array.

```javascript
const sql = require('sql-template-strings').withOptions({
  queryTextKey: 'text',
  sqlPrepareStrat: '$'
});
const table = 'projects';
const usefulness = 'redundant';
const limit = 25;
const offset = 0;
const query = sql`
  SELECT * FROM $${table}
  WHERE usefulness=${usefulness}
  LIMIT ${limit}
  OFFSET ${offset}
`.withData({ name: 'myBestQuery' });

console.log(query);
/*
Query {
  text: '\n' +
    '    SELECT * FROM projects\n' +
    '    WHERE usefulness=$1\n' +
    '    LIMIT $2\n' +
    '    OFFSET $3\n' +
    '  ',
  values: [ 'redundant', 25, 0 ],
  name: 'myBestQuery'
}
*/
```

## Custom Output Keys

Support your DB library's requirements for prepared statement and data.

```javascript
const sql = require('sql-template-strings').withOptions({
  queryTextKey: 'text',
  dataArrayKey: 'values'
});
const table = 'projects';
const usefulness = 'redundant';
const limit = 25;
const offset = 0;
const query = sql`
  SELECT * FROM $${table}
  WHERE usefulness=${usefulness}
  LIMIT ${limit}
  OFFSET ${offset}
`;

console.log(query);
/*
Query {
  text: '\n' +
    '    SELECT * FROM projects\n' +
    '    WHERE usefulness=?\n' +
    '    LIMIT ?\n' +
    '    OFFSET ?\n' +
    '  ',
  values: [ 'redundant', 25, 0 ]
}
*/
```

## Custom Prepare Strategy

Support your DB's requirements for the prepared statement substitution string.

```javascript
const sql = require('sql-template-strings').withOptions({
  sqlPrepareStrat: (index, substitution, literal) => `#${index}`
});
const table = 'projects';
const usefulness = 'redundant';
const limit = 25;
const offset = 0;
const query = sql`
  SELECT * FROM $${table}
  WHERE usefulness=${usefulness}
  LIMIT ${limit}
  OFFSET ${offset}
`;

console.log(query);
/*
Query {
  sql: '\n' +
    '    SELECT * FROM projects\n' +
    '    WHERE usefulness=#0\n' +
    '    LIMIT #1\n' +
    '    OFFSET #2\n' +
    '  ',
  values: [ 'redundant', 25, 0 ]
}
*/
```

## Custom Output Data Options

Add default options supported by your DB library to every query, or individual queries as desired.

Add an `addDefaultData` object with the `withOptions` method to create a custom `sql` template function that will always include the `addDefaultData` object.

Use the `withData` method on the Query to add custom data to that specific query.

```javascript
const sql = require('sql-template-strings').withOptions({
  addDefaultData: {
    timeout: 60000
  }
});
const table = 'projects';
const usefulness = 'redundant';
const limit = 25;
const offset = 0;
const query = sql`
  SELECT * FROM $${table}
  WHERE usefulness=${usefulness}
  LIMIT ${limit}
  OFFSET ${offset}
`.withData({ extraOptions: true });

console.log(query);
/*
 Query {
  sql: '\n' +
    '    SELECT * FROM projects\n' +
    '    WHERE usefulness=?\n' +
    '    LIMIT ?\n' +
    '    OFFSET ?\n' +
    '  ',
  values: [ 'redundant', 25, 0 ],
  timeout: 60000,
  extraOptions: true
}
*/
```

## Adding to Queries with Append

Construct a query using conditions, loops, etc with the `append` method. It automatically prepends a space character to each use of append.

```javascript
const sql = require('sql-template-strings');
const table = 'projects';
const usefulness = 'redundant';
const limit = 25;
const offset = 0;
const orderBy = 'openIssues';
const orderDirection = 'DESC';
const query = sql`
  SELECT * FROM $${table}
  WHERE usefulness=${usefulness}
  LIMIT ${limit}
  OFFSET ${offset}
`

if (orderBy) {
  query.append(sql`ORDER BY ${orderBy} ${orderDirection}`);
}

console.log(query);
/*
 Query {
  sql: '\n' +
    '    SELECT * FROM projects\n' +
    '    WHERE usefulness=?\n' +
    '    LIMIT ?\n' +
    '    OFFSET ?\n' +
    '   ORDER BY ? ?',
  values: [ 'redundant', 25, 0, 'openIssues', 'DESC' ]
}
*/
```

## Automatically handle arrays of data

Using an array in the sql template will automatically join/prepare in the statement like so:

```javascript
const sql = require('sql-template-strings');
const ids = [1, 2, 3, 4, 5];
const query = sql`
  SELECT * FROM my_first_table
  WHERE id IN VALUES(${ids})
`
console.log(query);
/*
Query {
  sql: '\n' +
    '    SELECT * FROM my_first_table\n' +
    '    WHERE id IN VALUES(?,?,?,?,?)\n' +
    '  ',
  values: [ 1, 2, 3, 4, 5 ]
}
*/
```
