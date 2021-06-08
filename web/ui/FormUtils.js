const SELECTOR_INPUT = 'button, input';

function focusInput($el) {
  let $elFocus = $el;
  if (!$elFocus.matches(SELECTOR_INPUT)) {
    $elFocus = $elFocus.querySelector(SELECTOR_INPUT);
  }
  $elFocus.focus();
}

function getFirstError($form) {
  return $form.querySelector('.v-messages.error--text');
}

function getFirstErrorText($form, textDefault = '') {
  const $errorMessage = getFirstError($form);
  if ($errorMessage === null) {
    return textDefault;
  }
  return $errorMessage.innerText;
}

function scrollToFirstError($form, containerQuery) {
  const $errorMessage = getFirstError($form);
  if ($errorMessage === null) {
    return;
  }
  const $container = $errorMessage.closest(containerQuery);
  if ($container === null) {
    $errorMessage.scrollIntoView();
  } else {
    $container.scrollIntoView();
  }
}

/**
 * @namespace
 */
const FormUtils = {
  focusInput,
  getFirstErrorText,
  scrollToFirstError,
};

export {
  FormUtils as default,
  focusInput,
  getFirstErrorText,
  scrollToFirstError,
};
