function normalizeAndCall(value, params) {
  if (value instanceof Function) {
    return value(params);
  }
  return value;
}

/**
 * A template callback function, which takes an object of named parameters and uses them
 * to render a template string.
 *
 * In JavaScript, template strings are evaluated immediately, which is different from how
 * other languages (e.g. Python) handle this.  To get around that, we can wrap the template
 * string in a function.
 *
 * @callback TemplateCallback
 * @param {Object} params - object containing named parameters to be used in template
 * @returns {string} templated string
 */

/**
 * `ConfirmDialog` defines a new confirmation dialog message to be displayed to the user.
 *
 * This should be used when presenting the user with a choice, such as whether or not to
 * confirm an action.  If you're just showing a message and don't need input from the user,
 * consider using {@link Strings} instead.
 *
 * Note that `title` and `prompt` can take a {@link TemplateCallback}, which allows
 * them to render dynamic text.
 *
 * @param {Object} options - options for the confirmation dialog
 * @param {string|TemplateCallback} options.title - title of dialog
 * @param {string|TemplateCallback} options.prompt - prompt in body of dialog
 * @param {string?} options.textCancel - text on Cancel button
 * @param {string?} options.textOk - text on OK button
 */
class ConfirmDialog {
  constructor({
    title,
    prompt,
    textCancel,
    textOk,
  }) {
    this.title = title;
    this.prompt = prompt;
    this.textCancel = textCancel;
    this.textOk = textOk;
  }

  /**
   * Returns modal options to be used in `setModal()`.
   *
   * @param {Object} params - object containing named parameters to be used in template
   * @example
   * const options = ConfirmDialog.STUDY_DUPLICATE.getModalOptions();
   * this.setModal(options);
   */
  getModalOptions(params) {
    const title = normalizeAndCall(this.title, params);
    const prompt = normalizeAndCall(this.prompt, params);
    const data = {
      title,
      prompt,
      textCancel: this.textCancel,
      textOk: this.textOk,
    };
    return {
      component: 'TdsConfirmDialog',
      data,
    };
  }
}

const STUDY_DUPLICATE = new ConfirmDialog({
  title: 'Add Duplicate Study?',
  prompt({ label }) {
    return `You've already added a ${label}.  Do you want to add another study of that type?`;
  },
  textCancel: 'No, don\'t add it',
  textOk: 'Yes, add it',
});
ConfirmDialog.STUDY_DUPLICATE = STUDY_DUPLICATE;

const STUDY_IRRELEVANT_TYPE = new ConfirmDialog({
  title({ label }) {
    return `Add ${label}?`;
  },
  prompt({ label }) {
    return `${label} studies aren't typically performed at this type of location.  Are you sure?`;
  },
  textCancel: 'No, don\'t add it',
  textOk: 'Yes, add it',
});
ConfirmDialog.STUDY_IRRELEVANT_TYPE = STUDY_IRRELEVANT_TYPE;

export {
  ConfirmDialog as default,
  STUDY_DUPLICATE,
  STUDY_IRRELEVANT_TYPE,
};
