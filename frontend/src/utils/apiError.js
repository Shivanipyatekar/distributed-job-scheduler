export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) => {
  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (!error.response) {
    return "Unable to reach the server. Check that the backend is running.";
  }

  return error.response.data?.message || fallbackMessage;
};

export const getApiFieldErrors = (error) => {
  const validationErrors = error.response?.data?.errors;

  if (!Array.isArray(validationErrors)) {
    return {};
  }

  return validationErrors.reduce((fieldErrors, currentError) => {
    if (currentError.field && !fieldErrors[currentError.field]) {
      fieldErrors[currentError.field] = currentError.message;
    }

    return fieldErrors;
  }, {});
};
