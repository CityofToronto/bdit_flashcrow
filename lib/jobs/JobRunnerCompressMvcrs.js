/* eslint-disable class-methods-use-this */
import JobRunnerBase from '@/lib/jobs/JobRunnerBase';
import storageStrategy from '@/lib/io/storage/StorageStrategy';
import archiver from 'archiver';
import stream from 'stream';

const TEST_DATA = [
  {
    collisionId: '188066975',
    collisionYear: '2018',
    collisionMonth: '12',
  },
  {
    collisionId: '168050832',
    collisionYear: '2016',
    collisionMonth: '11',
  },
  {
    collisionId: '148040628',
    collisionYear: '2014',
    collisionMonth: '10',
  },
  {
    collisionId: '1320885',
    collisionYear: '2012',
    collisionMonth: '09',
  },
  {
    collisionId: '1190803',
    collisionYear: '2010',
    collisionMonth: '08',
  },
  {
    collisionId: '989802',
    collisionYear: '2007',
    collisionMonth: '07',
  },
  {
    collisionId: '844219',
    collisionYear: '2005',
    collisionMonth: '06',
  },
  {
    collisionId: '700583',
    collisionYear: '2003',
    collisionMonth: '05',
  },
  {
    collisionId: '504452',
    collisionYear: '2001',
    collisionMonth: '04',
  },
  {
    collisionId: '321271',
    collisionYear: '1999',
    collisionMonth: '03',
  },
  {
    collisionId: '110543',
    collisionYear: '1997',
    collisionMonth: '02',
  },
  {
    collisionId: '004171',
    collisionYear: '1995',
    collisionMonth: '01',
  },
  {
    collisionId: '32271',
    collisionYear: '1999',
    collisionMonth: '3',
  },
  {
    collisionId: '1143',
    collisionYear: '1991',
    collisionMonth: '02',
  },
  {
    collisionId: '104471',
    collisionYear: '1995',
    collisionMonth: '011',
  },
];

const BULK_MVCR_STORAGE_PATH = {
  path: 'mvcrBulk',
  filename: 'mvcrs_userx_locationy.zip',
};

class JobRunnerCompressMvcrs extends JobRunnerBase {
  async runImpl() {
    const mvcrs = TEST_DATA;
    const { path: bulkFilePath, filename: bulkFilename } = BULK_MVCR_STORAGE_PATH;

    const compressionTaskPromise = new Promise((resolve, reject) => {
      const archive = archiver('zip')
        .on('error', reject);

      const valueStream = stream.PassThrough()
        .on('error', reject)
        .on('end', () => resolve({ zipFileCreated: true }));

      archive.pipe(valueStream);

      const zipPromises = mvcrs.map(async (
        { collisionId, collisionYear, collisionMonth },
      ) => {
        const mvcrFilePath = `mvcr/${collisionYear}/${collisionMonth}`;
        const mvcrFilename = `mvcr_${collisionYear}_${collisionMonth}_${collisionId}.pdf`;
        const fileExists = await storageStrategy.has(mvcrFilePath, mvcrFilename, false);
        let fileCompressed = false;

        if (fileExists) {
          const mvcrFileStream = storageStrategy.getStream(mvcrFilePath, mvcrFilename, false)
            .on('error', reject);
          archive.append(mvcrFileStream, { name: mvcrFilename });
          fileCompressed = true;
        }
        return fileCompressed;
      });

      Promise.all(zipPromises).then(() => {
        archive.finalize();
        storageStrategy.putStream(bulkFilePath, bulkFilename, valueStream, false);
      });
    });
    await this.incrProgressCurrent();
    return compressionTaskPromise;
  }
}

export default JobRunnerCompressMvcrs;
