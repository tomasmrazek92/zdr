// Sample data for swiperInstances, specific to this page
export const swiperInstances = [
  // Global
  [
    '.section.cc-stats',
    '.stats-grid',
    'stats',
    {
      autoHeight: 'true',
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 4,
        },
      },
    },
    'desktop',
  ],
  [
    '[data-carousel-logo]',
    '.logos-carousel_grid',
    'logos',
    {
      slidesPerView: 2,
      grid: {
        rows: 2,
      },
    },
    'all',
  ],
  [
    '[data-carousel-news]',
    '.news_slider-wrap',
    'news',
    {
      observer: true,
      breakpoints: {
        0: {
          slidesPerView: 1.1,
          spaceBetween: 8,
          grid: {
            rows: 1,
          },
        },
        768: {
          spaceBetween: 32,
          slidesPerView: 1,
          grid: {
            rows: 2,
          },
        },
        992: {
          spaceBetween: 32,
          slidesPerView: 2,
          grid: {
            rows: 2,
          },
        },
      },
    },
    'all',
  ],
  [
    '[data-carousel-team]',
    '.team_grid-wrap',
    'team',
    {
      slidesPerView: 1.2,
      spaceBetween: 8,
    },
    'mobile',
  ],
  [
    '.step-row',
    '.step-row_slider',
    'steps',
    {
      spaceBetween: 0,
      breakpoints: {
        0: {
          slidesPerView: 'auto',
        },
        992: {
          slidesPerView: 3,
        },
      },
    },
    'all',
  ],
  [
    '[data-carousel-pillar]',
    '.pillar-slider',
    'pillar',
    {
      spaceBetween: 0,
      breakpoints: {
        0: {
          slidesPerView: 'auto',
        },
        992: {
          slidesPerView: 2,
        },
      },
    },
    'all',
  ],
  [
    '[data-carousel-project]',
    '.project-logos',
    'pillar',
    {
      spaceBetween: 0,
      breakpoints: {
        0: {
          slidesPerView: 'auto',
        },
        992: {
          slidesPerView: 4,
        },
      },
    },
    'all',
  ],
];
