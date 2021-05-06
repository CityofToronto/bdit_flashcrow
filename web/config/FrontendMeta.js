class FrontendMeta {
  static get() {
    const $meta = document.head.querySelector('meta[name=application-name]');
    const meta = {};
    if ($meta !== null) {
      Object.entries($meta.dataset).forEach(([key, value]) => {
        meta[key] = value;
      });
    }
    return meta;
  }
}

export default FrontendMeta;
