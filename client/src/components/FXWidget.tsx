import React from 'react';

const FXWidget = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow mb-6">
      <iframe 
        src="https://fxpricing.com/fx-widget/ticker-tape-widget.php?id=1,20,379,774,25&border=show&speed=50&click_target=blank&theme=light&tm-cr=FFFFFF&hr-cr=00000013&by-cr=28A745&sl-cr=DC3545&flags=circle&d_mode=compact-name&column=ask,bid,spread&lang=en&font=Arial, sans-serif" 
        width="100%" 
        height="85" 
        style={{ border: 'unset' }}
      />
      <div 
        id="fx-pricing-widget-copyright"
        className="text-center text-sm font-sans my-2.5 text-[#9db2bd]"
      >
        <span>Powered by </span>
        <a 
          href="https://fxpricing.com/" 
          target="_blank"
          className="no-underline text-[#bb3534] font-semibold"
          rel="noopener noreferrer"
        >
          FX Pricing
        </a>
      </div>
    </div>
  );
};

export default FXWidget;
