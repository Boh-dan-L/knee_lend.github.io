(() => {
  const dialog = document.querySelector('#personal-modal');
  const heroButton = document.querySelector('#hero .pay-btn');
  const sticky = document.querySelector('.lp-sticky-cta');
  let heroPassed = false;

  const updateSticky = () => {
    sticky.hidden = !heroPassed || dialog.open;
  };

  new MutationObserver(updateSticky).observe(dialog, {
    attributes: true,
    attributeFilter: ['open'],
  });

  const checkHero = () => {
    heroPassed = heroButton.getBoundingClientRect().bottom <= 0;
    updateSticky();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(checkHero);
    observer.observe(heroButton);
  } else {
    window.addEventListener('scroll', checkHero, { passive: true });
  }

  checkHero();
})();
