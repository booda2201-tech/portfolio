# GSAP & AOS Animation Integration Skills

You excel at creating premium, cinematic web animations using GSAP (GreenSock) and AOS (Animate On Scroll) inside Angular projects.

1. **GSAP Lifecycle Binding**:
   - Always initialize GSAP animations and timelines inside the `ngAfterViewInit()` lifecycle hook to ensure the DOM is fully rendered.
   - Use Angular's `@ViewChild` or `@ViewChildren` with `ElementRef` to select DOM elements safely instead of using global document selectors (`document.querySelector`).
   - Wrap GSAP animations inside `this.ngZone.runOutsideAngular(() => { ... })` if they trigger high-frequency events to optimize performance.

2. **AOS Initialization**:
   - Ensure AOS is correctly bound to scroll events, initializing inside the main component or routing changes where layout shifts are fully settled.

# 3D Three.js (Simple Implementation) Rules

You are a Creative Developer who can implement simple, elegant 3D elements using Three.js and modify them using React state and Three.js controls.

1. **Simple Implementation**: Use `react-three-fiber` (R3F) and `three-fiber` for easy Three.js integration.
2. **State Control**: Modify 3D object properties (e.g., color, position) using React state to make them interactive or responsive to page events.
3. **Animation Logic**:
   - Use `useFrame` for real-time animation loops.
   - Keep the logic simple and performant (avoid excessive geometry calculations).
4. **Light & Mesh**: Utilize basic lighting (ambient, directional) and simple geometric shapes (`mesh`, `box`, `sphere`) for clean, modern 3D effects.

# CSS Utilities & Effects Rules

1. **CSS Utilities**: Prefer using Tailwind CSS utility classes for maximum efficiency.
2. **Complex Effects**:
   - For **gradients**, use `background-image: linear-gradient(...)` or Tailwind's gradient utilities.
   - For **blurs**, use `backdrop-filter: blur(...)`.
   - For **transitions**, use `transition: all 0.3s ease-in-out`.
   - For ** Shadows**, use `box-shadow: ...` or Tailwind's `shadow-*` classes.

# Text Animation Skills (SplitType & GSAP)

You excel at creating high-end, cinematic text animations using **SplitType** and **GSAP**.

1. **SplitType Implementation**:
   - Use `SplitType.split(element, { types: 'chars, words, lines' })` to decompose text elements.
   - Apply `SplitType.revert()` when resetting or cleaning up animations to prevent DOM pollution.
   - Ensure SplitType runs _before_ GSAP animations.

2. **GSAP Application**:
   - Use `gsap.fromTo()` or `gsap.to()` to animate the properties provided by SplitType (e.g., `chars.chars`, `words.words`).
   - Apply smooth, staggered delays (`stagger: 0.05`) for a premium feel.
   - Use appropriate easing functions (e.g., `ease: 'power3.out'`) for high-quality motion.
3. **Styling Effects**:
   - Combine SplitType with CSS `opacity`, `transform`, and `letter-spacing` properties to achieve desired effects.
   - Ensure proper cleanup to prevent residual styles on text elements.
   - Use Angular's `ElementRef` to target DOM elements safely within the component lifecycle.

# Performance Optimization Rules

1. **DOM Manipulation**: Avoid direct `document.querySelector` or `document.querySelectorAll` calls in Angular components. Use Angular's `ElementRef`, `ViewChild`, and `Renderer2` for safe DOM access.
2. **Lifecycle Hooks**: Ensure heavy DOM operations, initialization code (like AOS or ScrollTrigger), and 3D canvas setup occur within `ngAfterViewInit()` to prevent blocking the initial render.
3. **Zone Management**: Wrap computationally expensive operations or high-frequency animations (e.g., `requestAnimationFrame`) inside `ngZone.runOutsideAngular()` to maintain performance.

# Page Layout & Structure Rules

1. **Section Layout**: Divide the page into distinct sections (Hero, About, Services, Portfolio, Contact) with clear visual hierarchy.
2. **Spacing**: Use ample `padding` and `margin` (or Tailwind spacing utilities) to create a sense of luxury and order. Avoid cramped designs.
3. **Consistency**: Maintain consistent spacing, typography, and color usage across all sections.
4. **Responsive Design**: Ensure layouts adapt gracefully to different screen sizes using responsive utilities (e.g., `md:`, `lg:`, `xl:`).

# Advanced Micro-interactions & Effects Rules

1. **Mouse Follow Effect**: Implement a mouse-following cursor with high-quality smoothing (using CSS `backdrop-filter: blur(...)` or `transform`) that interacts with page elements.
2. **Scroll-Triggered Animations**: Use GSAP ScrollTrigger or AOS for scroll-triggered effects like "Staggered reveal" ( staggered `opacity` or `translateY` animations) and "Parallax effects" (elements moving at different scroll speeds).
3. **Hover Effects**: Implement advanced hover effects on interactive elements, such as scaling, color changes, or subtle 3D rotations, combined with smooth transitions.

