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

  // deadline_date: not past date
  if (taskData.deadline_date && taskData.deadline_date !== '') {
    const deadline = new Date(taskData.deadline_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadline < today) {
      fieldErrors.push({
        field: 'deadline_date',
        code: 'DATE_IN_PAST',
        message: 'Termin nie może być w przeszłości'
      });
    }
  }

  // estimated_time: 0-1000 hours
  if (taskData.estimated_time !== undefined && taskData.estimated_time !== null && taskData.estimated_time !== '') {
    const estimatedTime = parseFloat(taskData.estimated_time);
    if (isNaN(estimatedTime) || estimatedTime < 0) {
      fieldErrors.push({
        field: 'estimated_time',
        code: 'INVALID_NUMBER',
        message: 'Czas musi być liczbą większą lub równą 0'
      });
    } else if (estimatedTime > 1000) {
      fieldErrors.push({
        field: 'estimated_time',
        code: 'TOO_LARGE',
        message: 'Czas nie może przekraczać 1000 godzin'
      });
    }
  }

  return fieldErrors;
};