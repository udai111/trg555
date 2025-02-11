import { useEffect } from 'react';

interface FundamentalWidgetProps {
  symbol: string;
}

const FundamentalWidget = ({ symbol }: FundamentalWidgetProps) => {
  useEffect(() => {
    const init = async () => {
      try {
        // Remove existing widget containers
        const existingWidgets = document.querySelectorAll('.trendlyne-widgets');
        existingWidgets.forEach(widget => {
          if (widget.parentElement) {
            widget.parentElement.removeChild(widget);
          }
        });

        // Create new widget container
        const container = document.createElement('blockquote');
        container.className = 'trendlyne-widgets';
        container.setAttribute('data-theme', 'light');
        container.setAttribute(
          'data-get-url',
          `https://trendlyne.com/widgets/fundamental/${symbol}/`
        );

        // Add container to DOM
        const parent = document.getElementById('fundamental-container');
        if (parent) {
          parent.appendChild(container);
        }

        // Remove existing script
        const existingScript = document.querySelector('script[src*="tl-widgets.js"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }

        // Load widget script
        const script = document.createElement('script');
        script.src = "https://trendlyne.com/static/js/tl-widgets.js";
        script.async = true;
        document.body.appendChild(script);
      } catch (error) {
        console.error('Failed to initialize Trendlyne widget:', error);
      }
    };

    init();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src*="tl-widgets.js"]');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <div id="fundamental-container" className="h-[300px] w-full" />
  );
};

export default FundamentalWidget;