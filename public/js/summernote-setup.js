$("#summernote").summernote({
  placeholder: "Enter something...",
  tabsize: 2,
  height: 300,
  toolbar: [
    ["style", ["style"]],
    ["font", ["bold", "underline", "clear"]],
    ["color", ["color"]],
    ["para", ["ul", "ol", "paragraph"]],
    ["table", ["table"]],
    ["insert", ["link", "picture", "video"]],
    ["view", ["fullscreen", "codeview", "help"]],
  ],
  callbacks: {
    onImageUpload: function (files) {
      console.log("img upload fired");
      const formData = new FormData();
      formData.append("file", files[0]);

      $.ajax({
        url: "/upload-image",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          $("#summernote").summernote("insertImage", response.imageUrl);
        },
        error: function () {
          alert("Failed");
        },
      });
    },
    onMediaDelete: function ($target) {
      const imageUrl = new URL($target[0].src).pathname;
      $.ajax({
        url: "/delete-image",
        method: "POST",
        data: { imageUrl },
        success: function (response) {
          console.log("Image deleted:", response);
        },
        error: function () {
          alert("Failed to delete image");
        },
      });
    },
  },
});
