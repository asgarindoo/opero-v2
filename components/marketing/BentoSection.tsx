import WorkBoard from "./WorkBoard";
import ActivityStats from "./ActivityStats";

export default function BentoSection() {
  return (
    <section
      id="features"
      className="max-w-[1440px] mx-auto px-[20px] sm:px-[32px] md:px-[48px] pt-0 pb-[64px] sm:pb-[80px] md:py-[96px] relative"
    >
      {/* Full-width smile curve with paper plane */}
      {/*
        viewBox: 0 0 1440 300, path: M0,20 Q720,290 1440,20
        Plane at left=58% → t=0.58, y ≈ 151.5px
        Icon h=48px → top = 151.5 - 24 = 127.5px ≈ 128px
      */}
      <div
        className="relative w-screen left-1/2 -translate-x-1/2 mb-2 pointer-events-none h-[130px] sm:h-[180px] md:h-[300px]"
      >
        <svg
          viewBox="0 0 1440 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 Q720,290 1440,20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="9 7"
            strokeLinecap="round"
            className="text-outline/30"
            fill="none"
          />
        </svg>

        {/* Paper plane — t=0.65 → y≈47.6% of container height at all breakpoints */}
        <div
          className="absolute text-primary/50"
          style={{
            left: "65%",
            top: "47.6%",
            transform: "translateX(-50%) translateY(-50%) rotate(-6deg)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </div>
      </div>

      {/* Section header */}
      <div className="text-center mt-[32px] sm:mt-[40px] mb-[36px] sm:mb-[50px]">
        {/* Label chip */}
        <div className="inline-flex items-center gap-2 bg-surface-container border border-outline/10 rounded-full px-4 py-1.5 mb-4">
          <span className="material-symbols-outlined text-primary text-[14px]">grid_view</span>
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.05em] font-semibold">
            Features
          </span>
        </div>

        <h2 className="font-display text-[26px] sm:text-[32px] text-primary leading-tight mb-3 tracking-[-0.02em] font-bold">
          Everything your team needs, in one place
        </h2>
        <p className="font-body-lg text-[14px] sm:text-[16px] text-on-surface-variant max-w-xl mx-auto opacity-80">
          From client requests to daily operations — OPERO organizes it all as structured, trackable units of work.
        </p>
      </div>

      {/* Bento Grid
           mobile: 1 col
           md (tablet): 2 col — no stretch
           lg (desktop): 4 col with row spans
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-5 sm:gap-6 relative z-10">

        {/* Large Card — Work board (interactive) */}
        <div className="md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-2 bg-surface-container-lowest rounded-[0.75rem] border border-outline/10 p-5 sm:p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 sm:w-80 sm:h-80 bg-primary/5 rounded-full blur-[60px]" />
          <div className="relative z-10 h-full">
            <WorkBoard />
          </div>
        </div>

        {/* Team Collaboration — chat bubbles */}
        <div className="md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1 bg-surface rounded-[1.25rem] border border-outline/5 p-4 sm:p-5 lg:p-7 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 lg:gap-4 group hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden">
          <div>
            <h3 className="font-display text-[18px] sm:text-[20px] lg:text-[28px] text-primary mb-1 font-semibold">Team collaboration</h3>
            <p className="font-body-sm text-[12px] sm:text-[13px] lg:text-[15px] text-on-surface-variant">Chat tied directly to each work item.</p>
          </div>
          <div className="flex flex-col gap-2.5 pt-4">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-primary shrink-0">AS</div>
              <div className="bg-surface-container rounded-2xl rounded-bl-sm px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-[13px] text-on-surface max-w-[70%]">Client wants another logo revision 😅</div>
            </div>
            <div className="flex items-end gap-2 flex-row-reverse">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-on-primary shrink-0">JD</div>
              <div className="bg-primary text-on-primary rounded-2xl rounded-br-sm px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-[13px] max-w-[70%]">Got it, converting it into a Work item</div>
            </div>
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-primary shrink-0">AS</div>
              <div className="bg-surface-container rounded-2xl rounded-bl-sm px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-[13px] text-on-surface max-w-[70%]">Sure, I'll assign it to Reza</div>
            </div>
          </div>
        </div>

        {/* Bot Creation card */}
        <div className="md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1 bg-surface rounded-[1.25rem] border border-outline/8 p-4 sm:p-5 lg:p-7 shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col gap-3 lg:gap-4 group hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h3 className="font-h3 text-[15px] sm:text-[16px] lg:text-[18px] text-primary mb-1 font-semibold">Create a bot</h3>
            <p className="font-body-sm text-[11px] sm:text-[12px] lg:text-[13px] text-on-surface-variant">WhatsApp & Telegram Bot</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="bg-surface-container border border-outline/10 rounded-xl px-3 py-2 sm:py-2.5">
              <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Bot name</div>
              <div className="font-body-sm text-[12px] sm:text-[13px] text-on-surface font-semibold">Customer Service Bot</div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-on-surface text-surface rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">chat</span>
                <span className="font-label-caps text-[10px] font-semibold uppercase tracking-wider">WhatsApp</span>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-surface-container border border-outline/10 rounded-xl px-3 py-2.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">send</span>
                <span className="font-label-caps text-[10px] font-semibold uppercase tracking-wider">Telegram</span>
              </div>
            </div>
            <div className="bg-surface-container border border-outline/10 rounded-xl px-3 py-2 sm:py-2.5">
              <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Purpose</div>
              <div className="flex items-center justify-between">
                <div className="font-body-sm text-[12px] sm:text-[13px] text-on-surface font-semibold">Answer FAQ & collect requests</div>
                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-on-surface/40">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Tracking */}
        <div className="md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1 bg-[#0f0f0f] rounded-[1.25rem] p-4 sm:p-5 lg:p-7 shadow-xl flex flex-col gap-4 lg:gap-5 group hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h3 className="font-h3 text-[15px] sm:text-[16px] lg:text-[18px] text-white mb-1 font-semibold">Activity tracking</h3>
            <p className="font-body-sm text-[11px] sm:text-[12px] lg:text-[13px] text-white/40">Work progress, at a glance.</p>
          </div>
          <ActivityStats />
          <p className="font-label-caps text-[10px] text-white/25 uppercase tracking-wider mt-auto">This week · Apr 28 – May 4</p>
        </div>

      </div>
    </section>
  );
}
