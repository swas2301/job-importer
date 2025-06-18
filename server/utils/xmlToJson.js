
const xml2js = require('xml2js');

const parseXML = async (xml) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  return result;
};

module.exports = parseXML;
