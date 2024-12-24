
  document.addEventListener('DOMContentLoaded', () => {
    const categoryLinks = document.querySelectorAll('[data-cat-id]');

    categoryLinks.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const categoryId = e.target.getAttribute('data-cat-id');
        const postsContainer = document.getElementById(`posts-container-${categoryId}`);

        // Check if posts are already loaded
        if (postsContainer.dataset.loaded) return;

        try {
          const response = await fetch(`/categories/${categoryId}/posts`);
          if (!response.ok) throw new Error('Failed to fetch posts');
          const posts = await response.json();

          // Render posts
          postsContainer.innerHTML = posts.length > 0
            ? posts.map(post => `
              <div class="col-lg-6 col-md-6">
                <div class="single-what-news mb-100">
                  <div class="what-img">
                    <img src="${post.imageUrl || '/img/default-image.jpg'}" alt="${post.title}" />
                  </div>
                  <div class="what-cap">
                    <span class="color${Math.floor(Math.random() * 4) + 1}">${post.category || 'Uncategorized'}</span>
                    <h4><a href="/posts/${post._id}">${post.title}</a></h4>
                  </div>
                </div>
              </div>
            `).join('')
            : '<p>No posts available for this category.</p>';
          postsContainer.dataset.loaded = true; // Mark as loaded
        } catch (err) {
          console.error(err);
          postsContainer.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
        }
      });
    });
  });
