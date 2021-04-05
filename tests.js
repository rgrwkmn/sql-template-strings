const assert = require('assert');
const sql = require('./index.js');
const queryNoData = sql`my_first_query`;

assert.ok(
  queryNoData.sql,
  'query should have default sql key'
);
assert.ok(
  Array.isArray(queryNoData.values),
  'query should have default values key and it should be an array'
);
assert.equal(
  queryNoData.sql,
  'my_first_query',
  'query with no substitutions should return the same text'
);
assert.equal(
  queryNoData.withData({
    queryPriority: 'MOST_IMPORTANT_EVER'
  }).queryPriority,
  'MOST_IMPORTANT_EVER',
  'query should merge in withData object'
);

const appendedQueryWithSql = queryNoData.append(
  sql`my_first_query_appendage`
);
assert.equal(
  appendedQueryWithSql.sql,
  'my_first_query my_first_query_appendage',
  'appended sql should concat sql with added space'
);

const appendedQueryWithString = queryNoData.append('my_first_query_appendage');
assert.equal(
  appendedQueryWithString.sql,
  'my_first_query my_first_query_appendage my_first_query_appendage',
  'appended sql should concat sql with added space'
);

const data1 = 1;
const data2 = '2';
const stringLiteral = 'stringLiteral'

const queryWithData = sql`data1(${1}) data2(${2}) stringLiteral($${stringLiteral})`;

assert.ok(
  queryWithData.values.length,
  2,
  'query values should be same length as data provided'
);
assert.equal(
  queryWithData.values[0],
  data1,
  'query values should match string order'
);
assert.equal(
  queryWithData.values[1],
  data2,
  'query values should match string order'
);
assert.equal(
  queryWithData.sql.match(/data1\((.+?)\)/)[1],
  '?',
  'query substitution 1 should be replaced with sqlPrepareStrat'
);
assert.equal(
  queryWithData.sql.match(/data2\((.+?)\)/)[1],
  '?',
  'query substitution 2 should be replaced with sqlPrepareStrat'
);
assert.equal(
  queryWithData.sql.match(/stringLiteral\((.+?)\)/)[1],
  stringLiteral,
  '$${substitution} should be substituted literally into the string'
);

const appendedData = 'append';
const appendedQueryWithData = queryWithData.append(
  sql`moreData(${appendedData})`
);
assert.equal(
  appendedQueryWithData.sql,
  'data1(?) data2(?) stringLiteral(stringLiteral) moreData(?)',
  'appended query should be added to sql'
);
assert.equal(
  queryWithData.values[2],
  appendedData,
  'appended data should be added'
);



const customSql = sql.withOptions({
  queryTextKey: 'text',
  dataArrayKey: 'data',
  sqlPrepareStrat: '$',
  addDefaultData: {
    annoyDbaWithTableLockingLongQueries: 'always'
  }
});

const customQueryData = 1;
const customQuery = customSql`my_custom_query(${customQueryData})`;

assert.equal(
  customQuery.annoyDbaWithTableLockingLongQueries,
  'always',
  'query should include addDefaultData'
);
assert.equal(
  customQuery.text,
  'my_custom_query($1)',
  'custom queryTextKey should be used and custom prepare strat as well'
);
assert.ok(
  Array.isArray(customQuery.data),
  'custom dataArrayKey should be used'
);
assert.equal(
  customQuery.data[0],
  customQueryData,
  'custom dataArrayKey should have the correct data'
);

const customPrepareStrat = sql.withOptions({
  sqlPrepareStrat: (index, substitution, literal) => {
    return `#${index}`
  }
});

const customPrepareStratQuery = customPrepareStrat`custom(${1})`;

assert.equal(
  customPrepareStratQuery.sql,
  'custom(#0)',
  'custom sqlPrepareStrat function should be used if set'
);

const ids = [1, 2, 3, 4, 5, 6, 7];
const arraySubstitution = sql`VALUES(${ids})`;

assert.equal(arraySubstitution.sql, 'VALUES(?,?,?,?,?,?,?)');
assert.deepEqual(arraySubstitution.values, ids);

console.log('tests completed successfully');