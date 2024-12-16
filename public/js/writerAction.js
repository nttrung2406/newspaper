document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", async function (e) {
      const postId = e.target.dataset.postId;
  
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will delete the post permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
  
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/writer/delete-post/${postId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
          });
  
          if (response.ok) {
            Swal.fire("Deleted!", response.message, "success").then(() => {
              window.location.reload();
            });
          } else {
            const errorData = await response.json();
            Swal.fire({
              title: "Error!",
              text: `Failed: ${errorData.message || "Unknown error"}`,
              icon: "error",
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Error!",
            text: "An unexpected error occurred. Please try again later.",
            icon: "error",
          });
        }
      }
    });
  });