$(document).ready(function () {

    // Тема (сохранение в localStorage)
    const $html = $('html');
    const $themeToggle = $('.js-theme-toggle');

    function updateThemeButtonText(theme) {
        $themeToggle.text(theme === 'dark' ? 'Светлая тема' : 'Тёмная тема');
    }

    const currentTheme = localStorage.getItem('theme') || 'light';
    $html.attr('data-theme', currentTheme);
    updateThemeButtonText(currentTheme);

    $themeToggle.on('click', function () {
        const theme = $html.attr('data-theme') === 'dark' ? 'light' : 'dark';
        $html.attr('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeButtonText(theme);
    });

    // Динамическая галерея Portfolio через $.getJSON
    $.getJSON('data/portfolio.json', function (data) {
        let cardsHtml = '';

        $.each(data, function (key, item) {
            const fallbackImg = `https://placehold.co/600x400?text=${encodeURIComponent(item.title)}`;

            cardsHtml += `
                <article class="card" style="display:none;">
                    <img src="${item.img}" alt="${item.title}" class="card__img"
                         onerror="this.onerror=null;this.src='${fallbackImg}';">
                    <h3 class="card__title">${item.title}</h3>
                    <p class="card__desc">${item.desc}</p>
                </article>`;
        });

        $('.js-portfolio-grid').html(cardsHtml);
        $('.js-portfolio-grid .card').fadeIn(1000);
    }).fail(function () {
        $('.js-portfolio-grid').html('<p>Ошибка загрузки данных портфолио.</p>');
    });

    // Бургер-меню
    $('.js-burger-menu').on('click', function () {
        $('.js-nav').slideToggle(300);
    });

    // Модальное окно
    $('.js-open-form-btn').on('click', function () {
        $('.js-modal').css('display', 'flex').hide().fadeIn(300);
    });

    $('.js-close-modal, .js-modal').on('click', function (e) {
        if (e.target === this) {
            $('.js-modal').fadeOut(300);
        }
    });

    // Валидация и симуляция отправки формы
    $('.js-feedback-form').on('submit', function (e) {
        e.preventDefault();

        const $nameInput = $('#form-name');
        const $emailInput = $('#form-email');
        const $status = $('.js-form-status');
        const emailReg = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;

        const isNameValid = $nameInput.val().trim() !== '';
        const isEmailValid = emailReg.test($emailInput.val().trim());

        $nameInput.toggleClass('error-field', !isNameValid);
        $emailInput.toggleClass('error-field', !isEmailValid);

        if (!isNameValid || !isEmailValid) return;

        $status.text('Отправка...').css('color', '#333');

        setTimeout(function () {
            $status.text('Сообщение успешно отправлено!').css('color', 'green');
            $('.js-feedback-form')[0].reset();

            setTimeout(function () {
                $('.js-modal').fadeOut(300);
                $status.text('');
            }, 2000);
        }, 800);
    });

    // Карусель навыков
    const AUTO_SWIPE_DELAY = 4000;
    const $sliderContainer = $('.js-slider-container');
    const $sliderTrack = $('.js-slider-track');
    const $slideCards = $('.js-slide-card');
    const totalSlides = $slideCards.length;
    let currentSlide = 0;
    let autoSwipe = null;

    function getSliderMetrics() {
        const cardWidth = $slideCards.eq(0).outerWidth();
        const step = totalSlides > 1
            ? $slideCards.eq(1).offset().left - $slideCards.eq(0).offset().left
            : $slideCards.eq(0).outerWidth(true);
        const gap = Math.max(0, step - cardWidth);
        const visible = Math.max(1, Math.round(($sliderContainer.width() + gap) / step));
        return { step: step, maxIndex: Math.max(0, totalSlides - visible) };
    }

    function showSlide(index) {
        const metrics = getSliderMetrics();

        if (index > metrics.maxIndex) currentSlide = 0;
        else if (index < 0) currentSlide = metrics.maxIndex;
        else currentSlide = index;

        $sliderTrack.css('transform', `translateX(${-currentSlide * metrics.step}px)`);
    }

    function startAutoSwipe() {
        stopAutoSwipe();
        autoSwipe = setInterval(function () { showSlide(currentSlide + 1); }, AUTO_SWIPE_DELAY);
    }

    function stopAutoSwipe() {
        clearInterval(autoSwipe);
    }

    if (totalSlides > 0) {
        $('.js-next-btn').on('click', function () { showSlide(currentSlide + 1); });
        $('.js-prev-btn').on('click', function () { showSlide(currentSlide - 1); });

        $sliderContainer.hover(stopAutoSwipe, startAutoSwipe);
        $(window).on('resize', function () { showSlide(currentSlide); });

        startAutoSwipe();
    }

    // Подсветка active-пункта меню и кнопка «Наверх»
    function getHeaderOffset() {
        const $header = $('.header');
        const isPinned = ['fixed', 'sticky'].includes($header.css('position'));
        return isPinned ? $header.outerHeight() : 0;
    }

    const $navLinks = $('.js-nav-link');
    const $toTopBtn = $('.js-to-top-btn');

    const $sections = $navLinks.map(function () {
        const href = $(this).attr('href');
        return href && href.charAt(0) === '#' && $(href).length ? $(href)[0] : null;
    });

    function updateActiveLink() {
        const scrollTop = $(window).scrollTop();
        const scrollPos = scrollTop + getHeaderOffset() + 30;
        const isPageBottom = scrollTop + $(window).height() >= $(document).height() - 2;

        let currentId = null;
        let bestTop = -Infinity;
        $sections.each(function () {
            const top = $(this).offset().top;
            if (top <= scrollPos && top > bestTop) {
                bestTop = top;
                currentId = this.id;
            }
        });

        if (isPageBottom && $sections.length) {
            currentId = $sections.last().attr('id');
        }

        $navLinks.removeClass('nav__link--active');
        if (currentId) {
            $navLinks.filter(`[href="#${currentId}"]`).addClass('nav__link--active');
        }
    }

    $(window).on('scroll', function () {
        updateActiveLink();

        if ($(window).scrollTop() > 400) {
            $toTopBtn.fadeIn(300);
        } else {
            $toTopBtn.fadeOut(300);
        }
    });
    $(window).on('resize', updateActiveLink);
    updateActiveLink();

    // Плавный скролл по якорям
    $('.js-nav-link, .footer__link').on('click', function (e) {
        const target = $(this).attr('href');
        if (!target || target.charAt(0) !== '#' || !$(target).length) return;

        e.preventDefault();
        $('html, body').animate({ scrollTop: $(target).offset().top - getHeaderOffset() }, 600);

        if ($(window).width() <= 767) {
            $('.js-nav').slideUp(300);
        }
    });

    $toTopBtn.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 600);
    });
});