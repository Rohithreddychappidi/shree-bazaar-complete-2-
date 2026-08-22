"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { useHeroSlides } from "@/lib/use-hero-slides";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroBanner() {
  const { slides, loading } = useHeroSlides();

  if (loading) {
    return (
      <div className="mx-auto mt-5 max-w-[1280px] px-6">
        <div className="h-[260px] animate-pulse rounded-[18px] bg-purple-50 sm:h-[320px] lg:h-[380px]" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="hero-banner mx-auto mt-5 max-w-[1280px] px-6">
      <div className="relative overflow-hidden rounded-[18px]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          navigation={{ prevEl: ".hero-prev", nextEl: ".hero-next" }}
          pagination={{ clickable: true, el: ".hero-dots", bulletClass: "hero-dot", bulletActiveClass: "hero-dot-active" }}
          className="h-[260px] sm:h-[320px] lg:h-[380px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative flex h-full items-center">
                <Image src={slide.image} alt={slide.title} fill priority className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(18,38,29,0.5)] via-[rgba(18,38,29,0.22)] to-transparent" />
                <div className="relative z-10 max-w-[480px] px-8 text-white sm:px-14">
                  <div className="mb-2.5 text-xs font-semibold tracking-[2px] uppercase opacity-85">{slide.eyebrow}</div>
                  <h2 className="mb-3.5 text-2xl leading-tight font-bold sm:text-4xl">{slide.title}</h2>
                  <p className="mb-5 hidden max-w-[400px] text-sm opacity-90 sm:block">{slide.text}</p>
                  <Button href={slide.ctaHref} variant="white">
                    {slide.ctaLabel}
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-3.5">
          <button className="hero-prev pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/85 transition-colors hover:bg-white">
            <ChevronLeft size={18} />
          </button>
          <button className="hero-next pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/85 transition-colors hover:bg-white">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="hero-dots absolute bottom-[18px] left-1/2 z-20 flex -translate-x-1/2 gap-2" />
      </div>
    </div>
  );
}