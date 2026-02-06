export const getContactFormElements = () => {
  const submitButton = document.querySelector<HTMLButtonElement>(
    '[data-submit-contact-form]',
  )

  return {
    dialog: document.querySelector<HTMLDialogElement>('#contactFormModal'),
    form: document.querySelector<HTMLFormElement>('form[contact-form]'),
    submitButton,
    successMessageDiv: document.querySelector('[data-form-success-msg]'),
    errorMessageDiv: document.querySelector('[data-form-error-msg]'),
    buttonSubmittingText: submitButton?.querySelector('[data-submitting-text]'),
    buttonDefaultText: submitButton?.querySelector('[data-default-text]'),
  }
}
