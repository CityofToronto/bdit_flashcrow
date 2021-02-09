const PREFIX = '__fc';
let NEXT_ID = 1;

class DomIdGenerator {
  static generateId(name) {
    const id = NEXT_ID;
    NEXT_ID += 1;
    return `${PREFIX}_${name}_${id}`;
  }
}

export default DomIdGenerator;
