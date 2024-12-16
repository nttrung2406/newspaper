document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      $(modal).modal({
        backdrop: 'static', 
        keyboard: true 
      });
    });
  });
  