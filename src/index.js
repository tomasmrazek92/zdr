import { swiperInstances } from './swipers';
import { initSwipers } from './utils/globalSwipers';

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

function initNavScroll() {
  function createScrollHandler(triggerSelector, targetSelector, className = 'scrolled') {
    let $trigger = $(triggerSelector);
    let $target = $(targetSelector);
    let triggerHeight = $trigger.outerHeight();
    let hasScrolled = false;

    function initCheck(el) {
      let scrollTop = $(window).scrollTop();

      if (scrollTop > triggerHeight && !hasScrolled) {
        hasScrolled = true;
        $target.addClass(className);
      } else if (scrollTop <= triggerHeight && hasScrolled) {
        hasScrolled = false;
        $target.removeClass(className);
      }
    }

    $(window).on('scroll', function () {
      initCheck();
    });

    $(window).on('resize', function () {
      triggerHeight = $trigger.outerHeight();
    });

    // Init
    initCheck();
  }

  function initNavScroll() {
    createScrollHandler('.nav_wrapper', '.nav', 'scrolled');
  }

  function initSubmenuScroll() {
    createScrollHandler('.title-box', '.nav_submenu', 'opened');
  }

  // Init
  initNavScroll();
  initSubmenuScroll();
}

function initSubMenu() {
  let lastActiveSection = '';

  $('.nav_submenu').each(function () {
    const $submenu = $(this);
    const $titleBoxLinks = $('.title-box_links');
    const $submenuList = $submenu.find('.submenu_list');

    if ($titleBoxLinks.length && $submenuList.length) {
      $titleBoxLinks.children().each(function () {
        const $clonedItem = $(this).clone();
        $submenuList.append($clonedItem);
      });
    }
  });

  function updateActiveLink() {
    let currentSection = '';
    const scrollTop = $(window).scrollTop();

    $('.submenu_list a').each(function () {
      const href = $(this).attr('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const $targetElement = $('#' + targetId + '.section-anchor');

        if ($targetElement.length) {
          const marginBottom = parseFloat($targetElement.css('margin-bottom'));
          const triggerOffset = marginBottom;
          const elementTop = $targetElement.offset().top;
          const triggerPoint = elementTop;

          if (scrollTop >= triggerPoint) {
            currentSection = href;
          }
        }
      }
    });

    if (currentSection !== lastActiveSection) {
      $('.submenu_list a').removeClass('active');

      if (currentSection) {
        const $activeLink = $('.submenu_list a[href="' + currentSection + '"]');
        $activeLink.addClass('active');

        if ($activeLink.length) {
          const $navSubmenu = $('.nav_submenu');
          const activeLinkOffset = $activeLink.position().left;
          const currentScrollLeft = $navSubmenu.scrollLeft();
          const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const targetScrollLeft = currentScrollLeft + activeLinkOffset - remInPixels;

          $navSubmenu.animate(
            {
              scrollLeft: targetScrollLeft,
            },
            300
          );
        }
      }

      lastActiveSection = currentSection;
    }
  }

  $(window).on('scroll', updateActiveLink);
  updateActiveLink();
}

function initAccordionCSS() {
  $(document).on('click', '[data-accordion-toggle]', function (event) {
    const $toggle = $(this);
    const $singleAccordion = $toggle.closest('[data-accordion-status]');

    if (!$singleAccordion.length) return;

    const isActive = $singleAccordion.attr('data-accordion-status') === 'active';
    $singleAccordion.attr('data-accordion-status', isActive ? 'not-active' : 'active');

    const $parentAccordion = $singleAccordion.closest('[data-accordion-css-init]');
    const closeSiblings = $parentAccordion.attr('data-accordion-close-siblings') === 'true';

    if (closeSiblings && !isActive) {
      $parentAccordion
        .find('[data-accordion-status="active"]')
        .not($singleAccordion)
        .attr('data-accordion-status', 'not-active');
    }
  });
}

