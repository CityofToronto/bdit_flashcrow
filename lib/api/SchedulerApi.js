import AxiosBackendClient from '@/lib/api/AxiosBackendClient';
import { normalizeJobMetadata } from '@/lib/model/helpers/NormalizeUtils';
import store from '@/web/store';

const schedulerClient = new AxiosBackendClient('/scheduler');

async function putJobDismiss(csrf, jobMetadata) {
  const { jobId } = jobMetadata;
  const url = `/jobs/${jobId}/dismiss`;
  const options = {
    method: 'PUT',
    csrf,
  };
  const persistedJobMetadata = await schedulerClient.fetch(url, options);
  if (persistedJobMetadata.dismissed) store.dispatch('decrementNewExportsCount');
  return normalizeJobMetadata(persistedJobMetadata);
}

const SchedulerApi = {
  putJobDismiss,
};

export {
  SchedulerApi as default,
  putJobDismiss,
};
