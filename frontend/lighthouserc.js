/**
 * Lighthouse CI Configuration
 * Performance budgets and accessibility audits for payment pages
 * WCAG AAA compliance validation
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/checkout/payment',
        'http://localhost:3000/checkout/payment?method=paynow',
        'http://localhost:3000/checkout/payment?method=stripe',
        'http://localhost:3000/checkout/confirmation',
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Ready',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        // Performance assertions
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }], // WCAG AAA requires 95%
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        
        // Core Web Vitals - Payment pages need to be fast
        'largest-contentful-paint': ['error', { maxMilliseconds: 2500 }], // LCP < 2.5s
        'cumulative-layout-shift': ['error', { maxScore: 0.1 }], // CLS < 0.1
        'first-input-delay': ['error', { maxMilliseconds: 100 }], // FID < 100ms
        
        // Resource budgets
        'resource-summary:javascript:size': ['error', { maxSize: 100000 }], // Max 100KB JS
        'resource-summary:document:size': ['error', { maxSize: 50000 }], // Max 50KB HTML
        
        // Accessibility WCAG AAA specific checks
        'color-contrast': ['error', { minScore: 1 }], // All text must pass AAA contrast
        'aria-valid-attr': ['error', { minScore: 1 }],
        'aria-required-attr': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'duplicate-id-active': ['error', { minScore: 1 }],
        'form-field-multiple-labels': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'html-lang-valid': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'input-image-alt': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'meta-viewport': ['error', { minScore: 1 }],
        'tabindex': ['error', { minScore: 1 }],
        
        // Best practices
        'errors-in-console': ['warn', { maxScore: 0 }], // No console errors allowed
        'no-document-write': ['error', { maxScore: 0 }],
        'no-vulnerable-libraries': ['error', { maxScore: 0 }],
        'notification-permission': ['warn', { maxScore: 1 }],
        'password-inputs-can-be-pasted-into': ['error', { maxScore: 0 }],
        'uses-http2': ['warn', { minScore: 1 }],
        'uses-passive-event-listeners': ['error', { maxScore: 0 }],
      },
    },
    
    upload: {
      target: 'temporary-public-storage',
      githubToken: process.env.GITHUB_TOKEN,
    },
    
    server: {
      // GitHub integration
      port: 9001,
      allowedHosts: ['localhost'],
    },
  },

  // Payment-specific accessibility rules
  accessibility: {
    include: [
      'wcag2a',
      'wcag2aa',
      'wcag2aaa',
      'wcag2aa+aaa',
    ],
    exclude: [
      'experimental',
      'best-practice',
    ],
    rules: {
      // Force AAA level contrast
      'color-contrast': {
        enabled: true,
        // Minimum contrast ratio: 7:1 for WCAG AAA
        options: {
          threshold: {
            normal: 7,
            large: 4.5,
          },
        },
      },
      // Ensure all interactive elements have focus indicators
      'focusable-content': {
        enabled: true,
      },
      // Ensure proper heading structure
      'heading-order': {
        enabled: true,
      },
      // Ensure all images have alt text
      'image-redundant-alt': {
        enabled: true,
      },
      // Ensure all buttons and links have discernible text
      'button-name': {
        enabled: true,
      },
      'link-name': {
        enabled: true,
      },
    },
  },
};
