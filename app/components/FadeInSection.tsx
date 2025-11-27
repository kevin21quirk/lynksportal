'use client';

import { useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
}

export default function FadeInSection({ children, delay = 0 }: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);
  const initialCheckDone = useRef(false);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;

    // Small delay to ensure page has loaded
    setTimeout(() => {
      if (!initialCheckDone.current) {
        const rect = currentRef.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Only show immediately if it's in the top 80% of viewport on initial load
        if (rect.top >= 0 && rect.top < windowHeight * 0.8 && window.scrollY < 100) {
          setIsVisible(true);
          hasTriggered.current = true;
          initialCheckDone.current = true;
          return;
        }
        initialCheckDone.current = true;
      }

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasTriggered.current) {
            setTimeout(() => {
              setIsVisible(true);
              hasTriggered.current = true;
            }, delay);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      });

      observer.observe(currentRef);

      return () => {
        observer.unobserve(currentRef);
      };
    }, 100);
  }, [delay]);

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}
