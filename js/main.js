document.addEventListener('DOMContentLoaded', () => {

  // --- LÓGICA DO TEMA ---
  const themeButtons = document.querySelectorAll(".theme-button");
  const htmlEl = document.documentElement;

  if (themeButtons.length > 0) {
    themeButtons.forEach(button => {
      button.addEventListener("click", () => {
        const currentTheme = htmlEl.getAttribute("data-tema");
        const newTheme = currentTheme === "escuro" ? "claro" : "escuro";
        localStorage.setItem("tema", newTheme);
        htmlEl.setAttribute("data-tema", newTheme);
        
        // Aplica a rotação a todos os botões de tema
        document.querySelectorAll(".theme-button").forEach(btn => btn.classList.add("is-rotating"));
      });

      button.addEventListener("transitionend", () => {
        document.querySelectorAll(".theme-button").forEach(btn => btn.classList.remove("is-rotating"));
      });
    });
  }

  // --- LÓGICA DO MENU MOBILE ---
  const mainNav = document.querySelector('.main-nav');
  const navToggle = document.querySelector('.mobile-nav-toggle');

  if (mainNav && navToggle) {
    navToggle.addEventListener('click', () => {
      const isVisible = mainNav.getAttribute('data-visible') === 'true';
      if (isVisible) {
        mainNav.setAttribute('data-visible', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      } else {
        mainNav.setAttribute('data-visible', 'true');
        navToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // --- LÓGICA DOS DROPDOWNS COM CLIQUE ---
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropbtn, .dropdown-submenu > a');
    
    if (trigger) {
      trigger.addEventListener('click', (event) => {
        // Para o comportamento de toque (mobile)
        if (window.innerWidth <= 768) {
          event.preventDefault(); // Impede que o link '#' navegue
          const parent = trigger.closest('.dropdown-submenu') || trigger.closest('.dropdown');
          parent.classList.toggle('is-open');
        }
      });
    }
  });

  // Fecha todos os dropdowns se clicar fora deles
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-open');
        dropdown.querySelectorAll('.dropdown-submenu').forEach(sub => sub.classList.remove('is-open'));
      });
    }
  });

  // --- LÓGICA DO FILTRO DE CATEGORIAS ---
  const filterDropdown = document.querySelector('.filter-dropdown');
  if (filterDropdown) {
    const filterOptions = filterDropdown.querySelectorAll('.filter-option');
    const modCards = document.querySelectorAll('.card');
    modCards.forEach(card => card.dataset.state = 'visible');
    filterDropdown.addEventListener('click', (e) => {
      e.preventDefault();
      const clickedOption = e.target.closest('.filter-option');
      if (!clickedOption) return;
      const selectedCategory = clickedOption.dataset.category;
      filterOptions.forEach(opt => opt.classList.remove('active'));
      clickedOption.classList.add('active');
      modCards.forEach(card => {
        const cardCategories = card.dataset.categories;
        const shouldBeVisible = selectedCategory === 'all' || (cardCategories && cardCategories.includes(selectedCategory));
        if (shouldBeVisible) {
          if (card.dataset.state === 'visible') return;
          card.dataset.state = 'visible';
          card.style.display = 'flex';
          setTimeout(() => { card.classList.remove('hidden'); }, 10);
        } else {
          if (card.dataset.state === 'hidden') return;
          card.dataset.state = 'hidden';
          card.classList.add('hidden');
          card.addEventListener('transitionend', () => {
            if (card.dataset.state === 'hidden') {
              card.style.display = 'none';
            }
          }, { once: true });
        }
      });
    });
  }
});