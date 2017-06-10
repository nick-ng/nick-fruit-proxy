const contentful = require('contentful');
const { objectIndexer } = require('../utils');

const queryParser = (options = {}) => (query = {}) => Object.keys(query).reduce((a, b) => Object.assign(a, { [`fields.${b}`]: query[b] }), options);

const contentfulCleaner = (a) => {
  if (a instanceof Object) {
    return Object.keys(a).reduce((prev, curr) => {
      if (curr === 'sys') {
        return prev;
      }
      if (curr === 'fields') {
        return Object.assign({}, prev, contentfulCleaner(a[curr]));
      }
      if (curr === 'file') {
        return Object.assign({}, prev, { url: a[curr].url });
      }
      return Object.assign({}, prev, { [curr]: contentfulCleaner(a[curr]) });
    }, {});
  }
  if (a instanceof Array) {
    return a.map(b => contentfulCleaner(b));
  }
  return a;
};

const getFruitList = client => async (req, res) => {
  const response = await client.getEntries(queryParser({ content_type: 'fruits' })(req.query));
  res.send(objectIndexer('points')(contentfulCleaner(response.items)));
};

module.exports = space => (accessToken) => {
  const client = contentful.createClient({
    space,
    accessToken,
  });

  return {
    getFruitList: getFruitList(client),
  };
};
