import MidblockDescription from '@/lib/geo/MidblockDescription';
import JobMetadata from '@/lib/model/JobMetadata';
import Joi from '@/lib/model/Joi';

async function normalizeJobMetadata(jobMetadata) {
  const jobMetadataNormalized = await JobMetadata.read.validateAsync(jobMetadata);
  const { metadata, type } = jobMetadataNormalized;
  const metadataNormalized = await type.metadataSchema.validateAsync(metadata);
  jobMetadataNormalized.metadata = metadataNormalized;
  return jobMetadataNormalized;
}

async function normalizeJobMetadatas(jobMetadatas) {
  const jobMetadatasSchema = Joi.array().items(JobMetadata.read);
  const jobMetadatasNormalized = await jobMetadatasSchema.validateAsync(jobMetadatas);
  const tasks = jobMetadatasNormalized.map(
    ({ metadata, type }) => type.metadataSchema.validateAsync(metadata),
  );
  const metadatasNormalized = await Promise.all(tasks);
  const n = jobMetadatasNormalized.length;
  for (let i = 0; i < n; i++) {
    jobMetadatasNormalized[i].metadata = metadatasNormalized[i];
  }
  return jobMetadatasNormalized;
}

/**
 * Only SEGMENT features have AADT estimates.  When using `aadt`, you should usually
 * check `location.centrelineType === CentrelineType.SEGMENT` first.  You should also
 * check whether `location.aadt === null`, as AADT cannot be reliably estimated for all
 * segments.  (For instance, newer roads have no historical data to base this off of,
 * and some small laneways have insufficient data.)
 *
 * Only SEGMENT features have road IDs.  When using `roadId`, you should usually
 * check `location.centrelineType === CentrelineType.SEGMENT` first.
 */
function segmentToFeature({
  fromIntersectionName,
  midblockName,
  toIntersectionName,
  ...restSegment
}) {
  const description = MidblockDescription.get(
    midblockName,
    fromIntersectionName,
    toIntersectionName,
  );
  return { description, ...restSegment };
}

const NormalizeUtils = {
  normalizeJobMetadata,
  normalizeJobMetadatas,
  segmentToFeature,
};

export {
  NormalizeUtils as default,
  normalizeJobMetadata,
  normalizeJobMetadatas,
  segmentToFeature,
};
