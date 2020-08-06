import { NotImplementedError } from '@/lib/error/MoveErrors';

class BackgroundJobBase {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  /* eslint-disable-next-line class-methods-use-this */
  async execute() {
    throw new NotImplementedError();
  }
}

export default BackgroundJobBase;
