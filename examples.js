
(() => {
  // mysql/mysql2
  const sql = require('./index.js');
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
  console.log('mysql', query);
})();

(() => {
  // postgres
  const sql = require('./index.js').withOptions({
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

  console.log('postgres', query);
})();

(() => {
  // custom output keys
  const sql = require('./index.js').withOptions({
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

  console.log('custom output keys', query);
})();

(() => {
  // custom prepare strategy
  const sql = require('./index.js').withOptions({
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

  console.log('custom prepare strategy', query);
})();

(() => {
  // custom data options
  const sql = require('./index.js').withOptions({
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

  console.log('custom data options', query);
})();

(() => {
  // more complex custom output shape
  const sql = require('./index.js').withOptions({
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

  console.log('more complex output shape', query);
})();

(() => {
  // Appending to a query with conditions
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

  console.log('append', query);
})();