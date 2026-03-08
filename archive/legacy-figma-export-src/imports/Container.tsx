function Link() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[0px] whitespace-nowrap" href="https://gbaltar.framer.website/#intro">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Intro</p>
      </a>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[31px]" data-name="Container">
      <Container2 />
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap" href="https://gbaltar.framer.website/#about">
        <p className="cursor-pointer leading-[19.6px]">About</p>
      </a>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[40px]" data-name="Container">
      <Container4 />
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap">
        <p className="leading-[19.6px]">Projetos</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link2 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[55px]" data-name="Container">
      <Container6 />
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap" href="https://gbaltar.framer.website/#experience">
        <p className="cursor-pointer">
          <span className="leading-[19.6px]">E</span>
          <span className="leading-[19.6px]">xperiência</span>
        </p>
      </a>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link3 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[77px]" data-name="Container">
      <Container8 />
    </div>
  );
}

function LeftLinks() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[16px] items-center justify-end left-[calc(50%-167.5px)] top-[calc(50%+0.2px)]" data-name="Left links">
      <Container1 />
      <Container3 />
      <Container5 />
      <Container7 />
    </div>
  );
}

function Link4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap" href="https://gbaltar.framer.website/#education">
        <p className="cursor-pointer">
          <span className="leading-[19.6px]">E</span>
          <span className="leading-[19.6px]">ducação</span>
        </p>
      </a>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link4 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[65px]" data-name="Container">
      <Container10 />
    </div>
  );
}

function Link5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap">
        <p className="leading-[19.6px]">Ferramentas</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link5 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[83px]" data-name="Container">
      <Container12 />
    </div>
  );
}

function Link6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap" href="https://gbaltar.framer.website/#blog">
        <p className="cursor-pointer leading-[19.6px]">Blog</p>
      </a>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link6 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[30px]" data-name="Container">
      <Container14 />
    </div>
  );
}

function Link7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ababab] text-[14px] whitespace-nowrap" href="https://gbaltar.framer.website/#contact">
        <p className="cursor-pointer">
          <span className="leading-[19.6px]">C</span>
          <span className="leading-[19.6px]">ontato</span>
        </p>
      </a>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Link7 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[54px]" data-name="Container">
      <Container16 />
    </div>
  );
}

function RightLinks() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[16px] items-center left-[calc(50%+178.88px)] top-[calc(50%+0.2px)]" data-name="Right links">
      <Container9 />
      <Container11 />
      <Container13 />
      <Container15 />
    </div>
  );
}

function Container17() {
  return <div className="shrink-0 size-[16px]" data-name="Container" />;
}

function MenuButton() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute backdrop-blur-[5px] bg-[#111] content-stretch flex flex-col items-center justify-center left-[calc(50%-1.62px)] py-[8px] rounded-[6px] top-1/2 w-[32px]" data-name="Menu button">
      <Container17 />
    </div>
  );
}

function Nav() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[32px] left-[calc(50%-13px)] top-1/2 w-[622px]" data-name="Nav">
      <LeftLinks />
      <RightLinks />
      <MenuButton />
    </div>
  );
}

function NavDesktopOpen() {
  return (
    <div className="absolute bg-[#242424] h-[36px] left-0 overflow-clip rounded-[8px] top-0 w-[660px]" data-name="Nav - Desktop - open">
      <Nav />
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <NavDesktopOpen />
    </div>
  );
}