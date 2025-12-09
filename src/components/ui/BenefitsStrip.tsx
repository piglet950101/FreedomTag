import { Heart, ScanLine, TrendingUp } from "lucide-react";
import React from "react";

export default function BenefitsStrip(): JSX.Element {
  const items = [
    {
      icon: Heart,
      title: "Direct Impact",
      desc: "100% of your donation goes directly to the beneficiary",
    },
    {
      icon: ScanLine,
      title: "Instant & Secure",
      desc: "Blockchain-verified transactions in seconds",
    },
    {
      icon: TrendingUp,
      title: "Track Impact",
      desc: "See exactly where your donation goes",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
      {items.map(({ icon: Icon, title, desc }, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold text-emerald-700">{title}</div>
              <div className="text-sm text-emerald-700/80">{desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
