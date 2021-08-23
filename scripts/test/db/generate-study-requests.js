import yargs from 'yargs';

import Random from '@/lib/Random';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';

const args = yargs
  .option('b', {
    alias: 'bulk',
    demandOption: true,
    describe: 'proportion of bulk requests',
    type: 'number',
  })
  .option('r', {
    alias: 'requests',
    demandOption: true,
    describe: 'number of requests to generate',
    type: 'number',
  })
  .argv;

async function getCentrelineAll() {
  const sql = `
SELECT
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON(ST_MakePoint(lng, lat))::json AS geom
FROM centreline.intersections
UNION ALL
SELECT
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON(ST_MakePoint(lng, lat))::json AS geom
FROM centreline.midblocks`;
  return db.manyOrNone(sql);
}

function correctStudyRequestLocation(transientStudyRequest, centrelineAll) {
  const centreline = Random.choice(centrelineAll);
  return {
    ...transientStudyRequest,
    ...centreline,
  };
}

function correctStudyRequestBulkLocation(transientStudyRequestBulk, centrelineAll) {
  const studyRequests = transientStudyRequestBulk.studyRequests.map(
    transientStudyRequest => correctStudyRequestLocation(transientStudyRequest, centrelineAll),
  );
  return {
    ...transientStudyRequestBulk,
    studyRequests,
  };
}

async function generateAndLoad({ bulk, requests }) {
  const centrelineAll = await getCentrelineAll();
  const usersAll = await UserDAO.all();

  // generate requests
  for (let i = 0; i < requests; i++) {
    const persistedUser = Random.choice(usersAll);
    if (Math.random() < bulk) {
      let transientStudyRequestBulk = generateStudyRequestBulk();
      transientStudyRequestBulk = correctStudyRequestBulkLocation(
        transientStudyRequestBulk,
        centrelineAll,
      );
      /* eslint-disable-next-line no-await-in-loop */
      transientStudyRequestBulk = await StudyRequestBulk.create.validateAsync(
        transientStudyRequestBulk,
      );
      /* eslint-disable-next-line no-await-in-loop */
      await StudyRequestBulkDAO.create(
        transientStudyRequestBulk,
        persistedUser,
      );
    } else {
      let transientStudyRequest = generateStudyRequest();
      transientStudyRequest = correctStudyRequestLocation(transientStudyRequest, centrelineAll);
      /* eslint-disable-next-line no-await-in-loop */
      transientStudyRequest = await StudyRequest.create.validateAsync(
        transientStudyRequest,
      );
      /* eslint-disable-next-line no-await-in-loop */
      await StudyRequestDAO.create(
        transientStudyRequest,
        persistedUser,
      );
    }
  }

  db.$pool.end();
}

generateAndLoad(args);
