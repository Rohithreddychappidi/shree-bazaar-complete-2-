import Image from "next/image";
import { TeamMember } from "@/lib/types";

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="rounded-2xl border border-[#EFEDF8] bg-white p-6 text-center">
      <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-purple-50">
        <Image src={member.image} alt={member.name} fill className="object-cover" sizes="96px" />
      </div>
      <h4 className="text-sm font-semibold text-gray-900">{member.name}</h4>
      <p className="text-[12.5px] text-gray-500">{member.role}</p>
    </div>
  );
}
