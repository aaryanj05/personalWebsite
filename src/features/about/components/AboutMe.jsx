import React, { useState } from "react";
import SectionHeading from "../../../components/ui/SectionHeading";
import PhotoMosaic from "./PhotoMosaic";
import { contentService } from "../../../services/content";
import aboutImg from "../../../assets/aaryan-about.jpg";

const AboutMe = () => {
  const [images] = useState(() => {
    try {
      return contentService.getAboutImages();
    } catch (error) {
      console.error("Error fetching about images:", error);
      return [];
    }
  });

  return (
    <>
      {/* ---- Foreground content ---- */}
      <section className="relative z-10 w-full text-white font-adamant">
        <SectionHeading title="About Me" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Content Layout */}
          <div className="flex flex-col lg:flex-row justify-center items-start lg:items-center gap-8 lg:gap-12">
            {/* Image Container */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <img
                className="w-full max-w-md lg:w-[580px] h-auto rounded-2xl object-cover shadow-2xl"
                src={aboutImg}
                alt="Aaryan"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
              />
            </div>

            {/* Text Content */}
            <div className="w-full lg:w-[580px] flex flex-col gap-6">
              {/* Background Section */}
              <div
                className="w-full py-6 px-5 rounded-xl overflow-hidden
                           relative
                           after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px
                           after:bg-gradient-to-r after:from-white/10 after:to-transparent
                           before:content-[''] before:absolute before:left-0 before:right-0 before:top-0 before:h-px
                           before:bg-gradient-to-r before:from-white/10 before:to-transparent"
              >
                <h3 className="text-white/80 text-sm tracking-[0.2em] uppercase font-adamant font-normal mb-4">
                  My Background
                </h3>

                <div className="w-full flex flex-col gap-4">
                  <p className="text-neutral-300 text-lg font-normal font-adamant leading-relaxed">
                    Technically a{" "}
                    <span className="text-white font-semibold">
                      Business + SWE Student at Ivey Business School
                    </span>
                    , but most of what I care about happens outside the
                    classroom. I’m in third year, graduating in 2028, and based
                    near Toronto.
                  </p>

                  <p className="text-neutral-300 text-lg font-normal font-adamant leading-relaxed">
                    I spend most of my time building at the intersection of
                    design and engineering, turning rough ideas into
                    high-fidelity interfaces that actually ship. I care about
                    craft, clean systems, and closing the gap between design
                    intent and real, usable code.
                  </p>

                  <p className="text-neutral-300 text-lg font-normal font-adamant leading-relaxed">
                    Outside of that, I swim (un)competitively, follow{" "}
                    <span className="text-white font-semibold">
                      Mercedes in F1
                    </span>
                    , and listen to an unhealthy mix of random playlists on{" "}
                    <span className="text-white font-semibold">Spotify</span>.
                  </p>

                  <p className="text-neutral-300 text-lg font-normal leading-relaxed">
                    No big story behind the bear. He’s just cool. And he’s
                    staying.
                  </p>

                  <p className="text-neutral-300 text-lg font-normal leading-relaxed">
                    A few snapshots from my world are down below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Mosaic */}
      <PhotoMosaic images={images} />
    </>
  );
};

// Optimized for performance by adding React.memo to avoid unnecessary re-renders
export default React.memo(AboutMe);
