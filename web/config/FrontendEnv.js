import { Enum } from '@/lib/ClassUtils';
import { EnumValueError } from '@/lib/error/MoveErrors';

class FrontendEnv extends Enum {
  static get() {
    if (window.document.domain === 'localhost') {
      return FrontendEnv.LOCAL;
    }
    if (window.location.origin === 'https://move.intra.dev-toronto.ca') {
      return FrontendEnv.DEV;
    }
    if (window.location.origin === 'https://move.intra.qa-toronto.ca') {
      return FrontendEnv.QA;
    }
    if (window.location.origin === 'https://move.intra.prod-toronto.ca') {
      return FrontendEnv.PROD;
    }
    throw new EnumValueError('could not determine frontend environment');
  }
}
FrontendEnv.init({
  LOCAL: {
    appClass: 'is-local',
    appTitle: 'MOVE (local)',
    colorClass: 'light-green',
  },
  DEV: {
    appClass: 'is-dev',
    appTitle: 'MOVE (dev)',
    colorClass: 'amber',
  },
  QA: {
    appClass: 'is-qa',
    appTitle: 'MOVE (QA)',
    colorClass: 'light-blue',
  },
  PROD: {
    appClass: 'is-prod',
    appTitle: 'MOVE',
    colorClass: null,
  },
});

export default FrontendEnv;
