document.documentElement.classList.add("js");

function setUpMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");

    if (!menuButton || !nav) {
        return;
    }

    menuButton.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", isOpen);
        menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.classList.contains("is-open")) {
            nav.classList.remove("is-open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open menu");
            menuButton.focus();
        }
    });
}

function setUpScrollAnimations() {
    const items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        items.forEach(function (item) {
            item.classList.add("is-visible");
        });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach(function (item) {
        observer.observe(item);
    });
}

function setUpSlideshow() {
    const hero = document.querySelector(".hero");

    if (!hero) {
        return;
    }

    const slides = hero.querySelectorAll(".slide");
    const caption = hero.querySelector(".slide-caption");
    const previousButton = hero.querySelector(".slide-previous");
    const nextButton = hero.querySelector(".slide-next");
    let currentSlide = 0;
    let timer = null;

    function showSlide(number) {
        slides[currentSlide].classList.remove("is-active");
        slides[currentSlide].setAttribute("aria-hidden", "true");
        currentSlide = (number + slides.length) % slides.length;
        slides[currentSlide].classList.add("is-active");
        slides[currentSlide].setAttribute("aria-hidden", "false");
        caption.textContent = slides[currentSlide].dataset.caption;
    }

    function startAutoPlay() {
        stopAutoPlay();
        timer = setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function stopAutoPlay() {
        clearInterval(timer);
    }

    previousButton.addEventListener("click", function () {
        showSlide(currentSlide - 1);
        startAutoPlay();
    });

    nextButton.addEventListener("click", function () {
        showSlide(currentSlide + 1);
        startAutoPlay();
    });

    hero.addEventListener("mouseenter", stopAutoPlay);
    hero.addEventListener("mouseleave", startAutoPlay);
    hero.addEventListener("focusin", stopAutoPlay);
    hero.addEventListener("focusout", startAutoPlay);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        startAutoPlay();
    }
}

function showCurrentYear() {
    const yearSpan = document.querySelector(".current-year");

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

setUpMenu();
setUpScrollAnimations();
setUpSlideshow();
showCurrentYear();
