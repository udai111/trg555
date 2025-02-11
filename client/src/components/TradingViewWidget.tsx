import React from 'react';

const TradingViewWidget = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow mb-6">
      <iframe 
        height="480" 
        width="100%" 
        src="https://ssltvc.investing.com/?pair_ID=160&height=480&width=650&interval=300&plotStyle=area&domain_ID=56&lang_ID=56&timezone_ID=20"
        style={{ border: 'none' }}
      />
      <div className="text-center text-sm font-sans my-2.5 text-[#9db2bd]">
        <span>Powered by </span>
        <a 
          href="https://www.investing.com/" 
          target="_blank"
          className="no-underline text-[#bb3534] font-semibold"
          rel="noopener noreferrer"
        >
          Investing.com
        </a>
      </div>
    </div>
  );
};

export default TradingViewWidget;
