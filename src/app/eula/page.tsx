"use client";

import { useEffect } from "react";

export default function EULA() {
  useEffect(() => {
    // Enhanced navigation hiding function
    const hideNavigation = () => {
      // Hide navigation elements with more specific selectors
      const selectors = [
        'nav', '.navbar', '.navigation', 'header',
        '.navbar1_container-2', '.navbar1_menu-2', '.navbar1_menu-buttons',
        '.w-nav', '.w-nav-menu', '.w-nav-button',
        '[data-animation="default"]', '[role="banner"]'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.height = '0';
            el.style.overflow = 'hidden';
          }
        });
      });

      // Hide any elements with navigation-related classes
      const navClasses = document.querySelectorAll('[class*="nav"], [class*="Nav"]');
      navClasses.forEach(el => {
        if (el instanceof HTMLElement && !el.closest('iframe')) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      });

      // Add CSS to hide navigation globally
      const style = document.createElement('style');
      style.id = 'eula-nav-hide';
      style.textContent = `
        nav, .navbar, .navigation, header, 
        .navbar1_container-2, .navbar1_menu-2, .navbar1_menu-buttons,
        .w-nav, .w-nav-menu, .w-nav-button,
        [data-animation="default"], [role="banner"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('eula-nav-hide');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
    };

    // Hide navigation immediately
    hideNavigation();
    
    // Hide after multiple delays to catch dynamically loaded elements
    const timers = [100, 500, 1000, 2000].map(delay => 
      setTimeout(hideNavigation, delay)
    );
    
    // Set up MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches && element.matches('nav, .navbar, .navigation, header, .w-nav')) {
                hideNavigation();
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
      const style = document.getElementById('eula-nav-hide');
      if (style) style.remove();
    };
  }, []);

  return (
    <iframe 
      src="/skill-trait-webflow/eula.html"
      title="SkillTrait: EULA"
      className="w-full h-screen border-0"
      style={{ 
        width: '100%', 
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0
      }}
    />
  );
}
