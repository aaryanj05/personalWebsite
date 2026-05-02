/* HeroTypingAnimation.jsx */
import React, { useEffect, useRef } from "react";
import AnimatedCursor from "../../../components/common/AnimatedCursor";
import {
  motion as Motion,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import useHeroAnimation from "../hooks/useHeroAnimation";
import HeroFrame from "./HeroFrame";
import TypewriterText from "./TypewriterText";

/* ── constants ─────────────────────────────────────────────── */
const HEADLINE = "Aaryan Joharapurkar";
const HERO_INTRO_SESSION_KEY = "heroIntroSeen";

// Set to true to skip typing animation and show final state immediately
// Set to false to play the full typing animation sequence
const SKIP_TYPING_ANIMATION = false;

// Track whether the hero intro has already played in this SPA session
let heroIntroHasPlayed = false;
let sessionStorageStatus = null;

const isSessionStorageReady = () => {
  if (sessionStorageStatus !== null) return sessionStorageStatus;
  if (typeof window === "undefined" || !window.sessionStorage) return false;
  try {
    const testKey = "__hero_intro_test__";
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    sessionStorageStatus = true;
  } catch {
    sessionStorageStatus = false;
  }
  return sessionStorageStatus;
};

const detectNavigationType = () => {
  if (typeof window === "undefined" || typeof performance === "undefined")
    return "navigate";
  if (typeof performance.getEntriesByType === "function") {
    const [navEntry] = performance.getEntriesByType("navigation");
    if (navEntry && navEntry.type) return navEntry.type;
  }
  if (
    performance.navigation &&
    typeof performance.navigation.type === "number"
  ) {
    const { TYPE_RELOAD, TYPE_BACK_FORWARD, TYPE_NAVIGATE } =
      performance.navigation;
    switch (performance.navigation.type) {
      case TYPE_RELOAD:
        return "reload";
      case TYPE_BACK_FORWARD:
        return "back_forward";
      case TYPE_NAVIGATE:
        return "navigate";
      default:
        return "navigate";
    }
  }
  return "navigate";
};

const getHeroIntroSeen = () => {
  if (isSessionStorageReady()) {
    const seen =
      window.sessionStorage.getItem(HERO_INTRO_SESSION_KEY) === "true";
    if (seen) heroIntroHasPlayed = true;
    return seen;
  }
  return heroIntroHasPlayed;
};

const markHeroIntroSeen = () => {
  heroIntroHasPlayed = true;
  if (isSessionStorageReady()) {
    window.sessionStorage.setItem(HERO_INTRO_SESSION_KEY, "true");
  }
};

// Allow a hard refresh on the home route to replay the intro sequence
if (detectNavigationType() === "reload" && isSessionStorageReady()) {
  window.sessionStorage.removeItem(HERO_INTRO_SESSION_KEY);
  heroIntroHasPlayed = false;
}

// Optimized for performance by wrapping with React.memo
const HeroTypingAnimation = React.memo(() => {
  const bodyRef = useRef(null);
  const headlineRef = useRef(null);
  const shouldRunIntro = React.useRef(
    !SKIP_TYPING_ANIMATION && !getHeroIntroSeen(),
  ).current;
  const [showDragHint, setShowDragHint] = React.useState(true);
  const [hintPosition, setHintPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const sectionRef = useRef(null);

  const markIntroSeen = React.useCallback(() => {
    markHeroIntroSeen();
  }, []);

  /* motion values for drag / snap */
  const frameRef = useRef(null);

  // Calculate proper initial position based on screen size and text width
  const getInitialX = () => {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        return 16;
      } else {
        return -120;
      }
    }
    return -120;
  };

  const x = useMotionValue(getInitialX());
  const y = useMotionValue(0);

  const {
    state,
    dispatch,
    cursorKey,
    pendingSnapBack,
    snapBack,
    handleCursorDragComplete,
    handleCursorReadyToDragSnap,
  } = useHeroAnimation({ frameRef, bodyRef, x, y, markIntroSeen });

  // Track frame's position relative to section for positioning the drag hint
  // Calculate when dragOK becomes true (when hint is about to show) to ensure frame is in final position
  // Also recalculate on window resize to handle desktop/mobile switching
  useEffect(() => {
    if (!state.showFrame || !state.dragOK) return;
    if (!frameRef.current || !sectionRef.current) return;

    const updateHintPosition = () => {
      if (!frameRef.current || !sectionRef.current) return;

      const frameRect = frameRef.current.getBoundingClientRect();
      const sectionRect = sectionRef.current.getBoundingClientRect();

      // Calculate position relative to the section
      // Position at the right edge of the frame (frameRect.right relative to section)
      const frameRightEdge = frameRect.right - sectionRect.left;

      setHintPosition({
        x: frameRightEdge - 20, // 20px to the right of frame's right edge
        y: frameRect.top - sectionRect.top - 110, // 110px above frame
      });
    };

    // Use requestAnimationFrame to ensure layout is complete
    const rafId = requestAnimationFrame(updateHintPosition);

    // Add resize listener to recalculate position when switching between desktop/mobile
    window.addEventListener("resize", updateHintPosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateHintPosition);
    };
  }, [state.showFrame, state.dragOK]);

  // Update x position when screen size changes
  useEffect(() => {
    if (state.frameAligned && frameRef.current && bodyRef.current) {
      const frameRect = frameRef.current.getBoundingClientRect();
      const bodyRect = bodyRef.current.getBoundingClientRect();
      const targetLeft = bodyRect.left;
      const currentLeft = frameRect.left;
      const deltaNeeded = targetLeft - currentLeft;
      const finalX = x.get() + deltaNeeded;
      dispatch({ type: "SET_CENTRE_X", value: finalX });
      x.set(finalX);
      dispatch({ type: "SET_FRAME_FROZEN", value: false });
    } else {
      const newX = getInitialX();
      x.set(newX);
    }
  }, [x, state.frameAligned, dispatch]);

  /* ── orchestrate the sequence ───────────────────────────── */
  useEffect(() => {
    if (!shouldRunIntro) return;
    markIntroSeen();
    (async () => {
      await new Promise((r) => setTimeout(r, 100));
      dispatch({ type: "SET_SHOW_FRAME", value: true });
      dispatch({ type: "SET_PHASE", value: "typing" });
      // Typing animation: update textContent directly for performance
      // Only dispatch once to set phase, then use ref for all text updates
      if (headlineRef.current) headlineRef.current.textContent = "";
      for (let i = 0; i <= HEADLINE.length; i++) {
        if (headlineRef.current)
          headlineRef.current.textContent = HEADLINE.slice(0, i);
        // REMOVED: dispatch call that was causing 23 re-renders per typing sequence
        await new Promise((r) => setTimeout(r, 55));
      }
      setTimeout(
        () => dispatch({ type: "SET_SHOW_CURSOR", value: false }),
        200,
      );
      await new Promise((r) => setTimeout(r, 300));
      dispatch({ type: "SET_SHOW_BODY", value: true });
      dispatch({ type: "SET_FRAME_FROZEN", value: true });
    })();
  }, [shouldRunIntro, x, markIntroSeen, dispatch]);

  // Skip intro: immediately show final state when returning to Home without a hard refresh
  useEffect(() => {
    if (shouldRunIntro) return;
    dispatch({ type: "SET_SHOW_FRAME", value: true });
    dispatch({ type: "SET_PHASE", value: "frameMoved" });
    dispatch({ type: "SET_SHOW_BODY", value: true });
    dispatch({ type: "SET_FRAME_FROZEN", value: false });
    dispatch({ type: "SET_CURSOR_TRIGGERED", value: true });
    dispatch({ type: "SET_DRAG_OK", value: true });
    dispatch({ type: "SET_FRAME_ALIGNED", value: true });
    dispatch({ type: "SET_SHOW_CURSOR", value: false });
    dispatch({ type: "SET_SHOW_ANIMATED_CURSOR", value: false });
    dispatch({ type: "SET_CURSOR_SHOULD_EXIT", value: true });
    markIntroSeen();
    const rafId = requestAnimationFrame(() => {
      if (headlineRef.current) headlineRef.current.textContent = HEADLINE;
    });
    return () => cancelAnimationFrame(rafId);
  }, [shouldRunIntro, markIntroSeen, dispatch]);

  /* ── render ─────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      className="relative w-full max-w-screen-xl mx-auto px-4 pt-8 md:px-6 md:pt-64 text-white font-adamant overflow-visible"
    >
      {/* Animated cursor overlay - shown on both mobile and desktop */}
      {state.showAnimatedCursor && (
        <AnimatedCursor
          key={cursorKey}
          targetRef={frameRef}
          onDragComplete={handleCursorDragComplete}
          onCursorReadyToDrag={handleCursorReadyToDragSnap}
          shouldExit={state.cursorShouldExit}
        />
      )}

      {/* ── headline & draggable blue frame ── */}
      <HeroFrame
        frameRef={frameRef}
        state={state}
        pendingSnapBack={pendingSnapBack}
        snapBack={snapBack}
        dispatch={dispatch}
        x={x}
        y={y}
        getInitialX={getInitialX}
        onDragStart={() => setShowDragHint(false)}
      >
        <TypewriterText
          headlineRef={headlineRef}
          showCursor={state.showCursor}
        />
      </HeroFrame>

      {/* "drag me!" hint - positioned absolutely, independent of draggable frame */}
      <AnimatePresence>
        {state.showFrame && state.dragOK && showDragHint && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              exit: { duration: 0.8, ease: "easeOut" },
            }}
            className="hidden md:block absolute pointer-events-none z-50"
            style={{
              left: hintPosition.x,
              top: hintPosition.y,
              transform: "scale(1.25)",
              transformOrigin: "top left",
            }}
          >
            <div className="flex flex-col items-start">
              <span className="text-2xl text-[#9b9cbe] font-medium italic whitespace-nowrap">
                drag me!
              </span>
              {/* Hand-drawn curved arrow pointing down-left toward frame */}
              <svg
                width="60"
                height="50"
                viewBox="0 0 60 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#9b9cbe]"
                style={{ marginLeft: "5px" }}
              >
                {/* Curved path from top-right sweeping down to bottom-left */}
                <path
                  d="M 50 8 Q 40 12, 30 22 Q 20 32, 12 42"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Arrowhead - both lines go backward from tip forming V */}
                <path
                  d="M 11 35 L 12 42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 41 L 12 42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── body: tagline + meta grid ── */}
      {state.showBody && (
        <Motion.div
          ref={bodyRef}
          initial={false} // Avoid animating LCP content on mount
          className="mt-8 md:mt-12 space-y-10 md:space-y-12 max-w-[72rem] pb-20"
        >
          {/* tagline */}
          <p className="text-2xl md:text-[2.4rem] leading-relaxed md:leading-tight">
            A Software Engineering&nbsp;&amp;&nbsp;Business student at Ivey
            Business School, building tools that <em>(ideally)</em> make life
            easier — or at least break things in more interesting ways.
          </p>

          {/* "currently / driven by" grid */}
          <div className="grid gap-y-10 gap-x-24 sm:grid-cols-2 items-stretch">
            <div className="flex flex-col h-full">
              <p className="italic text-2xl md:text-3xl mb-2">currently</p>
              <p className="font-sans text-[#9b9cbe] font-medium uppercase tracking-[0.2em] text-sm md:text-base leading-relaxed -mt-1 mb-0">
                <span className="block">Business Analyst</span>
                <span className="block">@ RBC Amplify</span>
              </p>
            </div>
            <div className="flex flex-col h-full">
              <p className="italic text-2xl md:text-3xl mb-2">driven by</p>
              <p className="font-sans text-[#9b9cbe] font-medium uppercase tracking-[0.2em] text-sm md:text-base leading-relaxed -mt-1 mb-0">
                <span className="block">
                  Building interfaces, real systems, & an arguably unhealthy
                  obsession with bears.
                </span>
              </p>
            </div>
          </div>
        </Motion.div>
      )}
    </section>
  );
});

HeroTypingAnimation.displayName = "HeroTypingAnimation";

export default HeroTypingAnimation;