function initMaskTextScrollReveal() {
  if (window.maskTextInitialized) {
    return;
  }

  const splitConfig = {
    lines: { duration: 0.8, stagger: 0.1 },
    words: { duration: 0.7, stagger: 0.1 },
    chars: { duration: 0.4, stagger: 0.02 },
  };

  const getDataValue = (el, parent, key) => parent?.dataset[key] || el.dataset[key];

  const createTypesToSplit = (type) => {
    const map = { lines: ['words'], words: ['words'], chars: ['words'] };
    return map[type] || map.lines;
  };

  document.querySelectorAll('[data-split="heading"]').forEach((heading) => {
    if (heading.classList.contains('split-processed') || heading.querySelector('.word')) return;
    heading.classList.add('split-processed');

    gsap.set(heading, { autoAlpha: 1 });

    const triggerParent = heading.closest('[data-split-trigger]');
    const type = heading.dataset.splitReveal || 'words';
    const triggerValue = getDataValue(heading, triggerParent, 'splitTrigger');
    const trigger = triggerValue ? document.querySelector(triggerValue) : triggerParent || heading;
    const instant = heading.dataset.splitInstant === 'true';
    const startTrigger = getDataValue(heading, triggerParent, 'splitStart') || 'top 90%';
    const toggleActions =
      getDataValue(heading, triggerParent, 'splitToggleActions') || 'play none none none';
    const items = triggerParent?.querySelectorAll('[data-split="item"]') || [];

    if (items.length) gsap.set(items, { visibility: 'visible', opacity: 0 });

    const splitInstance = SplitText.create(heading, {
      type: createTypesToSplit(type).join(', '),
      mask: 'words',
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'letter',
    });

    heading.splitInstance = splitInstance;

    const targets = splitInstance[type].filter((el) => heading.contains(el));
    const config = splitConfig[type];

    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
    });

    tl.from(targets, {
      yPercent: 110,
      duration: config.duration,
      stagger: config.stagger,
    });

    if (items.length) {
      tl.to(
        items,
        {
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
        },
        '<0.25'
      );
    }

    if (instant) {
      tl.play();
      return; // <- Prevent ScrollTrigger from firing
    }

    ScrollTrigger.create({
      trigger,
      start: startTrigger,
      animation: tl,
      ...(toggleActions === 'play none none none' ? { once: true } : { toggleActions }),
    });
  });

  window.maskTextInitialized = true;
}

function initCounter() {
  ScrollTrigger.refresh();

  $('[data-counter]').each(function () {
    let counter = $(this);
    let element = this;
    let originalText = counter.text().trim();
    let duration = parseFloat(counter.attr('data-duration')) || 2;
    let suffix = counter.attr('data-suffix') || '';
    let prefix = counter.attr('data-prefix') || '';
    let autoFormat = counter.attr('data-format') === 'true';

    let numberMatch = originalText.match(/^(\d[\d\s,\.]*\d|\d)/);
    let numberPart = numberMatch ? numberMatch[1].trim() : originalText;
    let textSuffix = numberMatch ? originalText.substring(numberMatch[0].length).trim() : '';

    let endValue,
      decimals = 0,
      useComma = false;

    if (numberPart.includes(',') && numberPart.match(/,\d+$/)) {
      useComma = true;
      let parts = numberPart.split(',');
      endValue = parseFloat(parts[0].replace(/\s/g, '') + '.' + parts[1]);
      decimals = parts[1].length;
    } else if (numberPart.includes('.') && numberPart.match(/\.\d+$/)) {
      let parts = numberPart.split('.');
      endValue = parseFloat(numberPart.replace(/\s/g, ''));
      decimals = parts[1].length;
    } else {
      endValue = parseFloat(numberPart.replace(/\s/g, ''));
    }

    if (isNaN(endValue)) {
      return;
    }

    let startValue = 0;
    if (decimals > 0) {
      startValue = parseFloat('0.' + '0'.repeat(decimals));
    }

    let counterObj = { value: startValue };

    gsap.to(counterObj, {
      value: endValue,
      duration: duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        once: true,
      },
      onUpdate: function () {
        let displayValue;

        if (useComma) {
          displayValue = counterObj.value.toFixed(decimals).replace('.', ',');
          if (autoFormat && displayValue.includes(',')) {
            let parts = displayValue.split(',');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            displayValue = parts.join(',');
          } else if (autoFormat) {
            displayValue = displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
          }
        } else {
          if (decimals > 0) {
            displayValue = counterObj.value.toFixed(decimals);
            if (autoFormat && displayValue.split('.')[0].length > 3) {
              let parts = displayValue.split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
              displayValue = parts.join('.');
            }
          } else {
            displayValue = Math.round(counterObj.value).toString();
            if (autoFormat) {
              displayValue = displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
          }
        }

        let finalText = prefix + displayValue + (textSuffix ? ' ' + textSuffix : '') + suffix;
        counter.text(finalText);
      },
    });
  });
}

