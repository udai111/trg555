import { useEffect } from 'react';

interface SwotWidgetProps {
  symbol: string;
}

const SwotWidget = ({ symbol }: SwotWidgetProps) => {
  useEffect(() => {
    // Load Trendlyne widget script if not already loaded
    if (!document.querySelector('script[src*="tl-widgets.js"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn-static.trendlyne.com/static/js/webwidgets/tl-widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <blockquote 
      className="trendlyne-widgets" 
      data-get-url={`https://trendlyne.com/web-widget/swot-widget/Poppins/${symbol}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
      data-theme="light"
    />
  );
};

export default SwotWidget;