# Premium Content & Visual Effects Rules

1. **Parallax Effects**: Apply subtle parallax effects to background images and layers to create depth. Use CSS `transform: translateZ()` or GSAP's ScrollTrigger with `scrollerProxy`.
2. **Smooth Transitions**: Use CSS `transition-all duration-500 ease-in-out` for hover effects, modal openings, and other UI changes to ensure smooth visual feedback.
3. **Gradient Effects**: Implement premium gradients using `linear-gradient()` or `radial-gradient()` for backgrounds, buttons, and text elements to create a modern, sophisticated look.
4. **Blur Effects**: Apply `backdrop-filter: blur(10px)` to glassmorphism elements to create a sense of depth and hierarchy.
5. **Overlays**: Use semi-transparent overlay layers (with `rgba()` or `hsla()` colors) over images to enhance contrast and visual appeal.

# Design and Styling Rules

1. **CSS Utility**: Use Tailwind CSS exclusively for styling.
2. **Luxury Design**: Implement premium design elements with clean layouts, sophisticated color schemes, and smooth micro-interactions.
3. **Typography**: Use modern, readable fonts (e.g., Inter, Roboto, or Open Sans). Ensure proper hierarchy with clear heading sizes and weights.
4. **Spacing**: Apply generous padding and margins to create a sense of luxury and breathing room.
5. **Transitions**: Use smooth CSS transitions (e.g., `transition: all 0.3s ease-in-out`) for hover effects and UI changes.

# Advanced Animation Effects Rules

1. **Staggered Reveal**: Use staggered delays on child elements (e.g., letters, cards) to create a premium, synchronized reveal effect.
2. **Parallax Background**: Implement parallax scrolling effects on background images using CSS `transform` or GSAP to add depth.
3. **Scroll-Triggered Animations**: Use GSAP ScrollTrigger to trigger animations when elements enter the viewport, creating a dynamic scrolling experience.
4. **Smooth Transitions**: Ensure all animations have smooth transitions using appropriate easing functions (e.g., `ease: 'power3.out'`) and durations (e.g., `duration: 0.8`).
5. **Element Interactions**: Apply hover effects that enhance user engagement, such as subtle scaling, color changes, or rotations.
6. **Performance**: Optimize animations for smooth performance, especially on mobile devices, by avoiding heavy computations and utilizing hardware acceleration where possible.

# Advanced Text Animation & Scroll Effects Rules

1. **Staggered Reveal**: Use staggered delays on child elements (e.g., letters, cards) to create a premium, synchronized reveal effect.
2. **Parallax Background**: Implement parallax scrolling effects on background images using CSS `transform` or GSAP to add depth.
3. **Scroll-Triggered Animations**: Use GSAP ScrollTrigger to trigger animations when elements enter the viewport, creating a dynamic scrolling experience.
4. **Smooth Transitions**: Ensure all animations have smooth transitions using appropriate easing functions (e.g., `ease: 'power3.out'`) and durations (e.g., `duration: 0.8`).
5. **Element Interactions**: Apply hover effects that enhance user engagement, such as scaling, color changes, or rotations.
6. **Performance**: Optimize animations for smooth performance, especially on mobile devices, by avoiding heavy computations and utilizing hardware acceleration where possible.

# Video Integration & Animation Rules

1. **Video Display**: Use the `<video>` element for video playback and apply CSS/Tailwind utilities for styling (width, height, aspect ratio, object-fit).
2. **Background Videos**: For background videos, use `playsinline` and `muted` attributes to ensure autoplay works across devices. Set `object-fit: cover` to ensure the video covers the designated area.
3. **Video Animations**: Combine video elements with GSAP or CSS animations for advanced effects. For example, fade videos in/out, scale them, or use scroll-triggered animations to control playback or visual effects.
4. **Transitions**: Apply smooth transitions (`transition: all 0.3s ease-in-out`) to video elements for effects like hover scaling or opacity changes.
5. **Performance**: Ensure videos are optimized for web (appropriate codecs and compression) and consider lazy loading for non-critical video content.

# Responsive Design Rules

1. **Mobile-First Approach**: Design and style for mobile devices first, then scale up for larger screens using responsive utilities (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
2. **Breakpoints**: Use standard Tailwind breakpoints (or custom breakpoints if necessary) to create breakpoints that make sense for the design.
3. **Layout Adaptability**: Ensure layouts adapt gracefully to different screen sizes, maintaining usability and visual appeal across all devices.
4. **Typography & Spacing**: Adjust font sizes, padding, and margins at different breakpoints to maintain visual hierarchy and readability.
5. **Component Responsiveness**: Ensure all components (navbars, cards, forms, etc.) are fully responsive and provide an optimal user experience on all devices.
