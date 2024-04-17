/* eslint-disable class-methods-use-this */
import JobRunnerBase from '@/lib/jobs/JobRunnerBase';
import storageStrategy from '@/lib/io/storage/StorageStrategy';
import archiver from 'archiver';
import stream from 'stream';

class JobRunnerCompressMvcrs extends JobRunnerBase {
  async runImpl(data) {
    const { mvcrIds } = data;
    const bulkFilePath = 'mvcrBulk';
    const bulkFilename = `mvcrs_${this.jobMetadata.jobId}.zip`;
    const zippedMvcrs = [];

    const compressionTaskPromise = new Promise((resolve, reject) => {
      const archive = archiver('zip')
        .on('error', reject);

      const valueStream = stream.PassThrough()
        .on('error', reject)
        .on('end', () => resolve({ filename: bulkFilename, zippedMvcrs }));

      archive.pipe(valueStream);

      const zipPromises = mvcrIds.map(async (
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
          zippedMvcrs.push({ collisionId, collisionYear, collisionMonth });
          fileCompressed = true;
        }

        await this.incrProgressCurrent();
        return fileCompressed;
      });

      Promise.all(zipPromises).then(() => {
        archive.finalize();
        storageStrategy.putStream(bulkFilePath, bulkFilename, valueStream, false);
      });
    });
    return compressionTaskPromise;
  }
}

export default JobRunnerCompressMvcrs;
