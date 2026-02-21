/* Sticky Header Logic */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});

/* Carousel Logic */
const track = document.querySelector('.carousel-track');
const cards = document.querySelectorAll('.testimonial-card');
let index = 0;

function slide() {
    if (!track) return;
    index++;
    if (index > cards.length - 2) {
        index = 0;
    }
    const move = index * -50; // Slide 50% each time since 2 cards are visible on desktop

    // Adjust for mobile (100%)
    if (window.innerWidth <= 768) {
        track.style.transform = `translateX(${index * -100}%)`;
    } else {
        track.style.transform = `translateX(calc(${move}% - ${index * 16}px))`;
    }
}

let carouselInterval = setInterval(slide, 4000);

// Pause on hover
track?.addEventListener('mouseenter', () => clearInterval(carouselInterval));
track?.addEventListener('mouseleave', () => carouselInterval = setInterval(slide, 4000));
