import Image from "next/image";
import TeamCard from "@/components/TeamCard";
import { team } from "@/lib/data";
import { Heart, Leaf, Handshake } from "lucide-react";

const values = [
  { icon: Heart, title: "Made with Care", text: "Every product is sourced or made the way it would be for our own family." },
  { icon: Leaf, title: "Rooted in Tradition", text: "We work with local makers to keep authentic recipes and craft alive." },
  { icon: Handshake, title: "Built on Trust", text: "Transparent pricing, honest sourcing, and support when you need it." },
];

const timeline = [
  { year: "2022", text: "Started as a small home-run pickle and podi business." },
  { year: "2023", text: "Expanded into women's ethnic wear and pooja essentials." },
  { year: "2024", text: "Launched pan-India shipping and combo gifting boxes." },
  { year: "2026", text: "Building our full online marketplace across every category." },
];

export default function AboutPage() {
  return (
    <main>
      <section className="relative flex h-[280px] items-center justify-center overflow-hidden bg-purple-700 text-center text-white sm:h-[340px]">
        <Image
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1600&auto=format&fit=crop"
          alt="Shop Hemu"
          fill
          className="object-cover opacity-30"
        />
        <div className="relative z-10 px-6">
          <div className="mb-3 text-xs font-semibold tracking-[2px] uppercase opacity-85">Our Story</div>
          <h1 className="text-3xl font-bold sm:text-4xl">Who We Are</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-6 py-14 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">From a home kitchen to your doorstep</h2>
        <p className="text-[15px] leading-relaxed text-gray-500">
          Shop Hemu started with a simple idea — bring the food, fashion and everyday essentials of home to
          people who no longer live close to it. What began with homemade pickles and podis has grown into a
          full marketplace spanning food, women&apos;s wear, pooja items, home decor and gifting.
        </p>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1280px] px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Our Values</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-[#EFEDF8] p-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                  <v.icon size={22} className="text-purple-700" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{v.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-gray-500">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[700px] px-6 py-14">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Our Journey</h2>
        <div className="flex flex-col gap-6 border-l-2 border-purple-100 pl-6">
          {timeline.map((t) => (
            <div key={t.year} className="relative">
              <div className="absolute top-1 -left-[31px] h-3 w-3 rounded-full bg-purple-700" />
              <div className="text-sm font-bold text-purple-700">{t.year}</div>
              <p className="mt-1 text-[13.5px] text-gray-600">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Meet the Team</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {team.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </section>
    </main>
  );
}
