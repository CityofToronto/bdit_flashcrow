const StudyRequestReasonDAO = require('../db/StudyRequestReasonDAO');
const StudyRequestStatusDAO = require('../db/StudyRequestStatusDAO');

const WebInitController = [];

/**
 * GET /web/init
 *
 * Provides all data required to initialize the web application interface.
 * This should NOT return any user-specific data.
 */
WebInitController.push({
  method: 'GET',
  path: '/web/init',
  options: {
    auth: { mode: 'try' },
  },
  handler: async () => {
    let [reasons, statii] = await Promise.all([
      StudyRequestReasonDAO.all(),
      StudyRequestStatusDAO.all(),
    ]);
    reasons = Array.from(reasons.values());
    statii = Array.from(statii.values());
    return {
      reasons,
      statii,
    };
  },
});

module.exports = WebInitController;
