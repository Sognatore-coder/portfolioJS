$(document).ready(function () {
    
    // 1. Динамическая галерея Portfolio через $.getJSON
    $.getJSON('data/portfolio.json', function (data) {
        let cardsHtml = '';
        $.each(data, function (key, item) {
            cardsHtml += `
                <article class="portfolio-card" style="display:none;">
                    <img src="${item.img}" alt="${item.title}" class="portfolio-img" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x200?text=${encodeURIComponent(item.title)}';">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                </article>`;
        });
        $('.portfolio-grid').html(cardsHtml);
        $('.portfolio-card').fadeIn(1000);
    }).fail(function() {
        $('.portfolio-grid').html('<p>Ошибка загрузки данных портфолио.</p>');
    });

    // 2. Выпадающее меню (Бургер)
    $('.burger-menu').on('click', function () {
        $('.nav').slideToggle(300);
    });

    // 3. Модальное окно (Открыть / Закрыть по крестику и оверлею)
    $('#open-form-btn').on('click', function () {
        $('#callback-modal').css('display', 'flex').hide().fadeIn(300);
    });

    $('.close-modal, #callback-modal').on('click', function (e) {
        if (e.target === this) {
            $('#callback-modal').fadeOut(300);
        }
    });

    // 4. Валидация полей ввода и Симуляция отправки формы через $.ajax()
    $('#feedback-form').on('submit', function (e) {
        e.preventDefault();
        let isValid = true;
        const emailInput = $('#form-email');
        const nameInput = $('#form-name');
        const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

        if (nameInput.val().trim() === '') {
            nameInput.addClass('error-field');
            isValid = false;
        } else {
            nameInput.removeClass('error-field');
        }

        if (!emailReg.test(emailInput.val()) || emailInput.val() === '') {
            emailInput.addClass('error-field');
            isValid = false;
        } else {
            emailInput.removeClass('error-field');
        }

        if (!isValid) return;

        $('.form-status').text('Отправка...').css('color', '#333');

        const formData = $(this).serialize();

        setTimeout(function () {
            $('.form-status').text('Сообщение успешно отправлено!').css('color', 'green');
            $('#feedback-form')[0].reset();
            setTimeout(() => { $('#callback-modal').fadeOut(300); $('.form-status').text(''); }, 2000);
        }, 800);
    });

    // 5. Карусель (Слайдер) навыков с автопролистыванием
    let currentSlide = 0;
    const slides = $('.slide-card');
    const totalSlides = slides.length;

    function showSlide(index) {
        if (index >= totalSlides) currentSlide = 0;
        else if (index < 0) currentSlide = totalSlides - 1;
        else currentSlide = index;
        
        const offset = -currentSlide * 100;
        $('.slider-track').css('transform', `translateX(${offset}%)`);
    }

    $('.next-btn').on('click', function () { showSlide(currentSlide + 1); });
    $('.prev-btn').on('click', function () { showSlide(currentSlide - 1); });

    // Автопролистывание каждые 4 секунды
    let autoSwipe = setInterval(() => { showSlide(currentSlide + 1); }, 4000);
    $('.slider-container').hover(() => clearInterval(autoSwipe), () => {
        autoSwipe = setInterval(() => { showSlide(currentSlide + 1); }, 4000);
    });

    // 6. Подсветка активного пункта меню при скролле & Плавный скролл к секции
    const sections = $('section');
    const navLinks = $('.nav-link');

    $(window).on('scroll', function () {
        const scrollPos = $(window).scrollTop() + 100;

        sections.each(function () {
            const top = $(this).offset().top;
            const bottom = top + $(this).outerHeight();
            const id = $(this).attr('id');

            if (scrollPos >= top && scrollPos <= bottom) {
                navLinks.removeClass('active');
                $(`.nav a[href="#${id}"]`).addClass('active');
            }
        });

        if ($(this).scrollTop() > 400) {
            $('#to-top-btn').fadeIn(300);
        } else {
            $('#to-top-btn').fadeOut(300);
        }
    });

    $('.nav-link, .footer a[href="#about"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this).attr('href');
        $('html, body').animate({ scrollTop: $(target).offset().top - 70 }, 600);
        
        if ($(window).width() <= 767) {
            $('.nav').slideUp(300);
        }
    });

    // 7. Кнопка «Вверх» — плавный скролл к началу страницы
    $('#to-top-btn').on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 600);
    });
});