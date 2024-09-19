import React from "react";
import Board from "./components/Board";
import AppIcon from "./icons/AppIcon";
import HomeIcon from "./icons/HomeIcon";

const App: React.FC = () => {
  return (
    <div className="
    m-auto
    p-4
    bg-gradient-to-r from-blue-700 via-purple-500 to-pink-400 h-screen font-sans
    "
    >
      <header className="App-header flex flex-col  items-center py-4">
        {/* <div>
          <HomeIcon />
        </div> */}
        <div className="flex items-center space-x-4">
          <AppIcon />
          <h1 className="text-4xl font-semibold font-sans text-white">Trello</h1>
        </div>
      </header>
      <main>
        <Board />
      </main>
    </div>
  );
};

export default App;