function initGridAnim() {
  let animatingPaths = new Set();

  $('.animated-path').css('fill', 'rgb(179, 228, 230)').attr('style', 'fill-opacity: 0;');

  function animateRandomPath() {
    const $paths = $('.animated-path');
    const availablePaths = $paths.filter(function (index) {
      return !animatingPaths.has(index);
    });

    if (availablePaths.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availablePaths.length);
    const pathIndex = $paths.index(availablePaths[randomIndex]);
    const randomPath = availablePaths.eq(randomIndex);
    const randomDuration = Math.random() * 2 + 2;
    const randomDelay = Math.random() * 1;

    animatingPaths.add(pathIndex);

    gsap.to(randomPath[0], {
      duration: randomDuration,
      delay: randomDelay,
      fillOpacity: 1,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onComplete: function () {
        animatingPaths.delete(pathIndex);
      },
    });
  }

  function startRandomLoop() {
    animateRandomPath();
    const nextDelay = Math.random() * 300 + 100;
    setTimeout(startRandomLoop, nextDelay);
  }

  startRandomLoop();
}

function initGlobalParallax() {
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: '(max-width:479px)',
      isMobileLandscape: '(max-width:767px)',
      isTablet: '(max-width:991px)',
      isDesktop: '(min-width:992px)',
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions;

      const ctx = gsap.context(() => {
        document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
          // Check if this trigger has to be disabled on smaller breakpoints
          const disable = trigger.getAttribute('data-parallax-disable');
          if (
            (disable === 'mobile' && isMobile) ||
            (disable === 'mobileLandscape' && isMobileLandscape) ||
            (disable === 'tablet' && isTablet)
          ) {
            return;
          }

          // Optional: you can target an element inside a trigger if necessary
          const target = trigger.querySelector('[data-parallax="target"]') || trigger;

          // Get the direction value to decide between xPercent or yPercent tween
          const direction = trigger.getAttribute('data-parallax-direction') || 'vertical';
          const prop = direction === 'horizontal' ? 'xPercent' : 'yPercent';

          // Get the scrub value, our default is 'true' because that feels nice with Lenis
          const scrubAttr = trigger.getAttribute('data-parallax-scrub');
          const scrub = scrubAttr ? parseFloat(scrubAttr) : 2;

          // Get the start position in %
          const startAttr = trigger.getAttribute('data-parallax-start');
          const startVal = startAttr !== null ? parseFloat(startAttr) : -15;

          // Get the end position in %
          const endAttr = trigger.getAttribute('data-parallax-end');
          const endVal = endAttr !== null ? parseFloat(endAttr) : 0;

          // Get the start value of the ScrollTrigger
          const scrollStartRaw = trigger.getAttribute('data-parallax-scroll-start') || 'top bottom';
          const scrollStart = `clamp(${scrollStartRaw})`;

          // Get the end value of the ScrollTrigger
          const scrollEndRaw = trigger.getAttribute('data-parallax-scroll-end') || 'bottom top';
          const scrollEnd = `clamp(${scrollEndRaw})`;

          gsap.fromTo(
            target,
            { [prop]: startVal },
            {
              [prop]: endVal,
              ease: 'none',
              scrollTrigger: {
                trigger,
                start: scrollStart,
                end: scrollEnd,
                scrub,
              },
            }
          );
        });
      });

      return () => ctx.revert();
    }
  );
}

function translateDates() {
  function translate() {
    if ($('html').attr('lang') === 'cs') {
      $('[data-date]:not(.date-translated)').each(function () {
        const originalText = $(this).text().trim();
        const parsedDate = dayjs(originalText, 'MMMM D, YYYY', 'en');
        if (parsedDate.isValid()) {
          let dutchDate = parsedDate.locale('cs').format('MMMM D, YYYY');
          dutchDate = dutchDate.charAt(0).toUpperCase() + dutchDate.slice(1);
          $(this).text(dutchDate).addClass('date-translated');
        }
      });
    }
  }

  window.FinsweetAttributes = window.FinsweetAttributes || [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      listInstances.forEach((listInstance) => {
        listInstance.addHook('afterRender', (items) => {
          translate();
          return items;
        });
      });
    },
  ]);
}

function clickReveal() {
  $('a').on('click', function (e) {
    if (
      $(this).prop('hostname') == window.location.host &&
      $(this).attr('href').indexOf('#') === -1 &&
      $(this).attr('href').indexOf('?') === -1 &&
      $(this).attr('target') !== '_blank'
    ) {
      e.preventDefault();
      let transitionURL = $(this).attr('href');
      $('.load-preloader').fadeIn(400);
      setTimeout(function () {
        window.location = transitionURL;
      }, 500);
    }
  });
}

$('.load-preloader').fadeOut();
initSwipers(swiperInstances);
initNavScroll();
initSubMenu();
initAccordionCSS();
initMaskTextScrollReveal();
initCounter();
initGridAnim();
initGlobalParallax();
translateDates();
clickReveal();
