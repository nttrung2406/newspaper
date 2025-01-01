$(document).ready(function() {
    // Attach Summernote when modal is shown
    $('.modal_show').on('shown.bs.modal', function(event) {
      const modalId = $(this).attr('id');
      $(`#${modalId} .summernote`).summernote({
        height: 300, // Set the height of the editor
        focus: true, // Focus on the editor when shown
        toolbar: false, // Optional: Disable toolbar for read-only
        airMode: true // Optional: Enable air mode for inline editing
      });
    });

    // Optional: Destroy Summernote when modal is hidden to avoid memory leaks
    $('.modal').on('hidden.bs.modal', function(event) {
      const modalId = $(this).attr('id');
      $(`#${modalId} .summernote`).summernote('destroy');
    });
  });