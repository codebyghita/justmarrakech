import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Global defaults for a subtle, elegant look
gsap.defaults({
  duration: 1.2,
  ease: "power2.out"
});

export { gsap, ScrollTrigger };
