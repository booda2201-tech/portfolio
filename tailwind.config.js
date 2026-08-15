/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // 1. الألوان الأساسية والسيمانتك (نجاح، تحذير، خطأ)
      colors: {
        brand: {
          50: 'oklch(0.97 0.02 264 / <alpha-value>)',
          500: 'oklch(0.55 0.22 264 / <alpha-value>)',
          900: 'oklch(0.25 0.15 264 / <alpha-value>)',
        },
        success: 'oklch(0.65 0.18 145 / <alpha-value>)',
        warning: 'oklch(0.75 0.15 85 / <alpha-value>)',
        error: 'oklch(0.60 0.22 25 / <alpha-value>)',
      },
      // 2. الخطوط
      fontFamily: {
        display: ['Satoshi', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      // 3. المسافات المخصصة (Named Spacing)
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        'navbar': '4.5rem',
        'header': '4rem',
        'section': '6rem',
      },
      // 4. الـ Breakpoints (الشاشات المخصصة للتابلت والشاشات الضخمة)
      screens: {
        'tablet': '768px',    // بديل لـ 48rem
        '3xl': '1920px',      // بديل لـ 120rem ل الشاشات الـ Pro Max
      },
      // 5. التأثيرات والـ Borders
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      borderRadius: {
        'large': '1.5rem',
      }
    },
  },
  plugins: [],
}