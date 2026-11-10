export default function Header() {
  return (
    <header className="flex items-center justify-center bg-header px-5 py-[25px] text-ink max-[380px]:px-3 max-[380px]:py-5">
      <div className="flex items-center gap-[15px] max-[380px]:gap-2.5">
        <svg className="size-7 max-[380px]:size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>

        <h1 className="font-title text-[2.2rem] font-semibold tracking-[1px] max-sm:text-[1.7rem] max-[380px]:text-[1.45rem]">PostProject</h1>

        <svg className="size-7 max-[380px]:size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
    </header>
  );
}
