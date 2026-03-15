"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Facebook, Github, Instagram, Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  vision: string;
  social: {
    github: string;
    linkedin: string;
    facebook: string;
    instagram: string;
  };
}

interface TeamCarouselProps {
  members: TeamMember[];
}

const TeamCarousel = ({ members }: TeamCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const isDragging = useRef(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [cardsPerView, setCardsPerView] = useState(1);

  const getCardsPerView = useCallback((width: number) => {
    if (width >= 1024) return 2; // desktop
    if (width >= 768) return 2; // tablet (can show two)
    return 1; // mobile
  }, []);

  const recalculatePages = useCallback(() => {
    const container = scrollerRef.current;
    if (!container) return;
    const pageWidth = container.clientWidth;
    if (pageWidth <= 0) {
      setPageCount(1);
      setCardsPerView(1);
      return;
    }
    const nextCardsPerView = getCardsPerView(pageWidth);
    setCardsPerView(nextCardsPerView);
    const totalPages = Math.ceil(members.length / nextCardsPerView);
    setPageCount(Math.max(1, totalPages));
  }, [getCardsPerView, members.length]);

  const getPageStartLeft = useCallback((page: number) => {
    const container = scrollerRef.current;
    if (!container) return 0;
    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-team-card='true']"));
    if (cards.length === 0) return 0;

    const startIndex = Math.max(0, Math.min(page * cardsPerView, cards.length - 1));
    return cards[startIndex]?.offsetLeft ?? 0;
  }, [cardsPerView]);

  useEffect(() => {
    recalculatePages();

    const onResize = () => recalculatePages();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [recalculatePages, members.length]);

  const updateActivePage = () => {
    const container = scrollerRef.current;
    if (!container) return;

    let nextPage = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (let page = 0; page < pageCount; page++) {
      const pageLeft = getPageStartLeft(page);
      const distance = Math.abs(container.scrollLeft - pageLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        nextPage = page;
      }
    }

    setActivePage(Math.max(0, Math.min(nextPage, pageCount - 1)));
  };

  const scrollToPage = (page: number) => {
    const container = scrollerRef.current;
    if (!container) return;
    const safePage = Math.max(0, Math.min(page, pageCount - 1));
    container.scrollTo({
      left: getPageStartLeft(safePage),
      behavior: "smooth",
    });
    setActivePage(safePage);
  };

  const handlePrev = () => scrollToPage(activePage - 1);
  const handleNext = () => scrollToPage(activePage + 1);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollerRef.current;
    if (!container) return;
    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragStartScrollLeft.current = container.scrollLeft;
    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollerRef.current;
    if (!container || !isDragging.current) return;
    const deltaX = event.clientX - dragStartX.current;
    container.scrollLeft = dragStartScrollLeft.current - deltaX;
    updateActivePage();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollerRef.current;
    if (!container) return;
    isDragging.current = false;
    container.releasePointerCapture(event.pointerId);
    updateActivePage();
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={() => {
            updateActivePage();
            recalculatePages();
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth select-none cursor-grab active:cursor-grabbing"
          style={{ transitionDuration: "400ms" }}
        >
          {members.map((member) => (
            <article
              key={member.name}
              data-team-card="true"
              className="min-w-0 w-full md:w-[calc(50%-10px)] h-[332px] shrink-0 snap-start rounded-xl border border-white/10 bg-gray-900/55 p-5 hover:border-blue-400/40 transition-colors duration-300 flex flex-col"
            >
              <div className="relative h-24 w-24 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-blue-400/35 shadow-[0_0_0_6px_rgba(59,130,246,0.12)]">
                <Image
                  src={member.image}
                  alt={`${member.name} profile picture`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="text-center">
                <h3 className="text-[1.1rem] font-semibold tracking-tight text-white leading-tight">{member.name}</h3>
                <p className="text-blue-300/95 text-xs font-medium uppercase tracking-[0.12em] mt-1">{member.role}</p>
              </div>

              <p className="mt-3 text-gray-300/95 text-sm leading-relaxed text-center px-1 italic">
                "{member.vision}"
              </p>

              <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-center gap-2.5">
                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} GitHub`}
                  className="h-8 w-8 rounded-full border border-white/20 bg-black/35 text-gray-200 hover:text-white hover:border-blue-400/60 hover:bg-blue-500/20 transition-colors duration-300 flex items-center justify-center"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} LinkedIn`}
                  className="h-8 w-8 rounded-full border border-white/20 bg-black/35 text-gray-200 hover:text-white hover:border-blue-400/60 hover:bg-blue-500/20 transition-colors duration-300 flex items-center justify-center"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href={member.social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} Facebook`}
                  className="h-8 w-8 rounded-full border border-white/20 bg-black/35 text-gray-200 hover:text-white hover:border-blue-400/60 hover:bg-blue-500/20 transition-colors duration-300 flex items-center justify-center"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={member.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${member.name} Instagram`}
                  className="h-8 w-8 rounded-full border border-white/20 bg-black/35 text-gray-200 hover:text-white hover:border-blue-400/60 hover:bg-blue-500/20 transition-colors duration-300 flex items-center justify-center"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <button
          onClick={handlePrev}
          disabled={activePage <= 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-white/20 bg-black/40 text-white flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black/55 transition-colors duration-300"
          aria-label="Previous team cards"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          disabled={activePage >= pageCount - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-white/20 bg-black/40 text-white flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:bg-black/55 transition-colors duration-300"
          aria-label="Next team cards"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={`team-page-${index}`}
            onClick={() => scrollToPage(index)}
            aria-label={`Go to team page ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activePage === index ? "w-7 bg-blue-400" : "w-2.5 bg-white/35 hover:bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamCarousel;
