let windowWidth = window.innerWidth;
let uniqueIdCounters = {};
let shouldInitializeImmediately = false;
let resizeTimeout;

export const createResponsiveSwiper = (
  componentSelector,
  swiperSelector,
  classSelector,
  options,
  mode
) => {
  let elements = $(componentSelector);
  if (elements.length === 0) return;

  uniqueIdCounters[classSelector] = 0;

  uniqueIdCounters[classSelector] = uniqueIdCounters[classSelector] || 0;
  elements.each(function () {
    let uniqueKey = `${classSelector}_${uniqueIdCounters[classSelector]}`;

    addUniqueClassesToElements(this, swiperSelector, uniqueKey, [
      '.swiper-arrow',
      '.swiper-pag',
      '.swiper-drag-wrapper',
      '.swiper-navigation',
    ]);

    let swiperOptions = getMergedSwiperOptions(options, uniqueKey);

    manageSwiperInstance(this, swiperSelector, uniqueKey, classSelector, swiperOptions, mode);

    uniqueIdCounters[classSelector]++;
  });
};

const addUniqueClassesToElements = (context, swiperSelector, uniqueKey, controlSelectors) => {
  controlSelectors.forEach((selector) => {
    $(context).find(selector).addClass(uniqueKey);
  });
  $(context).find(swiperSelector).addClass(uniqueKey);
};

const getMergedSwiperOptions = (options, uniqueKey) => {
  const defaultPagination = {
    el: `.swiper-navigation.${uniqueKey}`,
    dynamicBullets: true,
    type: 'bullets',
    clickable: true,
  };

  const paginationConfig = options.pagination
    ? { ...defaultPagination, ...options.pagination }
    : defaultPagination;

  const existingEvents = options.on || {};
  const enhancedEvents = {
    ...existingEvents,
    init: function (...args) {
      if (existingEvents.init) {
        existingEvents.init.apply(this, args);
      }

      setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 100);
    },
    resize: function (...args) {
      if (existingEvents.resize) {
        existingEvents.resize.apply(this, args);
      }
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    },
  };

  return {
    speed: 1000,
    navigation: {
      prevEl: `.swiper-arrow.prev.${uniqueKey}`,
      nextEl: `.swiper-arrow.next.${uniqueKey}`,
    },
    mousewheel: {
      enabled: true,
      forceToAxis: true,
      thresholdDelta: 25,
    },
    pagination: paginationConfig,
    ...options,
    on: enhancedEvents,
  };
};

const manageSwiperInstance = (
  context,
  swiperSelector,
  uniqueKey,
  classSelector,
  swiperOptions,
  mode
) => {
  swipers[classSelector] = swipers[classSelector] || {};
  swipers[classSelector][uniqueKey] = swipers[classSelector][uniqueKey] || {};

  let existingInstance = swipers[classSelector][uniqueKey];
  let existingSwiper = existingInstance.swiperInstance;

  let shouldInitDesktop = mode === 'desktop' && window.matchMedia('(min-width: 768px)').matches;
  let shouldInitMobile =
    mode === 'mobile' && window.matchMedia('(min-width: 0px) and (max-width: 767px)').matches;
  let shouldInitAll = mode === 'all';

  const destroySwiper = () => {
    if (existingSwiper) {
      existingSwiper.destroy(true, true);
      delete swipers[classSelector][uniqueKey];
    }
  };

  const reInitObserver = () => {
    const swiperElement = $(`${swiperSelector}.${uniqueKey}`)[0];
    if (!swiperElement) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (shouldInitDesktop || shouldInitMobile || shouldInitAll) {
          if (!existingSwiper) {
            let swiper = new Swiper(`${swiperSelector}.${uniqueKey}`, swiperOptions);
            swipers[classSelector][uniqueKey] = {
              swiperInstance: swiper,
              mode: shouldInitDesktop ? 'desktop' : shouldInitMobile ? 'mobile' : 'all',
              initialized: true,
            };
            observer.disconnect();
          }
        }
      });
    }, {});

    swipers[classSelector][uniqueKey].observer = observer;
    observer.observe(swiperElement);
  };

  if (!shouldInitDesktop && mode === 'desktop') destroySwiper();
  else if (!shouldInitMobile && mode === 'mobile') destroySwiper();
  else if (!shouldInitAll && mode === 'all') destroySwiper();
  else if ((shouldInitDesktop || shouldInitMobile || shouldInitAll) && !existingSwiper) {
    reInitObserver();
  }
};

const cleanupAllSwiperStyles = () => {
  $('.swiper').each(function () {
    const $swiper = $(this);
    const $wrapper = $swiper.find('.swiper-wrapper');
    const $slides = $swiper.find('.swiper-slide');

    $swiper.removeAttr('style');
    $wrapper.removeAttr('style');
    $slides.removeAttr('style');

    $swiper.removeClass(
      'swiper-initialized swiper-horizontal swiper-vertical swiper-pointer-events swiper-backface-hidden'
    );
    $slides.removeClass(
      'swiper-slide-active swiper-slide-prev swiper-slide-next swiper-slide-duplicate swiper-slide-duplicate-active swiper-slide-duplicate-prev swiper-slide-duplicate-next'
    );
  });
};

export const runSwipers = (swiperInstances) => {
  swiperInstances.forEach((instance) => {
    createResponsiveSwiper(...instance);
  });
};

export const initSwipers = (swiperInstances, swipersState) => {
  windowWidth = window.innerWidth;

  runSwipers(swiperInstances);

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newWidth = window.innerWidth;
      if (Math.abs(newWidth - windowWidth) > 10) {
        windowWidth = newWidth;
        runSwipers(swiperInstances);
      }
    }, 250);
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
  };
};
