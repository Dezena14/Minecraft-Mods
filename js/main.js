document.addEventListener("DOMContentLoaded", () => {
    // --- LÓGICA DO TEMA ---
    const themeButtons = document.querySelectorAll(".theme-button");
    const htmlEl = document.documentElement;

    if (themeButtons.length > 0) {
        themeButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const currentTheme = htmlEl.getAttribute("data-tema");
                const newTheme = currentTheme === "escuro" ? "claro" : "escuro";
                localStorage.setItem("tema", newTheme);
                htmlEl.setAttribute("data-tema", newTheme);
                document
                    .querySelectorAll(".theme-button")
                    .forEach((btn) => btn.classList.add("is-rotating"));
            });
            button.addEventListener("transitionend", () => {
                document
                    .querySelectorAll(".theme-button")
                    .forEach((btn) => btn.classList.remove("is-rotating"));
            });
        });
    }

    // --- LÓGICA DO MENU MOBILE ---
    const mobileNav = document.querySelector(".main-nav-mobile");
    const navToggle = document.querySelector(".mobile-nav-toggle");

    if (mobileNav && navToggle) {
        navToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isVisible = mobileNav.getAttribute("data-visible") === "true";

            if (isVisible) {
                mobileNav.setAttribute("data-visible", "false");
                navToggle.setAttribute("aria-expanded", "false");
                document.body.classList.remove("nav-is-open"); // REFINAMENTO
            } else {
                mobileNav.setAttribute("data-visible", "true");
                navToggle.setAttribute("aria-expanded", "true");
                document.body.classList.add("nav-is-open"); // REFINAMENTO
            }
        });
    }

    // --- LÓGICA DOS DROPDOWNS (UNIFICADA) ---
    const dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach((dropdown) => {
        const triggers = dropdown.querySelectorAll(
            ".dropbtn, .dropdown-submenu > a"
        );
        triggers.forEach((trigger) => {
            trigger.addEventListener("click", (event) => {
                if (window.innerWidth <= 768) {
                    event.preventDefault();
                    const parent =
                        trigger.closest(".dropdown-submenu") ||
                        trigger.closest(".dropdown");
                    parent.classList.toggle("is-open");
                }
            });
        });
    });

    // Fecha todos os menus ao clicar fora
    document.addEventListener("click", (event) => {
        // Fecha o menu mobile se o clique for fora dele
        if (
            mobileNav.getAttribute("data-visible") === "true" &&
            !event.target.closest(".main-nav-mobile") &&
            !event.target.closest(".mobile-nav-toggle")
        ) {
            mobileNav.setAttribute("data-visible", "false");
            navToggle.setAttribute("aria-expanded", "false");
        }
        // Fecha os dropdowns se o clique for fora deles
        if (!event.target.closest(".dropdown")) {
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove("is-open");
                dropdown
                    .querySelectorAll(".dropdown-submenu")
                    .forEach((sub) => sub.classList.remove("is-open"));
            });
        }
    });

    // --- LÓGICA DO FILTRO DE CATEGORIAS ---
    const filterDropdown = document.querySelector(".filter-dropdown");
    if (filterDropdown) {
        const filterOptions = filterDropdown.querySelectorAll(".filter-option");
        const modCards = document.querySelectorAll(".card");
        modCards.forEach((card) => (card.dataset.state = "visible"));
        filterDropdown.addEventListener("click", (e) => {
            e.preventDefault();
            const clickedOption = e.target.closest(".filter-option");
            if (!clickedOption) return;
            const selectedCategory = clickedOption.dataset.category;
            filterOptions.forEach((opt) => opt.classList.remove("active"));
            clickedOption.classList.add("active");
            modCards.forEach((card) => {
                const cardCategories = card.dataset.categories;
                const shouldBeVisible =
                    selectedCategory === "all" ||
                    (cardCategories &&
                        cardCategories.includes(selectedCategory));
                if (shouldBeVisible) {
                    if (card.dataset.state === "visible") return;
                    card.dataset.state = "visible";
                    card.style.display = "flex";
                    setTimeout(() => {
                        card.classList.remove("hidden");
                    }, 10);
                } else {
                    if (card.dataset.state === "hidden") return;
                    card.dataset.state = "hidden";
                    card.classList.add("hidden");
                    card.addEventListener(
                        "transitionend",
                        () => {
                            if (card.dataset.state === "hidden") {
                                card.style.display = "none";
                            }
                        },
                        { once: true }
                    );
                }
            });
        });
    }
});
