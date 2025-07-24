"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/swipers.js
  var swiperInstances = [
    // Global
    [
      ".section.cc-stats",
      ".stats-grid",
      "stats",
      {
        autoHeight: "true",
        breakpoints: {
          768: {
            slidesPerView: 2
          },
          992: {
            slidesPerView: 4
          }
        }
      },
      "desktop"
    ],
    [
      "[data-carousel-logo]",
      ".logos-carousel_grid",
      "logos",
      {
        slidesPerView: 2,
        grid: {
          rows: 2
        }
      },
      "all"
    ],
    [
      "[data-carousel-news]",
      ".news_slider-wrap",
      "news",
      {
        observer: true,
        breakpoints: {
          0: {
            slidesPerView: 1.1,
            spaceBetween: 8,
            grid: {
              rows: 1
            }
          },
          768: {
            spaceBetween: 32,
            slidesPerView: 1,
            grid: {
              rows: 2
            }
          },
          992: {
            spaceBetween: 32,
            slidesPerView: 2,
            grid: {
              rows: 2
            }
          }
        }
      },
      "all"
    ],
    [
      "[data-carousel-team]",
      ".team_grid-wrap",
      "team",
      {
        slidesPerView: 1.2,
        spaceBetween: 8
      },
      "mobile"
    ],
    [
      ".step-row",
      ".step-row_slider",
      "steps",
      {
        spaceBetween: 0,
        breakpoints: {
          0: {
            slidesPerView: "auto"
          },
          992: {
            slidesPerView: 3
          }
        }
      },
      "all"
    ],
    [
      "[data-carousel-pillar]",
      ".pillar-slider",
      "pillar",
      {
        spaceBetween: 0,
        breakpoints: {
          0: {
            slidesPerView: "auto"
          },
          992: {
            slidesPerView: 2
          }
        }
      },
      "all"
    ],
    [
      "[data-carousel-project]",
      ".project-logos",
      "pillar",
      {
        spaceBetween: 0,
        breakpoints: {
          0: {
            slidesPerView: "auto"
          },
          992: {
            slidesPerView: 4
          }
        }
      },
      "all"
    ]
  ];

  // src/utils/globalSwipers.js
  var windowWidth = window.innerWidth;
  var uniqueIdCounters = {};
  var createResponsiveSwiper = (componentSelector, swiperSelector, classSelector, options, mode) => {
    let elements = $(componentSelector);
    if (elements.length === 0)
      return;
    uniqueIdCounters[classSelector] = 0;
    uniqueIdCounters[classSelector] = uniqueIdCounters[classSelector] || 0;
    elements.each(function() {
      let uniqueKey = `${classSelector}_${uniqueIdCounters[classSelector]}`;
      addUniqueClassesToElements(this, swiperSelector, uniqueKey, [
        ".swiper-arrow",
        ".swiper-pag",
        ".swiper-drag-wrapper",
        ".swiper-navigation"
      ]);
      let swiperOptions = getMergedSwiperOptions(options, uniqueKey);
      manageSwiperInstance(this, swiperSelector, uniqueKey, classSelector, swiperOptions, mode);
      uniqueIdCounters[classSelector]++;
    });
  };
  var addUniqueClassesToElements = (context, swiperSelector, uniqueKey, controlSelectors) => {
    controlSelectors.forEach((selector) => {
      $(context).find(selector).addClass(uniqueKey);
    });
    $(context).find(swiperSelector).addClass(uniqueKey);
  };
  var getMergedSwiperOptions = (options, uniqueKey) => {
    const defaultPagination = {
      el: `.swiper-navigation.${uniqueKey}`,
      dynamicBullets: true,
      type: "bullets",
      clickable: true
    };
    const paginationConfig = options.pagination ? { ...defaultPagination, ...options.pagination } : defaultPagination;
    const existingEvents = options.on || {};
    const enhancedEvents = {
      ...existingEvents,
      init: function(...args) {
        if (existingEvents.init) {
          existingEvents.init.apply(this, args);
        }
        setTimeout(() => {
          if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
          }
        }, 100);
      },
      resize: function(...args) {
        if (existingEvents.resize) {
          existingEvents.resize.apply(this, args);
        }
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      }
    };
    return {
      speed: 1e3,
      navigation: {
        prevEl: `.swiper-arrow.prev.${uniqueKey}`,
        nextEl: `.swiper-arrow.next.${uniqueKey}`
      },
      mousewheel: {
        enabled: true,
        forceToAxis: true,
        thresholdDelta: 25
      },
      pagination: paginationConfig,
      ...options,
      on: enhancedEvents
      // Override the 'on' property after spreading options
    };
  };
  var manageSwiperInstance = (context, swiperSelector, uniqueKey, classSelector, swiperOptions, mode) => {
    swipers[classSelector] = swipers[classSelector] || {};
    swipers[classSelector][uniqueKey] = swipers[classSelector][uniqueKey] || {};
    let existingInstance = swipers[classSelector][uniqueKey];
    let existingSwiper = existingInstance.swiperInstance;
    let shouldInitDesktop = mode === "desktop" && window.matchMedia("(min-width: 768px)").matches;
    let shouldInitMobile = mode === "mobile" && window.matchMedia("(min-width: 0px) and (max-width: 767px)").matches;
    let shouldInitAll = mode === "all";
    const destroySwiper = () => {
      if (existingSwiper) {
        existingSwiper.destroy(true, true);
        delete swipers[classSelector][uniqueKey];
        console.log("Swiper destroyed for", swiperSelector, "with uniqueKey", uniqueKey);
      }
    };
    const reInitObserver = () => {
      const swiperElement = $(`${swiperSelector}.${uniqueKey}`)[0];
      if (!swiperElement)
        return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (shouldInitDesktop || shouldInitMobile || shouldInitAll) {
            if (!existingSwiper) {
              let swiper = new Swiper(`${swiperSelector}.${uniqueKey}`, swiperOptions);
              swipers[classSelector][uniqueKey] = {
                swiperInstance: swiper,
                mode: shouldInitDesktop ? "desktop" : shouldInitMobile ? "mobile" : "all",
                initialized: true
              };
              observer.disconnect();
              console.log("Swiper initialized for", swiperSelector, "with uniqueKey", uniqueKey);
            }
          }
        });
      }, {});
      swipers[classSelector][uniqueKey].observer = observer;
      observer.observe(swiperElement);
    };
    if (!shouldInitDesktop && mode === "desktop")
      destroySwiper();
    else if (!shouldInitMobile && mode === "mobile")
      destroySwiper();
    else if (!shouldInitAll && mode === "all")
      destroySwiper();
    else if ((shouldInitDesktop || shouldInitMobile || shouldInitAll) && !existingSwiper) {
      reInitObserver();
    }
  };
  var runSwipers = (swiperInstances2) => {
    swiperInstances2.forEach((instance) => {
      createResponsiveSwiper(...instance);
    });
  };
  var initSwipers = (swiperInstances2, swipersState) => {
    runSwipers(swiperInstances2);
    window.addEventListener("resize", function() {
      if (window.innerWidth !== windowWidth) {
        windowWidth = window.innerWidth;
        runSwipers(swiperInstances2);
      }
    });
  };

  // src/index.js
  gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);
  function initNavScroll() {
    function createScrollHandler(triggerSelector, targetSelector, className = "scrolled") {
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
      $(window).on("scroll", function() {
        initCheck();
      });
      $(window).on("resize", function() {
        triggerHeight = $trigger.outerHeight();
      });
      initCheck();
    }
    function initNavScroll2() {
      createScrollHandler(".nav_wrapper", ".nav", "scrolled");
    }
    function initSubmenuScroll() {
      createScrollHandler(".title-box", ".nav_submenu", "opened");
    }
    initNavScroll2();
    initSubmenuScroll();
  }
  function initSubMenu() {
    let lastActiveSection = "";
    $(".nav_submenu").each(function() {
      const $submenu = $(this);
      const $titleBoxLinks = $(".title-box_links");
      const $submenuList = $submenu.find(".submenu_list");
      if ($titleBoxLinks.length && $submenuList.length) {
        $titleBoxLinks.children().each(function() {
          const $clonedItem = $(this).clone();
          $submenuList.append($clonedItem);
        });
      }
    });
    function updateActiveLink() {
      let currentSection = "";
      const scrollTop = $(window).scrollTop();
      $(".submenu_list a").each(function() {
        const href = $(this).attr("href");
        if (href && href.startsWith("#")) {
          const targetId = href.substring(1);
          const $targetElement = $("#" + targetId + ".section-anchor");
          if ($targetElement.length) {
            const marginBottom = parseFloat($targetElement.css("margin-bottom"));
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
        $(".submenu_list a").removeClass("active");
        if (currentSection) {
          const $activeLink = $('.submenu_list a[href="' + currentSection + '"]');
          $activeLink.addClass("active");
          if ($activeLink.length) {
            const $navSubmenu = $(".nav_submenu");
            const activeLinkOffset = $activeLink.position().left;
            const currentScrollLeft = $navSubmenu.scrollLeft();
            const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const targetScrollLeft = currentScrollLeft + activeLinkOffset - remInPixels;
            $navSubmenu.animate(
              {
                scrollLeft: targetScrollLeft
              },
              300
            );
          }
        }
        lastActiveSection = currentSection;
      }
    }
    $(window).on("scroll", updateActiveLink);
    updateActiveLink();
  }
  function initAccordionCSS() {
    document.querySelectorAll("[data-accordion-css-init]").forEach((accordion) => {
      const closeSiblings = accordion.getAttribute("data-accordion-close-siblings") === "true";
      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle)
          return;
        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion)
          return;
        const isActive = singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute("data-accordion-status", isActive ? "not-active" : "active");
        if (closeSiblings && !isActive) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
            if (sibling !== singleAccordion)
              sibling.setAttribute("data-accordion-status", "not-active");
          });
        }
      });
    });
  }
  function initMaskTextScrollReveal() {
    const splitConfig = {
      lines: { duration: 0.8, stagger: 0.1 },
      words: { duration: 0.7, stagger: 0.1 },
      chars: { duration: 0.4, stagger: 0.02 }
    };
    const getDataValue = (element, parent, key) => parent?.dataset[key] || element.dataset[key];
    const createTypesToSplit = (type) => {
      const typeMap = {
        lines: ["lines"],
        words: ["lines", "words"],
        chars: ["lines", "words", "chars"]
      };
      return typeMap[type] || typeMap.lines;
    };
    document.querySelectorAll('[data-split="heading"]').forEach((heading) => {
      gsap.set(heading, { autoAlpha: 1 });
      const triggerParent = heading.closest("[data-split-trigger]");
      const type = heading.dataset.splitReveal || "words";
      const triggerValue = getDataValue(heading, triggerParent, "splitTrigger");
      const trigger = triggerValue ? document.querySelector(triggerValue) : triggerParent || heading;
      const instant = getDataValue(heading, triggerParent, "splitInstant") === "true";
      const startTrigger = getDataValue(heading, triggerParent, "splitStart") || "top 90%";
      const toggleActions = getDataValue(heading, triggerParent, "splitToggleActions") || "play none none none";
      const items = triggerParent?.querySelectorAll('[data-split="item"]') || [];
      console.log(items);
      if (items.length > 0)
        gsap.set(items, { visibility: "visible", opacity: 0 });
      SplitText.create(heading, {
        type: createTypesToSplit(type).join(", "),
        mask: "lines",
        autoSplit: true,
        linesClass: "line",
        wordsClass: "word",
        charsClass: "letter",
        onSplit: function(instance) {
          const targets = instance[type];
          const config = splitConfig[type];
          const tl = gsap.timeline();
          tl.from(targets, {
            yPercent: 110,
            duration: config.duration,
            stagger: config.stagger,
            ease: "expo.out"
          });
          if (items.length > 0) {
            tl.to(
              items,
              {
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "expo.out"
              },
              "<0.25"
            );
          }
          if (instant) {
            tl.play();
          } else {
            const scrollConfig = {
              trigger,
              start: startTrigger,
              animation: tl,
              ...toggleActions === "play none none none" ? { once: true } : { toggleActions }
            };
            ScrollTrigger.create(scrollConfig);
          }
        }
      });
    });
  }
  function initCounter() {
    ScrollTrigger.refresh();
    $("[data-counter]").each(function() {
      let counter = $(this);
      let element = this;
      let originalText = counter.text().trim();
      let duration = parseFloat(counter.attr("data-duration")) || 2;
      let suffix = counter.attr("data-suffix") || "";
      let prefix = counter.attr("data-prefix") || "";
      let numberMatch = originalText.match(/^([\d\s,]+)/);
      let numberPart = numberMatch ? numberMatch[1].trim() : originalText;
      let textSuffix = numberMatch ? originalText.replace(numberMatch[1], "").trim() : "";
      let endValue, decimals = 0, useComma = false, useSpaces = false;
      if (numberPart.includes(",") && numberPart.match(/,\d+$/)) {
        useComma = true;
        let parts = numberPart.split(",");
        endValue = parseFloat(parts[0].replace(/\s/g, "") + "." + parts[1]);
        decimals = parts[1].length;
      } else if (numberPart.includes(" ") && /^\d[\d\s]*$/.test(numberPart)) {
        useSpaces = true;
        endValue = parseFloat(numberPart.replace(/\s/g, ""));
      } else {
        endValue = parseFloat(numberPart);
      }
      if (isNaN(endValue)) {
        return;
      }
      let startValue = 0;
      if (decimals > 0) {
        startValue = parseFloat("0." + "0".repeat(decimals));
      }
      let counterObj = { value: startValue };
      gsap.to(counterObj, {
        value: endValue,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          once: true
        },
        onUpdate: function() {
          let displayValue;
          if (useComma) {
            displayValue = counterObj.value.toFixed(decimals).replace(".", ",");
            if (displayValue.includes(",")) {
              let parts = displayValue.split(",");
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
              displayValue = parts.join(",");
            } else {
              displayValue = displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
          } else if (useSpaces) {
            displayValue = Math.round(counterObj.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
          } else {
            displayValue = counterObj.value.toFixed(decimals);
          }
          counter.text(prefix + displayValue + textSuffix + suffix);
        }
      });
    });
  }
  function initGridAnim() {
    let animatingPaths = /* @__PURE__ */ new Set();
    $(".animated-path").css("fill", "rgb(179, 228, 230)").attr("style", "fill-opacity: 0;");
    function animateRandomPath() {
      const $paths = $(".animated-path");
      const availablePaths = $paths.filter(function(index) {
        return !animatingPaths.has(index);
      });
      if (availablePaths.length === 0)
        return;
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
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1,
        onComplete: function() {
          animatingPaths.delete(pathIndex);
        }
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
        isMobile: "(max-width:479px)",
        isMobileLandscape: "(max-width:767px)",
        isTablet: "(max-width:991px)",
        isDesktop: "(min-width:992px)"
      },
      (context) => {
        const { isMobile, isMobileLandscape, isTablet } = context.conditions;
        const ctx = gsap.context(() => {
          document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
            const disable = trigger.getAttribute("data-parallax-disable");
            if (disable === "mobile" && isMobile || disable === "mobileLandscape" && isMobileLandscape || disable === "tablet" && isTablet) {
              return;
            }
            const target = trigger.querySelector('[data-parallax="target"]') || trigger;
            const direction = trigger.getAttribute("data-parallax-direction") || "vertical";
            const prop = direction === "horizontal" ? "xPercent" : "yPercent";
            const scrubAttr = trigger.getAttribute("data-parallax-scrub");
            const scrub = scrubAttr ? parseFloat(scrubAttr) : 2;
            const startAttr = trigger.getAttribute("data-parallax-start");
            const startVal = startAttr !== null ? parseFloat(startAttr) : -15;
            const endAttr = trigger.getAttribute("data-parallax-end");
            const endVal = endAttr !== null ? parseFloat(endAttr) : 0;
            const scrollStartRaw = trigger.getAttribute("data-parallax-scroll-start") || "top bottom";
            const scrollStart = `clamp(${scrollStartRaw})`;
            const scrollEndRaw = trigger.getAttribute("data-parallax-scroll-end") || "bottom top";
            const scrollEnd = `clamp(${scrollEndRaw})`;
            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub
                }
              }
            );
          });
        });
        return () => ctx.revert();
      }
    );
  }
  $(document).ready(function() {
    initSwipers(swiperInstances);
    initNavScroll();
    initSubMenu();
    initAccordionCSS();
    initMaskTextScrollReveal();
    initCounter();
    initGridAnim();
    initGlobalParallax();
  });
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
})();
//# sourceMappingURL=index.js.map
