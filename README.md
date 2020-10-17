# SQL Template Strings

Turn template literals into prepared statements in the output format of your choosing.

Based on [felixfbecker/node-sql-template-strings](https://github.com/felixfbecker/node-sql-template-strings) with a few practically unecessary differences:

1. Customizable output for any SQL query method--supports mysql/mysql2 query object format by default.
2. Customizable query string substitution.
2. Convenient handling of variables that you want to use in the query but are not part of the prepared statement data.

# Usage

## Mysql/Mysql2

```javascript
const sql = require('ignorant-sql-template-strings');
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

```javascript
const sql = require('ignorant-sql-template-strings').withOptions({
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

```javascript
const sql = require('ignorant-sql-template-strings').withOptions({
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

```javascript
const sql = require('ignorant-sql-template-strings').withOptions({
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

```javascript
const sql = require('ignorant-sql-template-strings').withOptions({
  addDefaultOptions: {
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

## More Complex Custom Output Shape

```javascript
const sql = require('ignorant-sql-template-strings').withOptions({
  addDefaultOptions: {
    timeout: 60000
  },
  shape: (sql, values, options) => {
    return {
      query: {
        text: sql,
        data: values
      },
      additionalOptions: options
    }
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
`.withData({ name: 'myBestQuery' }).shape({ complexity: 'intensifies' });

console.log(query);
/*
{
  query: {
    text: '\n' +
      '    SELECT * FROM projects\n' +
      '    WHERE usefulness=?\n' +
      '    LIMIT ?\n' +
      '    OFFSET ?\n' +
      '  ',
    data: [ 'redundant', 25, 0 ]
  },
  additionalOptions: { timeout: 60000, complexity: 'intensifies' }
}
*/
```

## Adding to Queries with Append

```javascript
const sql = require('./index.js');
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

