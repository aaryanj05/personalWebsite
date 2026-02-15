import React, { Suspense, lazy, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PremiumBackground from "./components/common/PremiumBackground";
import { NotesProvider } from "./features/notes/NotesContext";
import BearProvider from "./features/bear/context/BearContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollRestoration from "./components/common/ScrollRestoration";
import SeoManager from "./components/common/SeoManager";

// This reduces initial bundle size without changing functionality
const Home = lazy(() => import("./features/home/components/Home"));
const AboutMe = lazy(() => import("./features/about/components/AboutMe"));
const Projects = lazy(() => import("./features/projects/components/Projects"));
const NotePage = lazy(() => import("./features/notes/NotePage"));

function App() {
  const scrollContainerRef = useRef(null);

  return (
    <ErrorBoundary>
      <BearProvider>
        <NotesProvider>
          <SeoManager />
          {/* Skip Navigation Link for Accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Skip to main content
          </a>

          <div className="flex flex-col md:flex-row h-screen w-full bg-[#0C100D] overflow-hidden overflow-x-hidden">
            <NavBar />

            {/* Layout: Main content window wrapper - SCROLLABLE */}
            <div
              ref={scrollContainerRef}
              className="flex-1 h-full p-2 md:p-3 overflow-y-auto overflow-x-hidden relative scrollbar-gutter-stable"
              data-scroll-container="main"
            >
              <ScrollRestoration containerRef={scrollContainerRef} />
              <main
                id="main-content"
                tabIndex="-1"
                className="relative min-h-full w-full bg-transparent rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col isolate"
              >
                {/* Global background - Fixed to cover all content */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                  <PremiumBackground />
                </div>

                <div className="flex-1 relative z-0">
                  {/* ---- ROUTE OUTLET ---- */}
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="text-white/60 text-lg font-adamant">
                          Loading...
                        </div>
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/about" element={<AboutMe />} />
                      {/* Notes feature: only detail route is exposed */}
                      <Route path="/notes/:slug" element={<NotePage />} />
                    </Routes>
                  </Suspense>

                  {/* Footer lives outside Routes so it shows on every page */}
                  <Footer />
                </div>
              </main>
            </div>
          </div>
        </NotesProvider>
      </BearProvider>
    </ErrorBoundary>
  );
}

export default App;
