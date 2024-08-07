import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
        <div className="">
          <img className="h-10 w-10" src="./logo.png" alt="ACME Logo" />
        </div>
      </div>
    </header>
  );
};

export default Header;