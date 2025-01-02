document.addEventListener('DOMContentLoaded', () => {
    const publishForms = document.querySelectorAll('form[action^="/editor/articles/publish"]');

    publishForms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form submission to allow animation

        const actionUrl = form.action;

        try {
          const response = await fetch(actionUrl, { method: 'POST' });

          if (response.ok) {
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Optionally reload the page after a delay to reflect changes
            setTimeout(() => {
              window.location.reload();
            }, 2000); // 2 seconds delay
          } 
        } catch (error) {
          console.error('Error publishing article:', error);
          alert('An error occurred. Please try again.');
        }
      });
    });
  });