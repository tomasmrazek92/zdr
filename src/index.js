import { swiperInstances } from './swipers';
import { initSwipers } from './utils/globalSwipers';

$(document).ready(function () {
  console.log(swiperInstances);
  initSwipers(swiperInstances);
});
