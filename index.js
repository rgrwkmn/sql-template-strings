class SqlTemplateLiteralSubstitutionError extends Error {}
class SqlTemplateInvalidAppendageError extends Error {}

const defaultOptions = {
  queryTextKey: 'sql',
  dataArrayKey: 'values',
  // ?, $, Function
  sqlPrepareStrat: '?',
  addDefaultData: null
};

function withOptions(options) {
  const {
    queryTextKey, dataArrayKey, sqlPrepareStrat, addDefaultData
  } = Object.assign({}, defaultOptions, options);

  class Query {
    constructor(sql, data) {
      this[queryTextKey] = sql;
      this[dataArrayKey] = data;
      if (addDefaultData) {
        this.withData(addDefaultData);
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
  }

  function getPrepareSymbol(dataIndex, substitution, literal) {
    return typeof sqlPrepareStrat === 'function'
      ? sqlPrepareStrat(dataIndex, substitution, literal)
      : sqlPrepareStrat === '?'
      ? '?'
      : `$${dataIndex+1}`;
  }

  function sql(literalSections, ...substitutions) {
    const { raw } = literalSections;

    let sql = '';
    const data = [];
    let dataIndex = 0;

    // eslint-disable-next-line id-length
    substitutions.forEach((substitution, i) => {
      let literal = raw[i];

      if (literal.endsWith('$')) {
        if (typeof substitution !== 'string') {
          throw new SqlLiteralSubstitutionError();
        }
        // accept the value as-is
        literal = literal.slice(0, -1);
        sql += literal;
        sql += substitution;
        return;
      }

      sql += literal;

      const subIsArray = Array.isArray(substitution);

      if (subIsArray) {
        sql += substitution.map((sub) => {
          const prepareSymbol = getPrepareSymbol(dataIndex, sub, literal);
          data.push(sub);
          dataIndex++;
          return prepareSymbol;
        }).join(',');
      } else {
        sql += getPrepareSymbol(dataIndex, substitution, literal);
        data.push(substitution);
        dataIndex++;
      }
    });

    sql += raw[raw.length - 1];

    return new Query(sql, data);
  };

  return sql;
}

module.exports = withOptions();
module.exports.withOptions = withOptions;