function getFirstError($form) {
  return $form.querySelector('.v-messages.error--text');
}

function getFirstErrorText($form) {
  const $errorMessage = getFirstError($form);
  return $errorMessage.innerText;
}

function scrollToFirstError($form, containerQuery) {
  const $errorMessage = getFirstError($form);
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
