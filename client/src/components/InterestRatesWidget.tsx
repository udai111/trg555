import React from 'react';

const InterestRatesWidget = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow mb-6">
      <iframe 
        frameBorder="0" 
        scrolling="no" 
        height="82" 
        width="100%"
        allowTransparency={true}
        marginWidth={0}
        marginHeight={0}
        src="https://sslirates.investing.com/index.php?rows=2&bg1=FFFFFF&bg2=F1F5F8&text_color=333333&enable_border=show&border_color=0452A1&header_bg=0452A1&header_text=FFFFFF&force_lang=56"
      />
      <div className="flex items-center justify-between p-2 border-t">
        <a 
          href="https://in.investing.com" 
          rel="nofollow" 
          target="_blank"
          className="flex items-center"
        >
          <img 
            title="Investing.com India" 
            alt="Investing.com India" 
            className="h-6"
            src="https://92f8049275b46d631f32-c598b43a8fdedd4f0b9230706bd7ad18.ssl.cf1.rackcdn.com/forexpros_en_logo.png"
          />
        </a>
        <span className="text-xs text-gray-600">
          Interest Rates powered by{' '}
          <a 
            href="https://in.investing.com/" 
            rel="nofollow" 
            target="_blank" 
            className="text-[#06529D] font-bold underline"
          >
            Investing.com India
          </a>
        </span>
      </div>
    </div>
  );
};

export default InterestRatesWidget;
