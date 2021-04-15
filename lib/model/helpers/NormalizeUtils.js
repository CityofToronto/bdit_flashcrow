import { formatCombinedStreet } from '@/lib/StringFormatters';
import JobMetadata from '@/lib/model/JobMetadata';
import Joi from '@/lib/model/Joi';

function normalizeCollisionEvent(event) {
  const {
    stname1,
    streetype1,
    dir1,
    stname2,
    streetype2,
    dir2,
    stname3,
    streetype3,
    dir3,
    ...eventRest
  } = event;
  const street1 = formatCombinedStreet(stname1, streetype1, dir1);
  const street2 = formatCombinedStreet(stname2, streetype2, dir2);
  const street3 = formatCombinedStreet(stname3, streetype3, dir3);

  return {
    ...eventRest,
    street1,
    street2,
    street3,
  };
}

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

const NormalizeUtils = {
  normalizeCollisionEvent,
  normalizeJobMetadata,
  normalizeJobMetadatas,
};

export {
  NormalizeUtils as default,
  normalizeCollisionEvent,
  normalizeJobMetadata,
  normalizeJobMetadatas,
};
