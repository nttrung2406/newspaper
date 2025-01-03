document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      $(modal).modal({
        backdrop: 'static', 
        keyboard: true 
      });
    });
  });
  $(document).ready(function() {
    // Event listener for when the modal is triggered
    $('#viewModal').on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget); // Button that triggered the modal
      var postId = button.data('id'); // Extract post ID from data-id attribute

      // Send AJAX request to fetch article details
      $.ajax({
        url: '/editor/articles/view/' + postId, // Your route to get article details
        method: 'GET',
        success: function(data) {
          // Populate the modal with the article data
          var content = `
            <h6>Title:</h6>
            <p>${data.title}</p>
            <h6>Category:</h6>
            <p>${data.category ? data.category.categoryName : 'No Category'}</p>
            <h6>Tags:</h6>
            <p>${data.tags && data.tags.length > 0 ? data.tags.join(', ') : 'No Tags'}</p>
            <h6>Status:</h6>
            <p>${data.status}</p>
            <h6>Rejection Reason:</h6>
            <p>${data.status === 'Rejected' ? data.rejectionReason : 'N/A'}</p>
            <h6>Scheduled Publish Time:</h6>
            <p>${data.scheduledPublishTime ? new Date(data.scheduledPublishTime).toLocaleString() : 'Not Scheduled'}</p>
            <h6>Content:</h6>
            <div class="border p-3" style="background-color: #f8f9fa;">
              ${data.content}
            </div>
          `;

          // Insert the content into the modal body
          $('#modalContent').html(content);
        },
        error: function(err) {
          console.error('Error fetching article data:', err);
        }
      });
    });
  });


  document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".modal-content-container img");
    images.forEach(img => {
      img.addEventListener("error", () => {
        img.src = "/path/to/placeholder-image.jpg"; // Fallback image
      });
    });
  });
  