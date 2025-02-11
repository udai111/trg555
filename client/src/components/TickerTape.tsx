import { useEffect, useRef } from 'react';

const TickerTape = () => {
  const widgetRef = useRef<HTMLIFrameElement>(null);
  const widgetId = 'TickerTape-7xktr4e';

  useEffect(() => {
    const handleMessage = (msg: MessageEvent) => {
      const widget = widgetRef.current;
      if (!widget) return;

      const styles = msg.data?.styles;
      const token = msg.data?.token;
      const urlToken = new URL(widget.src)?.searchParams?.get?.('token');

      if (styles && token === urlToken) {
        Object.keys(styles).forEach(key => 
          widget.style.setProperty(key, styles[key])
        );
      }

      const height = msg.data?.tickerTapeHeight;
      if (height) {
        widget.style.setProperty('height', `${height}px`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="w-full bg-background">
      <iframe
        ref={widgetRef}
        id={widgetId}
        style={{ border: 'none', width: '100%', height: '100%' }}
        data-widget-name="TickerTape"
        src="https://widget.darqube.com/ticker-tape?token=67ab1d7b1d16f9859324d193"
      />
    </div>
  );
};

export default TickerTape;
