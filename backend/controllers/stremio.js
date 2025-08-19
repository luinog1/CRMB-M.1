const addonService = require('../services/addon');

const getManifest = (req, res) => {
  const manifest = addonService.getManifest();
  res.json(manifest);
};

const getCatalog = (req, res) => {
  const { type, id } = req.params;
  addonService.getCatalog(type, id)
    .then(catalog => res.json(catalog))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error getting catalog');
    });
};

const getMeta = (req, res) => {
  const { type, id } = req.params;
  addonService.getMeta(type, id)
    .then(meta => res.json(meta))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error getting meta');
    });
};

const getStream = (req, res) => {
  const { type, id } = req.params;
  addonService.getStream(type, id)
    .then(stream => res.json(stream))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error getting stream');
    });
};

module.exports = {
  getManifest,
  getCatalog,
  getMeta,
  getStream,
};