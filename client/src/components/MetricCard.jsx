import AnimatedCard from "./AnimatedCard";
import GradientText from "./GradientText";

export default function MetricCard({ title, value, subtitle, index = 0, icon }) {
  return (
    <AnimatedCard delay={index * 0.08} className="pastel-border p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="cute-subtext text-sm font-bold">{title}</p>
        {icon ? <span className="text-xl text-[#ca93b2]">{icon}</span> : null}
      </div>
      <GradientText as="h3" className="mt-2 font-[Poppins] text-3xl font-extrabold tracking-wide">
        {value}
      </GradientText>
      {subtitle ? <p className="cute-subtext mt-1 text-sm">{subtitle}</p> : null}
    </AnimatedCard>
  );
}
