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

  // category: 2-30
  if (taskData.category && taskData.category !== '') {
    if (taskData.category.length < 2) {
      fieldErrors.push({
        field: 'category',
        code: 'TOO_SHORT',
        message: 'Kategoria musi mieć co najmniej 2 znaki'
      });
    }
    if (taskData.category.length > 30) {
      fieldErrors.push({
        field: 'category',
        code: 'TOO_LONG',
        message: 'Kategoria nie może przekraczać 30 znaków'
      });
    }
  }

  // assigned_to: max 50
  if (taskData.assigned_to && taskData.assigned_to.length > 50) {
    fieldErrors.push({
      field: 'assigned_to',
      code: 'TOO_LONG',
      message: 'Nazwa osoby nie może przekraczać 100 znaków'
    });
  }

  // notes: max 200
  if (taskData.notes && taskData.notes.length > 200) {
    fieldErrors.push({
      field: 'notes',
      code: 'TOO_LONG',
      message: 'Notatki nie mogą przekraczać 200 znaków'
    });
  }

  return fieldErrors;
};

export const validateUserData = (userData, isRegistration = false) => {
  const fieldErrors = [];
  
  // login/email validation
  if (!userData.login || userData.login.trim() === '') {
    fieldErrors.push({
      field: 'login',
      code: 'REQUIRED',
      message: 'Email jest wymagany'
    });
  } else {
    if (!validateEmail(userData.login)) {
      fieldErrors.push({
        field: 'login',
        code: 'INVALID_EMAIL',
        message: 'Proszę wprowadzić poprawny adres email'
      });
    }
    if (userData.login.length > 100) {
      fieldErrors.push({
        field: 'login',
        code: 'TOO_LONG',
        message: 'Email nie może przekraczać 100 znaków'
      });
    }
  }
  
  // password validation
  if (!userData.password || userData.password.trim() === '') {
    fieldErrors.push({
      field: 'password',
      code: 'REQUIRED',
      message: 'Hasło jest wymagane'
    });
  } else {
    if (userData.password.length < 6) {
      fieldErrors.push({
        field: 'password',
        code: 'TOO_SHORT',
        message: 'Hasło musi mieć co najmniej 6 znaków'
      });
    }
    if (userData.password.length > 255) {
      fieldErrors.push({
        field: 'password',
        code: 'TOO_LONG',
        message: 'Hasło jest zbyt długie'
      });
    }
  }
  
  return fieldErrors;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};