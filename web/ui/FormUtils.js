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
  getFirstErrorText,
  scrollToFirstError,
};

export {
  FormUtils as default,
  getFirstErrorText,
  scrollToFirstError,
};
