export function generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  export function getTagsArray(tagsString) {
    return tagsString
      .split(",")
      .map((tag) => tag.trim().replace(/[\s]+/g, "-"))
      .filter((tag) => tag !== "");
  }
  
  export function decomposeTag(tag) {
    return tag.replace('-', ' ');
  }