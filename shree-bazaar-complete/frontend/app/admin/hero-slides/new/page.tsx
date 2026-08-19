import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default function NewHeroSlidePage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Add Hero Slide</h1>
      <p className="mb-6 text-[13.5px] text-gray-500">Create a new homepage banner slide.</p>
      <div className="max-w-[640px]">
        <HeroSlideForm />
      </div>
    </div>
  );
}
