export const validateTaskData = (taskData) => {
  const fieldErrors = [];
  
  // title_name: required, 3-50
  if (!taskData.title_name || taskData.title_name.trim() === '') {
    fieldErrors.push({
      field: 'title_name',
      code: 'REQUIRED',
      message: 'Nazwa zadania jest wymagana'
    });
  } else {
    if (taskData.title_name.length < 3) {
      fieldErrors.push({
        field: 'title_name',
        code: 'TOO_SHORT',
        message: 'Nazwa musi mieć co najmniej 3 znaki'
      });
    }
    if (taskData.title_name.length > 50) {
      fieldErrors.push({
        field: 'title_name',
        code: 'TOO_LONG',
        message: 'Nazwa nie może przekraczać 150 znaków'
      });
    }
  }

  // description: max 500 
  if (taskData.description && taskData.description.length > 500) {
    fieldErrors.push({
      field: 'description',
      code: 'TOO_LONG',
      message: 'Opis nie może przekraczać 500 znaków'
    });
  }

  return fieldErrors;
};