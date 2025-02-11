import { useEffect } from 'react';

interface TickerTapeProps {
  symbol: string;
}

const TickerTape = ({ symbol }: TickerTapeProps) => {
  useEffect(() => {
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
      `https://trendlyne.com/web-widget/technical-widget/Poppins/${symbol}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`
    );

    // Add container to DOM
    const parent = document.getElementById('ticker-container');
    if (parent) {
      parent.appendChild(container);
    }

    // Load Trendlyne widget script
    const script = document.createElement('script');
    script.src = "https://cdn-static.trendlyne.com/static/js/webwidgets/tl-widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]); // Re-run effect when symbol changes

  return <div id="ticker-container" />;
};

export default TickerTape;