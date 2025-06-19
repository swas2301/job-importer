// changeStream.js
const ImportLog = require('../models/ImportLog');
const { getIO } = require('../socket');

function startImportLogWatcher() {
  const changeStream = ImportLog.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', (change) => {
    if (['insert', 'update', 'replace'].includes(change.operationType)) {
      const updatedLog = change.fullDocument;
      getIO().emit('importLogUpdated', updatedLog); // ✅ This is what frontend listens to
    }
  });

  changeStream.on('error', (err) => {
    console.error('Change stream error:', err.message);
  });
}

module.exports = { startImportLogWatcher };
