// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Animate only once
    }
  });
}, {
  threshold: 0.1
});

// Apply to all elements with .scroll-animate
document.querySelectorAll('.scroll-animate').forEach(el => {
  observer.observe(el);
});
