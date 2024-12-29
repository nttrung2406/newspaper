import * as cheerio from 'cheerio';

/**
 * Trích xuất URL hình ảnh đầu tiên từ nội dung HTML.
 * @param {string} content - Nội dung HTML của bài viết.
 * @returns {string} - URL của ảnh đầu tiên hoặc ảnh mặc định.
 */
export function getImageFromContent(content) {
  const $ = cheerio.load(content || '');
  const imgSrc = $('img').first().attr('src');
  return imgSrc || '/img/default-image.jpg';
}
