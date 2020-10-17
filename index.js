class SqlTemplateLiteralSubstitutionError extends Error {}
class SqlTemplateInvalidAppendageError extends Error {}

const defaultOptions = {
  queryTextKey: 'sql',
  dataArrayKey: 'values',
  // ?, $, Function
  sqlPrepareStrat: '?',
  addDefaultOptions: null,
  shape: (sql, values, options) => {
    return Object.assign({ sql, values }, options);
  }
};

function withOptions(options) {
  const {
    queryTextKey, dataArrayKey, sqlPrepareStrat, addDefaultOptions, shape
  } = Object.assign({}, defaultOptions, options);

  class Query {
    constructor(sql, data) {
      this[queryTextKey] = sql;
      this[dataArrayKey] = data;
      if (addDefaultOptions) {
        this.withData(addDefaultOptions);
      }
    }
    append(appendage) {
      if (appendage instanceof Query) {
        this[queryTextKey] += ` ${appendage[queryTextKey]}`
        this[dataArrayKey] = this[dataArrayKey].concat(appendage[dataArrayKey]);
        return this;
      }

      if (typeof appendage === 'string') {
        this[queryTextKey] += ` ${appendage}`
        return this;
      }

      throw new SqlTemplateInvalidAppendageError();
    }
    withData(withOpts) {
      Object.assign(this, withOpts);
      return this;
    }
    shape(options) {
      return shape(
        this[queryTextKey],
        this[dataArrayKey],
        Object.assign({}, addDefaultOptions, options)
      );
    }
  }

  function sql(literalSections, ...subsitutions) {
    const { raw } = literalSections;

    let sql = '';
    const data = [];
    let dataIndex = 0;

    // eslint-disable-next-line id-length
    subsitutions.forEach((subsitution, i) => {
      let literal = raw[i];

      if (literal.endsWith('$')) {
        if (typeof subsitution !== 'string') {
          throw new SqlLiteralSubstitutionError();
        }
        // accept the value as-is
        literal = literal.slice(0, -1);
        sql += literal;
        sql += subsitution;
        return;
      }

      sql += literal;
      if (typeof sqlPrepareStrat === 'function') {
        sql += sqlPrepareStrat(dataIndex, subsitution, literal);
      } else {
        sql += sqlPrepareStrat === '?' ? '?' : `$${dataIndex+1}`;
      }

      data.push(subsitution);
      dataIndex++;
    });

    sql += raw[raw.length - 1];

    return new Query(sql, data);
  };

  return sql;
}

module.exports = withOptions();
module.exports.withOptions = withOptions;