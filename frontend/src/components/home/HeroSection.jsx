const HeroSection = () => {
  return (
    <section className="relative h-40 sm:h-52 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-[#0f1a3a] to-[#050816]" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.04] rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/[0.03] rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
          Where Game Ideas Meet Concept Art
        </h1>
        <p className="text-gray-400 mt-2 sm:mt-3 text-xs sm:text-sm max-w-xl leading-relaxed">
          A platform for concept artists, game developers, and publishers to
          showcase work, share ideas, and find creative collaborators.
        </p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#050816] to-transparent" />
    </section>
  );
};

export default HeroSection;
