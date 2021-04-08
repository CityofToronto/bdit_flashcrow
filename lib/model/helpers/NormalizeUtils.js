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

const NormalizeUtils = {
  normalizeJobMetadata,
  normalizeJobMetadatas,
};

export {
  NormalizeUtils as default,
  normalizeJobMetadata,
  normalizeJobMetadatas,
};
