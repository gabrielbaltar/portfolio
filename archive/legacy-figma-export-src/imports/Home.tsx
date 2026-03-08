import svgPaths from "./svg-2ft0n7cr26";
import imgIrXZd6CF2VvDiix0JfGazJsd9UgJpg from "figma:asset/ed422992c0360fcab82e751d87ddbff879bd704e.png";
import imgLhf3IgLl87Ewc7EDrFourzAdGeJpg from "figma:asset/da6ea6d4dbd5e2695d520205d1c190282160b03f.png";
import imgUlvReqxDHuFzobZf0AoTil4V8Jpg from "figma:asset/4fef15ffe37a80448efac0bf026d25981bcf9a44.png";
import imgOuJv0UQa3Jjr5TSQkR8FvAiByMJpg from "figma:asset/3a985a2287bdb657952591def3ccbed2b7aa9f70.png";
import imgImageZ6A1Uul2IyYsOynJLfYeMuXTkPng from "figma:asset/a68a9c157103dbe2a5b09ae008998c5ac5052819.png";
import imgImageSDzIy1U53T5YBcy2EHun6E2OsJpg from "figma:asset/d024126e62b489c4c7de9deb170ef9449a29b1a1.png";
import imgImagePhUpoeFssCGpuR6LioEu8Kx9VgJpg from "figma:asset/fb268f0aea3180cff6e18fd685d0f97fa9a67250.png";
import img5Ob3HmgwBsS9Eav3CXlcJceZ1EJpeg from "figma:asset/122a85de3be629ba10426fc87c7baa881bb0f30b.png";
import { imgBottom } from "./svg-fgvs4";

function MenuButton() {
  return (
    <div className="-translate-x-1/2 absolute backdrop-blur-[5px] bg-[#242424] content-stretch flex flex-col items-center justify-center left-1/2 py-[8px] rounded-[6px] top-[16px] w-[32px]" data-name="Menu button">
      <div className="relative shrink-0 size-[16px]" data-name="plus-sign">
        <div className="absolute inset-[12.5%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <path clipRule="evenodd" d={svgPaths.p4099a00} fill="var(--fill-0, #ABABAB)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function NavNav() {
  return (
    <div className="absolute h-[52px] left-[370px] max-w-[700px] top-0 w-[700px]" data-name="Nav - Nav">
      <MenuButton />
    </div>
  );
}

function HeaderDesktopTablet() {
  return (
    <div className="absolute h-[52px] left-0 overflow-clip top-0 w-[1440px]" data-name="Header - Desktop/Tablet">
      <NavNav />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[52px] left-0 top-0 w-[1440px]" data-name="Container">
      <HeaderDesktopTablet />
    </div>
  );
}

function Bottom() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[38px] left-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px_0px] mask-size-[140px_38px] opacity-6 rounded-[11px] top-0 w-[140px]" data-name="Bottom" style={{ maskImage: `url('${imgBottom}')` }}>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_0px_0px_black]" />
    </div>
  );
}

function BottomMaskGroup() {
  return (
    <div className="absolute h-[38px] left-0 top-0 w-[140px]" data-name="Bottom:mask-group">
      <Bottom />
    </div>
  );
}

function Border() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[38px] left-0 opacity-4 rounded-[11px] top-0 w-[140px]" data-name="Border">
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_0px_1px_black]" />
    </div>
  );
}

function LinkLight() {
  return (
    <div className="absolute h-[38px] left-[1280px] top-[20px] w-[140px]" data-name="Link - Light">
      <BottomMaskGroup />
      <Border />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[78px] left-0 top-[822px] w-[1440px]" data-name="Container">
      <LinkLight />
    </div>
  );
}

function EditFramerContent() {
  return (
    <div className="absolute backdrop-blur-[5px] bg-[rgba(34,34,34,0.8)] h-[23px] left-0 opacity-0 overflow-clip rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(255,255,255,0.15)] top-0 w-[88px]" data-name="Edit Framer Content">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] not-italic text-[12px] text-white top-[11.5px] whitespace-nowrap">
        <p className="leading-[normal]">Edit Content</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[23px] left-[1343.45px] top-[438.5px] w-[88px]" data-name="Container">
      <EditFramerContent />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[45px] left-0 top-0 w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Hello, I'm John Smith, a web designer with 15 years of expertise in crafting visually stunning `}</p>
        <p>and user-friendly digital experiences.</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[68px] left-0 top-[19.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[34px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`My journey in web design began with a curiosity for how websites work and a desire to `}</p>
        <p className="mb-0">{`create something meaningful on the digital canvas. Over the years, I've honed my skills in `}</p>
        <p>user interface design, front-end development, and user experience optimization.</p>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute h-[87.405px] left-0 top-[45px] w-[700px]" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Content1() {
  return (
    <div className="absolute h-[132.405px] left-0 overflow-clip top-[56px] w-[700px]" data-name="Content">
      <Container4 />
      <Margin />
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Sobre mim</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading1 />
    </div>
  );
}

function Default() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container6 />
    </div>
  );
}

function Title() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Title">
      <Default />
    </div>
  );
}

function Content() {
  return (
    <div className="absolute h-[188.405px] left-[370px] top-[80px] w-[700px]" data-name="Content">
      <Content1 />
      <Title />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[328.405px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content />
    </div>
  );
}

function SectionAboutMe() {
  return (
    <div className="absolute bg-[#111] h-[328.405px] left-0 top-[284.41px] w-[1440px]" data-name="Section - About me">
      <Container3 />
    </div>
  );
}

function IrXZd6CF2VvDiix0JfGazJsd9UgJpg() {
  return (
    <div className="absolute h-[256.5px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[342px]" data-name="IrXZd6cF2VvDiix0jfGazJSD9ug.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-tl-[8px] rounded-tr-[8px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgIrXZd6CF2VvDiix0JfGazJsd9UgJpg} />
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="absolute h-[256.5px] left-0 overflow-clip top-0 w-[342px]" data-name="Image">
      <IrXZd6CF2VvDiix0JfGazJsd9UgJpg />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[284px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Brandify</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[20px] left-[-6.36px] top-[2.73px] w-[284px]" data-name="Container">
      <Heading2 />
    </div>
  );
}

function Container11() {
  return <div className="size-[18px]" data-name="Container" />;
}

function Title1() {
  return (
    <div className="absolute h-[25.456px] left-[16px] top-[12.86px] w-[313.728px]" data-name="Title">
      <Container10 />
      <div className="absolute flex items-center justify-center left-[294.64px] size-[25.456px] top-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <Container11 />
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[310px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/work/brandify">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Agency Website</p>
      </a>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[20px] left-[16px] top-[43.2px] w-[310px]" data-name="Container">
      <Container13 />
    </div>
  );
}

function Content3() {
  return (
    <div className="absolute bg-[#111] h-[79.21px] left-0 overflow-clip rounded-bl-[8px] rounded-br-[8px] top-[256.5px] w-[342px]" data-name="Content">
      <Title1 />
      <Container12 />
      <div className="absolute border-[#242424] border-solid border-t h-[80.579px] left-0 rounded-bl-[8px] rounded-br-[8px] top-0 w-[342px]" data-name="HorizontalBorder" />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#111] h-[335.71px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Container">
      <Image />
      <Content3 />
      <div className="absolute border border-[#363636] border-solid h-[335.718px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function LinkDefault() {
  return (
    <div className="absolute h-[335.71px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Link - Default">
      <Container9 />
    </div>
  );
}

function Lhf3IgLl87Ewc7EDrFourzAdGeJpg() {
  return (
    <div className="absolute h-[256.5px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[342px]" data-name="lhf3igLL87Ewc7eDRFourzAdGE.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-tl-[8px] rounded-tr-[8px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgLhf3IgLl87Ewc7EDrFourzAdGeJpg} />
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="absolute h-[256.5px] left-0 overflow-clip top-0 w-[342px]" data-name="Image">
      <Lhf3IgLl87Ewc7EDrFourzAdGeJpg />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[284px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Shiro</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[20px] left-[-6.36px] top-[2.73px] w-[284px]" data-name="Container">
      <Heading3 />
    </div>
  );
}

function Container16() {
  return <div className="size-[18px]" data-name="Container" />;
}

function Title2() {
  return (
    <div className="absolute h-[25.456px] left-[16px] top-[12.86px] w-[313.728px]" data-name="Title">
      <Container15 />
      <div className="absolute flex items-center justify-center left-[294.64px] size-[25.456px] top-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[310px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/work/shiro">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Perosnal Portfolio</p>
      </a>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[20px] left-[16px] top-[43.2px] w-[310px]" data-name="Container">
      <Container18 />
    </div>
  );
}

function Content4() {
  return (
    <div className="absolute bg-[#111] h-[79.21px] left-0 overflow-clip rounded-bl-[8px] rounded-br-[8px] top-[256.5px] w-[342px]" data-name="Content">
      <Title2 />
      <Container17 />
      <div className="absolute border-[#242424] border-solid border-t h-[80.579px] left-0 rounded-bl-[8px] rounded-br-[8px] top-0 w-[342px]" data-name="HorizontalBorder" />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bg-[#111] h-[335.71px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Container">
      <Image1 />
      <Content4 />
      <div className="absolute border border-[#363636] border-solid h-[335.718px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function LinkDefault1() {
  return (
    <div className="absolute h-[335.71px] left-[358px] overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Link - Default">
      <Container14 />
    </div>
  );
}

function UlvReqxDHuFzobZf0AoTil4V8Jpg() {
  return (
    <div className="absolute h-[256.5px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[342px]" data-name="ULVReqxDHuFzobZf0aoTil4V8.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-tl-[8px] rounded-tr-[8px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgUlvReqxDHuFzobZf0AoTil4V8Jpg} />
      </div>
    </div>
  );
}

function Image2() {
  return (
    <div className="absolute h-[256.5px] left-0 overflow-clip top-0 w-[342px]" data-name="Image">
      <UlvReqxDHuFzobZf0AoTil4V8Jpg />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[284px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Vivid</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[20px] left-[-6.36px] top-[2.73px] w-[284px]" data-name="Container">
      <Heading4 />
    </div>
  );
}

function Container21() {
  return <div className="size-[18px]" data-name="Container" />;
}

function Title3() {
  return (
    <div className="absolute h-[25.456px] left-[16px] top-[12.87px] w-[313.728px]" data-name="Title">
      <Container20 />
      <div className="absolute flex items-center justify-center left-[294.64px] size-[25.456px] top-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[310px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/work/vivid">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">App Showcase</p>
      </a>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[20px] left-[16px] top-[43.21px] w-[310px]" data-name="Container">
      <Container23 />
    </div>
  );
}

function Content5() {
  return (
    <div className="absolute bg-[#111] h-[79.21px] left-0 overflow-clip rounded-bl-[8px] rounded-br-[8px] top-[256.5px] w-[342px]" data-name="Content">
      <Title3 />
      <Container22 />
      <div className="absolute border-[#242424] border-solid border-t h-[80.579px] left-0 rounded-bl-[8px] rounded-br-[8px] top-0 w-[342px]" data-name="HorizontalBorder" />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute bg-[#111] h-[335.71px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Container">
      <Image2 />
      <Content5 />
      <div className="absolute border border-[#363636] border-solid h-[335.718px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function LinkDefault2() {
  return (
    <div className="absolute h-[335.71px] left-0 overflow-clip rounded-[8px] top-[351.29px] w-[342px]" data-name="Link - Default">
      <Container19 />
    </div>
  );
}

function OuJv0UQa3Jjr5TSQkR8FvAiByMJpg() {
  return (
    <div className="absolute h-[256.5px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[342px]" data-name="ouJv0UQa3jjr5tSQkR8FvAiByM.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-tl-[8px] rounded-tr-[8px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgOuJv0UQa3Jjr5TSQkR8FvAiByMJpg} />
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="absolute h-[256.5px] left-0 overflow-clip top-0 w-[342px]" data-name="Image">
      <OuJv0UQa3Jjr5TSQkR8FvAiByMJpg />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[284px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Capture</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[20px] left-[-6.36px] top-[2.73px] w-[284px]" data-name="Container">
      <Heading5 />
    </div>
  );
}

function Container26() {
  return <div className="size-[18px]" data-name="Container" />;
}

function Title4() {
  return (
    <div className="absolute h-[25.456px] left-[16px] top-[12.87px] w-[313.728px]" data-name="Title">
      <Container25 />
      <div className="absolute flex items-center justify-center left-[294.64px] size-[25.456px] top-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <Container26 />
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[310px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/work/capture">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Video Agency</p>
      </a>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[20px] left-[16px] top-[43.21px] w-[310px]" data-name="Container">
      <Container28 />
    </div>
  );
}

function Content6() {
  return (
    <div className="absolute bg-[#111] h-[79.21px] left-0 overflow-clip rounded-bl-[8px] rounded-br-[8px] top-[256.5px] w-[342px]" data-name="Content">
      <Title4 />
      <Container27 />
      <div className="absolute border-[#242424] border-solid border-t h-[80.579px] left-0 rounded-bl-[8px] rounded-br-[8px] top-0 w-[342px]" data-name="HorizontalBorder" />
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute bg-[#111] h-[335.71px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Container">
      <Image3 />
      <Content6 />
      <div className="absolute border border-[#363636] border-solid h-[335.718px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function LinkDefault3() {
  return (
    <div className="absolute h-[335.71px] left-[358px] overflow-clip rounded-[8px] top-[351.29px] w-[342px]" data-name="Link - Default">
      <Container24 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[686.59px] left-0 top-[56px] w-[700px]" data-name="Container">
      <LinkDefault />
      <LinkDefault1 />
      <LinkDefault2 />
      <LinkDefault3 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[601px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Projetos</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[601px]" data-name="Container">
      <Heading6 />
    </div>
  );
}

function Default1() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[601px]" data-name="Default">
      <Container30 />
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[601px]" data-name="Container">
      <Default1 />
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[73px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://gbaltar.framer.website/work">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Ver todos</p>
      </a>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[73px]" data-name="Container">
      <Container33 />
    </div>
  );
}

function Container34() {
  return <div className="absolute left-[77px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function LinkIconButton() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-0 w-[93px]" data-name="Link - Icon button">
      <Container32 />
      <Container34 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[23px] left-[607px] top-[0.5px] w-[93px]" data-name="Container">
      <LinkIconButton />
    </div>
  );
}

function Title5() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Container29 />
      <Container31 />
    </div>
  );
}

function Content2() {
  return (
    <div className="absolute h-[742.59px] left-[370px] top-[60px] w-[700px]" data-name="Content">
      <Container8 />
      <Title5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[862.59px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content2 />
    </div>
  );
}

function SectionWork() {
  return (
    <div className="absolute bg-[#111] h-[862.59px] left-0 top-[612.44px] w-[1440px]" data-name="Section - Work">
      <Container7 />
    </div>
  );
}

function Container37() {
  return <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container" />;
}

function Container39() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[121px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">San Francisco, CA</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[121px]" data-name="Container">
      <Container39 />
    </div>
  );
}

function IconButton() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[137px]" data-name="Icon button">
      <Container37 />
      <Container38 />
      <div className="absolute bg-[#d9d9d9] left-[-3.12px] size-[16.162px] top-[3px]" />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[548px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Digital Innovations Agency</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute h-[20px] left-0 top-[-0.41px] w-[548px]" data-name="Container">
      <Heading7 />
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[126px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Jan 2019 – Present</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute h-[20px] left-[558px] top-[-0.41px] w-[126px]" data-name="Container">
      <Container42 />
    </div>
  );
}

function Company() {
  return (
    <div className="absolute h-[19.59px] left-0 overflow-clip top-[28px] w-[684px]" data-name="Company">
      <Container40 />
      <Container41 />
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Senior Web Designer</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute h-[20px] left-0 top-[55.59px] w-[684px]" data-name="Container">
      <Container44 />
    </div>
  );
}

function Title6() {
  return (
    <div className="absolute h-[75.59px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <IconButton />
      <Company />
      <Container43 />
    </div>
  );
}

function Item() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Led the redesign of high-traffic websites, resulting in a 30% increase in user `}</p>
        <p>engagement.</p>
      </div>
    </div>
  );
}

function List() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="Container">
      <List />
    </div>
  );
}

function Item1() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Managed a team of junior designers, providing mentorship and overseeing project `}</p>
        <p>timelines.</p>
      </div>
    </div>
  );
}

function List1() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item1 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="absolute h-[65px] left-0 top-[52.82px] w-[684px]" data-name="Container">
      <List1 />
    </div>
  );
}

function Item2() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Collaborated with cross-functional teams to develop innovative design solutions for `}</p>
        <p>diverse clients.</p>
      </div>
    </div>
  );
}

function List2() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item2 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="absolute h-[65px] left-0 top-[105.63px] w-[684px]" data-name="Container">
      <List2 />
    </div>
  );
}

function Item3() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Implemented responsive design principles to ensure optimal performance across all `}</p>
        <p>devices.</p>
      </div>
    </div>
  );
}

function List3() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item3 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute h-[65px] left-0 top-[158.44px] w-[684px]" data-name="Container">
      <List3 />
    </div>
  );
}

function PreviousWork() {
  return (
    <div className="absolute h-[203.25px] left-[16px] overflow-clip top-[107.59px] w-[684px]" data-name="Previous work">
      <Container45 />
      <Container46 />
      <Container47 />
      <Container48 />
    </div>
  );
}

function Default2() {
  return (
    <div className="absolute h-[310.84px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title6 />
      <PreviousWork />
      <div className="absolute border-[#363636] border-l border-solid h-[311.859px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute h-[310.84px] left-0 top-0 w-[700px]" data-name="Container">
      <Default2 />
    </div>
  );
}

function Container50() {
  return <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container" />;
}

function Container52() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[109px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Los Angeles, CA</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[109px]" data-name="Container">
      <Container52 />
    </div>
  );
}

function IconButton1() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[125px]" data-name="Icon button">
      <Container50 />
      <Container51 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[536px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Creative Solutions Studio</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="absolute h-[20px] left-0 top-[-0.41px] w-[536px]" data-name="Container">
      <Heading8 />
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[138px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Jun 2013 – Dec 2018</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute h-[20px] left-[546px] top-[-0.41px] w-[138px]" data-name="Container">
      <Container55 />
    </div>
  );
}

function Company1() {
  return (
    <div className="absolute h-[19.59px] left-0 overflow-clip top-[28px] w-[684px]" data-name="Company">
      <Container53 />
      <Container54 />
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Web Designer</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute h-[20px] left-0 top-[55.59px] w-[684px]" data-name="Container">
      <Container57 />
    </div>
  );
}

function Title7() {
  return (
    <div className="absolute h-[75.59px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <IconButton1 />
      <Company1 />
      <Container56 />
    </div>
  );
}

function Item4() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Designed and developed over 50 custom websites for small to medium-sized `}</p>
        <p>businesses.</p>
      </div>
    </div>
  );
}

function List4() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item4 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="Container">
      <List4 />
    </div>
  );
}

function Item5() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Conducted usability testing and user research to enhance site functionality and user `}</p>
        <p>satisfaction.</p>
      </div>
    </div>
  );
}

function List5() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item5 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute h-[65px] left-0 top-[52.82px] w-[684px]" data-name="Container">
      <List5 />
    </div>
  );
}

function Item6() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Created wireframes, mockups, and prototypes to communicate design concepts `}</p>
        <p>effectively.</p>
      </div>
    </div>
  );
}

function List6() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item6 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute h-[65px] left-0 top-[105.63px] w-[684px]" data-name="Container">
      <List6 />
    </div>
  );
}

function Item7() {
  return (
    <div className="absolute h-[23px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Utilized HTML, CSS, and JavaScript to bring design visions to life.</p>
      </div>
    </div>
  );
}

function List7() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[684px]" data-name="List">
      <Item7 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute h-[43px] left-0 top-[158.44px] w-[684px]" data-name="Container">
      <List7 />
    </div>
  );
}

function PreviousWork1() {
  return (
    <div className="absolute h-[180.84px] left-[16px] overflow-clip top-[107.59px] w-[684px]" data-name="Previous work">
      <Container58 />
      <Container59 />
      <Container60 />
      <Container61 />
    </div>
  );
}

function Default3() {
  return (
    <div className="absolute h-[288.43px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title7 />
      <PreviousWork1 />
      <div className="absolute border-[#363636] border-l border-solid h-[289.577px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute h-[288.43px] left-0 top-[358.84px] w-[700px]" data-name="Container">
      <Default3 />
    </div>
  );
}

function Container63() {
  return <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container" />;
}

function Container65() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[68px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Austin, TX</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[68px]" data-name="Container">
      <Container65 />
    </div>
  );
}

function IconButton2() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[84px]" data-name="Icon button">
      <Container63 />
      <Container64 />
    </div>
  );
}

function Heading9() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[532px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">TechWave LLC</p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute h-[20px] left-0 top-[-0.61px] w-[532px]" data-name="Container">
      <Heading9 />
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[142px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Apr 2008 – May 2013</p>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute h-[20px] left-[542px] top-[-0.61px] w-[142px]" data-name="Container">
      <Container68 />
    </div>
  );
}

function Company2() {
  return (
    <div className="absolute h-[19.59px] left-0 overflow-clip top-[28px] w-[684px]" data-name="Company">
      <Container66 />
      <Container67 />
    </div>
  );
}

function Container70() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Front-End Developer / Designer</p>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute h-[20px] left-0 top-[55.59px] w-[684px]" data-name="Container">
      <Container70 />
    </div>
  );
}

function Title8() {
  return (
    <div className="absolute h-[75.59px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <IconButton2 />
      <Company2 />
      <Container69 />
    </div>
  );
}

function Item8() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Developed and maintained the front-end of e-commerce websites, improving site `}</p>
        <p>speed by 20%.</p>
      </div>
    </div>
  );
}

function List8() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item8 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="Container">
      <List8 />
    </div>
  );
}

function Item9() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Worked closely with back-end developers to integrate APIs and enhance site `}</p>
        <p>capabilities.</p>
      </div>
    </div>
  );
}

function List9() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item9 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="absolute h-[65px] left-0 top-[52.81px] w-[684px]" data-name="Container">
      <List9 />
    </div>
  );
}

function Item10() {
  return (
    <div className="absolute h-[23px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Ensured websites met accessibility standards and were SEO optimized.</p>
      </div>
    </div>
  );
}

function List10() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[684px]" data-name="List">
      <Item10 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute h-[43px] left-0 top-[105.62px] w-[684px]" data-name="Container">
      <List10 />
    </div>
  );
}

function Item11() {
  return (
    <div className="absolute h-[23px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Created visual design assets and graphics for online marketing campaigns.</p>
      </div>
    </div>
  );
}

function List11() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[684px]" data-name="List">
      <Item11 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="absolute h-[43px] left-0 top-[136.03px] w-[684px]" data-name="Container">
      <List11 />
    </div>
  );
}

function PreviousWork2() {
  return (
    <div className="absolute h-[158.44px] left-[16px] overflow-clip top-[107.59px] w-[684px]" data-name="Previous work">
      <Container71 />
      <Container72 />
      <Container73 />
      <Container74 />
    </div>
  );
}

function Default4() {
  return (
    <div className="absolute h-[266.03px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title8 />
      <PreviousWork2 />
      <div className="absolute border-[#363636] border-l border-solid h-[267.358px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Container62() {
  return (
    <div className="absolute h-[266.03px] left-0 top-[695.27px] w-[700px]" data-name="Container">
      <Default4 />
    </div>
  );
}

function Container76() {
  return <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container" />;
}

function Container78() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[77px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Seattle, WA</p>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[77px]" data-name="Container">
      <Container78 />
    </div>
  );
}

function IconButton3() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[93px]" data-name="Icon button">
      <Container76 />
      <Container77 />
    </div>
  );
}

function Heading10() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[532px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Bright Ideas Web Solutions</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="absolute h-[20px] left-0 top-[-0.61px] w-[532px]" data-name="Container">
      <Heading10 />
    </div>
  );
}

function Container81() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[142px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Jan 2006 – Mar 2008</p>
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="absolute h-[20px] left-[542px] top-[-0.61px] w-[142px]" data-name="Container">
      <Container81 />
    </div>
  );
}

function Company3() {
  return (
    <div className="absolute h-[19.59px] left-0 overflow-clip top-[28px] w-[684px]" data-name="Company">
      <Container79 />
      <Container80 />
    </div>
  );
}

function Container83() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Junior Web Designer</p>
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div className="absolute h-[20px] left-0 top-[55.59px] w-[684px]" data-name="Container">
      <Container83 />
    </div>
  );
}

function Title9() {
  return (
    <div className="absolute h-[75.59px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <IconButton3 />
      <Company3 />
      <Container82 />
    </div>
  );
}

function Item12() {
  return (
    <div className="absolute h-[45px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] w-[663.81px] whitespace-pre-wrap">
        <p className="mb-0">{`Assisted in the design and development of client websites under the guidance of senior `}</p>
        <p>designers.</p>
      </div>
    </div>
  );
}

function List12() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="List">
      <Item12 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div className="absolute h-[65px] left-0 top-0 w-[684px]" data-name="Container">
      <List12 />
    </div>
  );
}

function Item13() {
  return (
    <div className="absolute h-[23px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Maintained and updated existing websites, ensuring they met modern web standards.</p>
      </div>
    </div>
  );
}

function List13() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[684px]" data-name="List">
      <Item13 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="absolute h-[43px] left-0 top-[52.81px] w-[684px]" data-name="Container">
      <List13 />
    </div>
  );
}

function Item14() {
  return (
    <div className="absolute h-[23px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Participated in client meetings to gather requirements and present design proposals.</p>
      </div>
    </div>
  );
}

function List14() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[684px]" data-name="List">
      <Item14 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div className="absolute h-[43px] left-0 top-[83.22px] w-[684px]" data-name="Container">
      <List14 />
    </div>
  );
}

function Item15() {
  return (
    <div className="absolute h-[23px] left-[20.19px] top-[20px] w-[663.81px]" data-name="Item">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Developed basic HTML and CSS coding skills to support design projects.</p>
      </div>
    </div>
  );
}

function List15() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[684px]" data-name="List">
      <Item15 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">•</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="absolute h-[43px] left-0 top-[113.62px] w-[684px]" data-name="Container">
      <List15 />
    </div>
  );
}

function PreviousWork3() {
  return (
    <div className="absolute h-[136.03px] left-[16px] overflow-clip top-[107.59px] w-[684px]" data-name="Previous work">
      <Container84 />
      <Container85 />
      <Container86 />
      <Container87 />
    </div>
  );
}

function Default5() {
  return (
    <div className="absolute h-[243.62px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title9 />
      <PreviousWork3 />
      <div className="absolute border-[#363636] border-l border-solid h-[245.145px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Container75() {
  return (
    <div className="absolute h-[243.62px] left-0 top-[1009.3px] w-[700px]" data-name="Container">
      <Default5 />
    </div>
  );
}

function Experience() {
  return (
    <div className="absolute h-[1252.92px] left-0 top-[56px] w-[700px]" data-name="Experience">
      <Container36 />
      <Container49 />
      <Container62 />
      <Container75 />
    </div>
  );
}

function Heading11() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Experiência</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading11 />
    </div>
  );
}

function Default6() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container89 />
    </div>
  );
}

function Container88() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Default6 />
    </div>
  );
}

function Title11() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Container88 />
    </div>
  );
}

function Title10() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Title">
      <Title11 />
    </div>
  );
}

function Content7() {
  return (
    <div className="absolute h-[1308.92px] left-[370px] top-[60px] w-[700px]" data-name="Content">
      <Experience />
      <Title10 />
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute h-[1428.92px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content7 />
    </div>
  );
}

function SectionExperience() {
  return (
    <div className="absolute bg-[#111] h-[1428.92px] left-0 top-[1475.03px] w-[1440px]" data-name="Section - Experience">
      <Container35 />
    </div>
  );
}

function Heading12() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Education</p>
      </div>
    </div>
  );
}

function Container91() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading12 />
    </div>
  );
}

function Default7() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container91 />
    </div>
  );
}

function Title12() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Default7 />
    </div>
  );
}

function Container93() {
  return <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container" />;
}

function Container95() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[578px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Berkeley, CA</p>
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[578px]" data-name="Container">
      <Container95 />
    </div>
  );
}

function IconButton4() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[594px]" data-name="Icon button">
      <Container93 />
      <Container94 />
    </div>
  );
}

function Container97() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[80px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">2010 – 2012</p>
      </div>
    </div>
  );
}

function Container96() {
  return (
    <div className="absolute h-[20px] left-[604px] top-0 w-[80px]" data-name="Container">
      <Container97 />
    </div>
  );
}

function University() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[684px]" data-name="University">
      <IconButton4 />
      <Container96 />
    </div>
  );
}

function Heading13() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Master of Science in Web Design and Development</p>
      </div>
    </div>
  );
}

function Container98() {
  return (
    <div className="absolute h-[20px] left-0 top-[27px] w-[684px]" data-name="Container">
      <Heading13 />
    </div>
  );
}

function Container100() {
  return (
    <div className="absolute h-[20px] left-0 top-[1.01px] w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">University of California</p>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div className="absolute h-[21.01px] left-0 top-[54px] w-[684px]" data-name="Container">
      <Container100 />
    </div>
  );
}

function Title13() {
  return (
    <div className="absolute h-[75.01px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <University />
      <Container98 />
      <Container99 />
    </div>
  );
}

function Container102() {
  return (
    <div className="absolute h-[45px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[22.5px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`Focused on advanced web technologies, user experience design, and front-end `}</p>
        <p>development.</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="absolute h-[45px] left-0 top-0 w-[684px]" data-name="Container">
      <Container102 />
    </div>
  );
}

function Description() {
  return (
    <div className="absolute h-[45px] left-[16px] overflow-clip top-[107.01px] w-[684px]" data-name="Description">
      <Container101 />
    </div>
  );
}

function Default8() {
  return (
    <div className="absolute h-[152.01px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title13 />
      <Description />
      <div className="absolute border-[#363636] border-l border-solid h-[154.95px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Container92() {
  return (
    <div className="absolute h-[152.01px] left-0 top-0 w-[700px]" data-name="Container">
      <Default8 />
    </div>
  );
}

function Container104() {
  return <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container" />;
}

function Container106() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[573px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Seattle, WA</p>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[573px]" data-name="Container">
      <Container106 />
    </div>
  );
}

function IconButton5() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[589px]" data-name="Icon button">
      <Container104 />
      <Container105 />
    </div>
  );
}

function Container108() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[85px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">2002 – 2006</p>
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="absolute h-[20px] left-[599px] top-0 w-[85px]" data-name="Container">
      <Container108 />
    </div>
  );
}

function University1() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-0 w-[684px]" data-name="University">
      <IconButton5 />
      <Container107 />
    </div>
  );
}

function Heading14() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Bachelor of Fine Arts in Graphic Design</p>
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div className="absolute h-[20px] left-0 top-[27px] w-[684px]" data-name="Container">
      <Heading14 />
    </div>
  );
}

function Container111() {
  return (
    <div className="absolute h-[20px] left-0 top-px w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">University of Washington</p>
      </div>
    </div>
  );
}

function Container110() {
  return (
    <div className="absolute h-[21px] left-0 top-[54px] w-[684px]" data-name="Container">
      <Container111 />
    </div>
  );
}

function Title14() {
  return (
    <div className="absolute h-[75px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <University1 />
      <Container109 />
      <Container110 />
    </div>
  );
}

function Container113() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Emphasized visual communication, design principles, and digital media.</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[684px]" data-name="Container">
      <Container113 />
    </div>
  );
}

function Description1() {
  return (
    <div className="absolute h-[23px] left-[16px] overflow-clip top-[107px] w-[684px]" data-name="Description">
      <Container112 />
    </div>
  );
}

function Default9() {
  return (
    <div className="absolute h-[130px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title14 />
      <Description1 />
      <div className="absolute border-[#363636] border-l border-solid h-[135.322px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Container103() {
  return (
    <div className="absolute h-[130px] left-0 top-[200.01px] w-[700px]" data-name="Container">
      <Default9 />
    </div>
  );
}

function Education() {
  return (
    <div className="absolute h-[330.01px] left-0 overflow-clip top-[56px] w-[700px]" data-name="Education">
      <Container92 />
      <Container103 />
    </div>
  );
}

function Content8() {
  return (
    <div className="absolute h-[386.01px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Content">
      <Title12 />
      <Education />
    </div>
  );
}

function Container90() {
  return (
    <div className="absolute h-[506.01px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content8 />
    </div>
  );
}

function SectionEducation() {
  return (
    <div className="absolute bg-[#111] h-[506.01px] left-0 top-[2900.72px] w-[1440px]" data-name="Section - Education">
      <Container90 />
    </div>
  );
}

function Heading15() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Certifications</p>
      </div>
    </div>
  );
}

function Container115() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading15 />
    </div>
  );
}

function Default10() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container115 />
    </div>
  );
}

function Title15() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Default10 />
    </div>
  );
}

function Heading16() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[632.95px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Certified Web Developer (CWD)</p>
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[632.95px]" data-name="Container">
      <Heading16 />
    </div>
  );
}

function Container121() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.coursera.org/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">View</p>
      </a>
    </div>
  );
}

function Container120() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <Container121 />
    </div>
  );
}

function Container122() {
  return <div className="absolute left-[41px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container119() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[57px]" data-name="Container">
      <Container120 />
      <Container122 />
    </div>
  );
}

function Line() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[57px]" data-name="Line" />;
}

function LinkIconRight() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[57px]" data-name="Link - Icon right">
      <Container119 />
      <Line />
    </div>
  );
}

function Container118() {
  return (
    <div className="absolute h-[26px] left-[642.95px] top-0 w-[57px]" data-name="Container">
      <LinkIconRight />
    </div>
  );
}

function Title16() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container117 />
      <Container118 />
    </div>
  );
}

function Container123() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">International Web Association, 2021</p>
      </div>
    </div>
  );
}

function Default11() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title16 />
      <Container123 />
    </div>
  );
}

function Container116() {
  return (
    <div className="absolute h-[53.41px] left-0 top-0 w-[700px]" data-name="Container">
      <Default11 />
    </div>
  );
}

function Heading17() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[632.95px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">User Experience (UX) Design Certification</p>
      </div>
    </div>
  );
}

function Container125() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[632.95px]" data-name="Container">
      <Heading17 />
    </div>
  );
}

function Container129() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.coursera.org/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">View</p>
      </a>
    </div>
  );
}

function Container128() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <Container129 />
    </div>
  );
}

function Container130() {
  return <div className="absolute left-[41px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container127() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[57px]" data-name="Container">
      <Container128 />
      <Container130 />
    </div>
  );
}

function Line1() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[57px]" data-name="Line" />;
}

function LinkIconRight1() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[57px]" data-name="Link - Icon right">
      <Container127 />
      <Line1 />
    </div>
  );
}

function Container126() {
  return (
    <div className="absolute h-[26px] left-[642.95px] top-0 w-[57px]" data-name="Container">
      <LinkIconRight1 />
    </div>
  );
}

function Title17() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container125 />
      <Container126 />
    </div>
  );
}

function Container131() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Nielsen Norman Group, 2018</p>
      </div>
    </div>
  );
}

function Default12() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title17 />
      <Container131 />
    </div>
  );
}

function Container124() {
  return (
    <div className="absolute h-[53.41px] left-0 top-[85.41px] w-[700px]" data-name="Container">
      <Default12 />
    </div>
  );
}

function Heading18() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[632.95px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Advanced HTML5 and CSS3 Specialist</p>
      </div>
    </div>
  );
}

function Container133() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[632.95px]" data-name="Container">
      <Heading18 />
    </div>
  );
}

function Container137() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.coursera.org/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">View</p>
      </a>
    </div>
  );
}

function Container136() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <Container137 />
    </div>
  );
}

function Container138() {
  return <div className="absolute left-[41px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container135() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[57px]" data-name="Container">
      <Container136 />
      <Container138 />
    </div>
  );
}

function Line2() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[57px]" data-name="Line" />;
}

function LinkIconRight2() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[57px]" data-name="Link - Icon right">
      <Container135 />
      <Line2 />
    </div>
  );
}

function Container134() {
  return (
    <div className="absolute h-[26px] left-[642.95px] top-0 w-[57px]" data-name="Container">
      <LinkIconRight2 />
    </div>
  );
}

function Title18() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container133 />
      <Container134 />
    </div>
  );
}

function Container139() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">W3Schools, 2016</p>
      </div>
    </div>
  );
}

function Default13() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title18 />
      <Container139 />
    </div>
  );
}

function Container132() {
  return (
    <div className="absolute h-[53.41px] left-0 top-[170.82px] w-[700px]" data-name="Container">
      <Default13 />
    </div>
  );
}

function Heading19() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[632.95px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Google Analytics Individual Qualification (GAIQ)</p>
      </div>
    </div>
  );
}

function Container141() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[632.95px]" data-name="Container">
      <Heading19 />
    </div>
  );
}

function Container145() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.coursera.org/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">View</p>
      </a>
    </div>
  );
}

function Container144() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[37px]" data-name="Container">
      <Container145 />
    </div>
  );
}

function Container146() {
  return <div className="absolute left-[41px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container143() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[57px]" data-name="Container">
      <Container144 />
      <Container146 />
    </div>
  );
}

function Line3() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[57px]" data-name="Line" />;
}

function LinkIconRight3() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[57px]" data-name="Link - Icon right">
      <Container143 />
      <Line3 />
    </div>
  );
}

function Container142() {
  return (
    <div className="absolute h-[26px] left-[642.95px] top-0 w-[57px]" data-name="Container">
      <LinkIconRight3 />
    </div>
  );
}

function Title19() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container141 />
      <Container142 />
    </div>
  );
}

function Container147() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Google, 2015</p>
      </div>
    </div>
  );
}

function Default14() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title19 />
      <Container147 />
    </div>
  );
}

function Container140() {
  return (
    <div className="absolute h-[53.41px] left-0 top-[256.23px] w-[700px]" data-name="Container">
      <Default14 />
    </div>
  );
}

function Certifications() {
  return (
    <div className="absolute h-[309.64px] left-0 top-[56px] w-[700px]" data-name="Certifications">
      <Container116 />
      <Container124 />
      <Container132 />
      <Container140 />
    </div>
  );
}

function Content9() {
  return (
    <div className="absolute h-[365.64px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Content">
      <Title15 />
      <Certifications />
    </div>
  );
}

function Container114() {
  return (
    <div className="absolute h-[485.64px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content9 />
    </div>
  );
}

function SectionMyCertifications() {
  return (
    <div className="absolute bg-[#111] h-[485.64px] left-0 top-[3404.72px] w-[1440px]" data-name="Section - My certifications">
      <Container114 />
    </div>
  );
}

function Heading20() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Stack</p>
      </div>
    </div>
  );
}

function Container149() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading20 />
    </div>
  );
}

function Default15() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container149 />
    </div>
  );
}

function Title20() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Default15 />
    </div>
  );
}

function L9KyWeehsOv8Z8JC7LmEvaQ4CSvg1() {
  return (
    <div className="absolute left-0 size-[30px] top-0" data-name="L9KyWEEHSOv8z8jC7LMEvaQ4c.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="L9KyWEEHSOv8z8jC7LMEvaQ4c.svg">
          <path d={svgPaths.p3e48b00} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-2, black)" strokeWidth="0.0833333" />
          <path d={svgPaths.p283e3b00} fill="url(#paint0_linear_2_1030)" id="Vector_2" stroke="var(--stroke-0, #111111)" strokeWidth="0.0833333" />
          <path d={svgPaths.p295fb100} fill="url(#paint1_linear_2_1030)" id="Vector_3" stroke="var(--stroke-0, #111111)" strokeWidth="0.0833333" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1030" x1="15.1567" x2="15.1767" y1="10.9433" y2="19.2908">
            <stop stopColor="#0055FF" />
            <stop offset="1" stopColor="#0055FF" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_2_1030" x1="11.0033" x2="11.045" y1="19.2908" y2="27.6383">
            <stop stopColor="#0033FF" />
            <stop offset="1" stopColor="#0055FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function L9KyWeehsOv8Z8JC7LmEvaQ4CSvgFill() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="L9KyWEEHSOv8z8jC7LMEvaQ4c.svg fill">
      <L9KyWeehsOv8Z8JC7LmEvaQ4CSvg1 />
    </div>
  );
}

function L9KyWeehsOv8Z8JC7LmEvaQ4CSvg() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="L9KyWEEHSOv8z8jC7LMEvaQ4c.svg">
      <L9KyWeehsOv8Z8JC7LmEvaQ4CSvgFill />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[8px] overflow-clip size-[30px] top-[8px]" data-name="Icon">
      <L9KyWeehsOv8Z8JC7LmEvaQ4CSvg />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[46px] top-0" data-name="Icon">
      <Icon1 />
      <div className="absolute border border-[#242424] border-solid left-0 rounded-[8px] size-[46px] top-0" data-name="Border" />
    </div>
  );
}

function Heading21() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[55px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Framer</p>
      </a>
    </div>
  );
}

function Container150() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[55px]" data-name="Container">
      <Heading21 />
    </div>
  );
}

function Container151() {
  return <div className="absolute left-px size-[16px] top-px" data-name="Container" />;
}

function Arrow() {
  return (
    <div className="absolute left-[59px] overflow-clip size-[18px] top-px" data-name="Arrow">
      <Container151 />
    </div>
  );
}

function Name() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[276px]" data-name="Name">
      <Container150 />
      <Arrow />
    </div>
  );
}

function Container152() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.21px] w-[276px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">No-code web design.</p>
      </a>
    </div>
  );
}

function Title21() {
  return (
    <div className="absolute h-[42.8px] left-[58px] overflow-clip top-[1.6px] w-[276px]" data-name="Title">
      <Name />
      <Container152 />
    </div>
  );
}

function LinkItemCardButton() {
  return (
    <div className="absolute h-[46px] left-0 top-0 w-[334px]" data-name="Link - Item card button">
      <Icon />
      <Title21 />
    </div>
  );
}

function Component7CcIrhplk721Bhbtvb1UCavISvg1() {
  return (
    <div className="absolute h-[29.388px] left-0 top-[0.31px] w-[30px]" data-name="7ccIrhplk721bhbtvb1UCavI.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 29.3878">
        <g id="7ccIrhplk721bhbtvb1UCavI.svg">
          <path d={svgPaths.p3c12c5b0} fill="var(--fill-0, #442781)" id="Vector" />
          <path d={svgPaths.p31f7c400} fill="var(--fill-0, #61459C)" id="Vector_2" />
          <path d={svgPaths.p7328f00} fill="var(--fill-0, #A992DB)" id="Vector_3" />
          <path d={svgPaths.p35620980} fill="var(--fill-0, #FF7917)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Component7CcIrhplk721Bhbtvb1UCavISvgFill() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="7ccIrhplk721bhbtvb1UCavI.svg fill">
      <Component7CcIrhplk721Bhbtvb1UCavISvg1 />
    </div>
  );
}

function Component7CcIrhplk721Bhbtvb1UCavISvg() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="7ccIrhplk721bhbtvb1UCavI.svg">
      <Component7CcIrhplk721Bhbtvb1UCavISvgFill />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[8px] overflow-clip size-[30px] top-[8px]" data-name="Icon">
      <Component7CcIrhplk721Bhbtvb1UCavISvg />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[46px] top-0" data-name="Icon">
      <Icon3 />
      <div className="absolute border border-[#242424] border-solid left-0 rounded-[8px] size-[46px] top-0" data-name="Border" />
    </div>
  );
}

function Heading22() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[53px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Design</p>
      </a>
    </div>
  );
}

function Container153() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[53px]" data-name="Container">
      <Heading22 />
    </div>
  );
}

function Container154() {
  return <div className="absolute left-px size-[16px] top-px" data-name="Container" />;
}

function Arrow1() {
  return (
    <div className="absolute left-[57px] overflow-clip size-[18px] top-px" data-name="Arrow">
      <Container154 />
    </div>
  );
}

function Name1() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[276px]" data-name="Name">
      <Container153 />
      <Arrow1 />
    </div>
  );
}

function Container155() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.21px] w-[276px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">General Design Tool</p>
      </a>
    </div>
  );
}

function Title22() {
  return (
    <div className="absolute h-[42.8px] left-[58px] overflow-clip top-[1.6px] w-[276px]" data-name="Title">
      <Name1 />
      <Container155 />
    </div>
  );
}

function LinkItemCardButton1() {
  return (
    <div className="absolute h-[46px] left-[366px] top-0 w-[334px]" data-name="Link - Item card button">
      <Icon2 />
      <Title22 />
    </div>
  );
}

function Qc6WiaOlmjCgLjRa2NE1Poq3ZLkSvg1() {
  return (
    <div className="absolute h-[29.388px] left-0 top-[0.31px] w-[30px]" data-name="qc6WiaOLMJCgLjRA2nE1Poq3zLk.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 29.3878">
        <g id="qc6WiaOLMJCgLjRA2nE1Poq3zLk.svg">
          <path d={svgPaths.p368f1720} fill="var(--fill-0, #17CF97)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Qc6WiaOlmjCgLjRa2NE1Poq3ZLkSvgFill() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="qc6WiaOLMJCgLjRA2nE1Poq3zLk.svg fill">
      <Qc6WiaOlmjCgLjRa2NE1Poq3ZLkSvg1 />
    </div>
  );
}

function Qc6WiaOlmjCgLjRa2NE1Poq3ZLkSvg() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="qc6WiaOLMJCgLjRA2nE1Poq3zLk.svg">
      <Qc6WiaOlmjCgLjRa2NE1Poq3ZLkSvgFill />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[8px] overflow-clip size-[30px] top-[8px]" data-name="Icon">
      <Qc6WiaOlmjCgLjRa2NE1Poq3ZLkSvg />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[46px] top-0" data-name="Icon">
      <Icon5 />
      <div className="absolute border border-[#242424] border-solid left-0 rounded-[8px] size-[46px] top-0" data-name="Border" />
    </div>
  );
}

function Heading23() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[92px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Managment</p>
      </a>
    </div>
  );
}

function Container156() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[92px]" data-name="Container">
      <Heading23 />
    </div>
  );
}

function Container157() {
  return <div className="absolute left-px size-[16px] top-px" data-name="Container" />;
}

function Arrow2() {
  return (
    <div className="absolute left-[96px] overflow-clip size-[18px] top-px" data-name="Arrow">
      <Container157 />
    </div>
  );
}

function Name2() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[276px]" data-name="Name">
      <Container156 />
      <Arrow2 />
    </div>
  );
}

function Container158() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.21px] w-[276px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Project Managment</p>
      </a>
    </div>
  );
}

function Title23() {
  return (
    <div className="absolute h-[42.8px] left-[58px] overflow-clip top-[1.6px] w-[276px]" data-name="Title">
      <Name2 />
      <Container158 />
    </div>
  );
}

function LinkItemCardButton2() {
  return (
    <div className="absolute h-[46px] left-0 top-[78px] w-[334px]" data-name="Link - Item card button">
      <Icon4 />
      <Title23 />
    </div>
  );
}

function ScGavdIdTjHTgHxBhFqXusFfEn4Svg1() {
  return (
    <div className="absolute left-0 size-[30px] top-0" data-name="ScGavdIdTjHTgHXBhFQXusFFEn4.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g clipPath="url(#clip0_2_1035)" id="ScGavdIdTjHTgHXBhFQXusFFEn4.svg">
          <path clipRule="evenodd" d={svgPaths.p21499e00} fill="var(--fill-0, #5417D7)" fillRule="evenodd" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_2_1035">
            <rect fill="white" height="30" width="30" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ScGavdIdTjHTgHxBhFqXusFfEn4SvgFill() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="ScGavdIdTjHTgHXBhFQXusFFEn4.svg fill">
      <ScGavdIdTjHTgHxBhFqXusFfEn4Svg1 />
    </div>
  );
}

function ScGavdIdTjHTgHxBhFqXusFfEn4Svg() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="ScGavdIdTjHTgHXBhFQXusFFEn4.svg">
      <ScGavdIdTjHTgHxBhFqXusFfEn4SvgFill />
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[8px] overflow-clip size-[30px] top-[8px]" data-name="Icon">
      <ScGavdIdTjHTgHxBhFqXusFfEn4Svg />
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[46px] top-0" data-name="Icon">
      <Icon7 />
      <div className="absolute border border-[#242424] border-solid left-0 rounded-[8px] size-[46px] top-0" data-name="Border" />
    </div>
  );
}

function Heading24() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[76px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Payments</p>
      </a>
    </div>
  );
}

function Container159() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[76px]" data-name="Container">
      <Heading24 />
    </div>
  );
}

function Container160() {
  return <div className="absolute left-px size-[16px] top-px" data-name="Container" />;
}

function Arrow3() {
  return (
    <div className="absolute left-[80px] overflow-clip size-[18px] top-px" data-name="Arrow">
      <Container160 />
    </div>
  );
}

function Name3() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[276px]" data-name="Name">
      <Container159 />
      <Arrow3 />
    </div>
  );
}

function Container161() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.21px] w-[276px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Payment Platform</p>
      </a>
    </div>
  );
}

function Title24() {
  return (
    <div className="absolute h-[42.8px] left-[58px] overflow-clip top-[1.6px] w-[276px]" data-name="Title">
      <Name3 />
      <Container161 />
    </div>
  );
}

function LinkItemCardButton3() {
  return (
    <div className="absolute h-[46px] left-[366px] top-[78px] w-[334px]" data-name="Link - Item card button">
      <Icon6 />
      <Title24 />
    </div>
  );
}

function HvfBGbwc1AsKFtdq8R2VcwHAv0ASvg1() {
  return (
    <div className="absolute left-0 size-[30px] top-0" data-name="hvfBGbwc1AsKFtdq8R2VcwHAv0A.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g clipPath="url(#clip0_2_1044)" id="hvfBGbwc1AsKFtdq8R2VcwHAv0A.svg">
          <path clipRule="evenodd" d={svgPaths.p3ca24600} fill="var(--fill-0, #007DFC)" fillRule="evenodd" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.pb971af0} fill="var(--fill-0, #007DFC)" fillRule="evenodd" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_2_1044">
            <rect fill="white" height="30" width="30" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function HvfBGbwc1AsKFtdq8R2VcwHAv0ASvgFill() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="hvfBGbwc1AsKFtdq8R2VcwHAv0A.svg fill">
      <HvfBGbwc1AsKFtdq8R2VcwHAv0ASvg1 />
    </div>
  );
}

function HvfBGbwc1AsKFtdq8R2VcwHAv0ASvg() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="hvfBGbwc1AsKFtdq8R2VcwHAv0A.svg">
      <HvfBGbwc1AsKFtdq8R2VcwHAv0ASvgFill />
    </div>
  );
}

function Icon9() {
  return (
    <div className="absolute left-[8px] overflow-clip size-[30px] top-[8px]" data-name="Icon">
      <HvfBGbwc1AsKFtdq8R2VcwHAv0ASvg />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[46px] top-0" data-name="Icon">
      <Icon9 />
      <div className="absolute border border-[#242424] border-solid left-0 rounded-[8px] size-[46px] top-0" data-name="Border" />
    </div>
  );
}

function Heading25() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[72px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Meetings</p>
      </a>
    </div>
  );
}

function Container162() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[72px]" data-name="Container">
      <Heading25 />
    </div>
  );
}

function Container163() {
  return <div className="absolute left-px size-[16px] top-px" data-name="Container" />;
}

function Arrow4() {
  return (
    <div className="absolute left-[76px] overflow-clip size-[18px] top-px" data-name="Arrow">
      <Container163 />
    </div>
  );
}

function Name4() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[276px]" data-name="Name">
      <Container162 />
      <Arrow4 />
    </div>
  );
}

function Container164() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.21px] w-[276px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Collaboration</p>
      </a>
    </div>
  );
}

function Title25() {
  return (
    <div className="absolute h-[42.8px] left-[58px] overflow-clip top-[1.6px] w-[276px]" data-name="Title">
      <Name4 />
      <Container164 />
    </div>
  );
}

function LinkItemCardButton4() {
  return (
    <div className="absolute h-[46px] left-0 top-[156px] w-[334px]" data-name="Link - Item card button">
      <Icon8 />
      <Title25 />
    </div>
  );
}

function ZokCuPJkR8AKgTToaXlDyy95ISvg1() {
  return (
    <div className="absolute left-0 size-[30px] top-0" data-name="ZokCuPJkR8AKgTToaXlDYY95I.svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g clipPath="url(#clip0_2_1023)" id="ZokCuPJkR8AKgTToaXlDYY95I.svg">
          <path d={svgPaths.p1a3d6700} fill="var(--fill-0, #775732)" id="Vector" />
          <path d={svgPaths.p2e00} fill="var(--fill-0, #CA9352)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_2_1023">
            <rect fill="white" height="30" width="30" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ZokCuPJkR8AKgTToaXlDyy95ISvgFill() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="ZokCuPJkR8AKgTToaXlDYY95I.svg fill">
      <ZokCuPJkR8AKgTToaXlDyy95ISvg1 />
    </div>
  );
}

function ZokCuPJkR8AKgTToaXlDyy95ISvg() {
  return (
    <div className="absolute left-0 overflow-clip size-[30px] top-0" data-name="ZokCuPJkR8AKgTToaXlDYY95I.svg">
      <ZokCuPJkR8AKgTToaXlDyy95ISvgFill />
    </div>
  );
}

function Icon11() {
  return (
    <div className="absolute left-[8px] overflow-clip size-[30px] top-[8px]" data-name="Icon">
      <ZokCuPJkR8AKgTToaXlDyy95ISvg />
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[46px] top-0" data-name="Icon">
      <Icon11 />
      <div className="absolute border border-[#242424] border-solid left-0 rounded-[8px] size-[46px] top-0" data-name="Border" />
    </div>
  );
}

function Heading26() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[38px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Calls</p>
      </a>
    </div>
  );
}

function Container165() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[38px]" data-name="Container">
      <Heading26 />
    </div>
  );
}

function Container166() {
  return <div className="absolute left-px size-[16px] top-px" data-name="Container" />;
}

function Arrow5() {
  return (
    <div className="absolute left-[42px] overflow-clip size-[18px] top-px" data-name="Arrow">
      <Container166 />
    </div>
  );
}

function Name5() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[276px]" data-name="Name">
      <Container165 />
      <Arrow5 />
    </div>
  );
}

function Container167() {
  return (
    <div className="absolute h-[20px] left-0 top-[23.21px] w-[276px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://www.framer.com/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Communication</p>
      </a>
    </div>
  );
}

function Title26() {
  return (
    <div className="absolute h-[42.8px] left-[58px] overflow-clip top-[1.6px] w-[276px]" data-name="Title">
      <Name5 />
      <Container167 />
    </div>
  );
}

function LinkItemCardButton5() {
  return (
    <div className="absolute h-[46px] left-[366px] top-[156px] w-[334px]" data-name="Link - Item card button">
      <Icon10 />
      <Title26 />
    </div>
  );
}

function Stack() {
  return (
    <div className="absolute h-[202px] left-0 top-[56px] w-[700px]" data-name="Stack">
      <LinkItemCardButton />
      <LinkItemCardButton1 />
      <LinkItemCardButton2 />
      <LinkItemCardButton3 />
      <LinkItemCardButton4 />
      <LinkItemCardButton5 />
    </div>
  );
}

function Content10() {
  return (
    <div className="absolute h-[258px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Content">
      <Title20 />
      <Stack />
    </div>
  );
}

function Container148() {
  return (
    <div className="absolute h-[378px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content10 />
    </div>
  );
}

function SectionTechStack() {
  return (
    <div className="absolute bg-[#111] h-[378px] left-0 top-[3888.72px] w-[1440px]" data-name="Section - Tech stack">
      <Container148 />
    </div>
  );
}

function Heading27() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Awards</p>
      </div>
    </div>
  );
}

function Container169() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading27 />
    </div>
  );
}

function Default16() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container169 />
    </div>
  );
}

function Title27() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Default16 />
    </div>
  );
}

function Heading28() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[637.53px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Site of the day</p>
      </div>
    </div>
  );
}

function Container171() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[637.53px]" data-name="Container">
      <Heading28 />
    </div>
  );
}

function Container175() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.awwwards.com/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Visit</p>
      </a>
    </div>
  );
}

function Container174() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <Container175 />
    </div>
  );
}

function Container176() {
  return <div className="absolute left-[37px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container173() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[53px]" data-name="Container">
      <Container174 />
      <Container176 />
    </div>
  );
}

function Line4() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[53px]" data-name="Line" />;
}

function LinkIconRight4() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[53px]" data-name="Link - Icon right">
      <Container173 />
      <Line4 />
    </div>
  );
}

function Container172() {
  return (
    <div className="absolute h-[26px] left-[647.53px] top-0 w-[53px]" data-name="Container">
      <LinkIconRight4 />
    </div>
  );
}

function Title28() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container171 />
      <Container172 />
    </div>
  );
}

function Container177() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Awwwards, 2023</p>
      </div>
    </div>
  );
}

function Default17() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title28 />
      <Container177 />
    </div>
  );
}

function Container170() {
  return (
    <div className="absolute h-[53.41px] left-0 top-0 w-[700px]" data-name="Container">
      <Default17 />
    </div>
  );
}

function Heading29() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[637.53px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Site of the month</p>
      </div>
    </div>
  );
}

function Container179() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[637.53px]" data-name="Container">
      <Heading29 />
    </div>
  );
}

function Container183() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.awwwards.com/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Visit</p>
      </a>
    </div>
  );
}

function Container182() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <Container183 />
    </div>
  );
}

function Container184() {
  return <div className="absolute left-[37px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container181() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[53px]" data-name="Container">
      <Container182 />
      <Container184 />
    </div>
  );
}

function Line5() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[53px]" data-name="Line" />;
}

function LinkIconRight5() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[53px]" data-name="Link - Icon right">
      <Container181 />
      <Line5 />
    </div>
  );
}

function Container180() {
  return (
    <div className="absolute h-[26px] left-[647.53px] top-0 w-[53px]" data-name="Container">
      <LinkIconRight5 />
    </div>
  );
}

function Title29() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container179 />
      <Container180 />
    </div>
  );
}

function Container185() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Awwwards, 2020</p>
      </div>
    </div>
  );
}

function Default18() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title29 />
      <Container185 />
    </div>
  );
}

function Container178() {
  return (
    <div className="absolute h-[53.41px] left-0 top-[85.41px] w-[700px]" data-name="Container">
      <Default18 />
    </div>
  );
}

function Heading30() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[637.53px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Website of the day</p>
      </div>
    </div>
  );
}

function Container187() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[637.53px]" data-name="Container">
      <Heading30 />
    </div>
  );
}

function Container191() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[11.5px] whitespace-nowrap" href="https://www.cssdesignawards.com/">
        <p className="cursor-pointer leading-[22.4px]">Visit</p>
      </a>
    </div>
  );
}

function Container190() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <Container191 />
    </div>
  );
}

function Container192() {
  return <div className="absolute left-[37px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container189() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[53px]" data-name="Container">
      <Container190 />
      <Container192 />
    </div>
  );
}

function Line6() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[53px]" data-name="Line" />;
}

function LinkIconRight6() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[53px]" data-name="Link - Icon right">
      <Container189 />
      <Line6 />
    </div>
  );
}

function Container188() {
  return (
    <div className="absolute h-[26px] left-[647.53px] top-0 w-[53px]" data-name="Container">
      <LinkIconRight6 />
    </div>
  );
}

function Title30() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container187 />
      <Container188 />
    </div>
  );
}

function Container193() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">CSS Design Awards, 2018</p>
      </div>
    </div>
  );
}

function Default19() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title30 />
      <Container193 />
    </div>
  );
}

function Container186() {
  return (
    <div className="absolute h-[53.41px] left-0 top-[170.82px] w-[700px]" data-name="Container">
      <Default19 />
    </div>
  );
}

function Heading31() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[637.53px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Site of the day</p>
      </div>
    </div>
  );
}

function Container195() {
  return (
    <div className="absolute h-[20px] left-0 top-[2.09px] w-[637.53px]" data-name="Container">
      <Heading31 />
    </div>
  );
}

function Container199() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://thefwa.com/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Visit</p>
      </a>
    </div>
  );
}

function Container198() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[33px]" data-name="Container">
      <Container199 />
    </div>
  );
}

function Container200() {
  return <div className="absolute left-[37px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container197() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[53px]" data-name="Container">
      <Container198 />
      <Container200 />
    </div>
  );
}

function Line7() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[53px]" data-name="Line" />;
}

function LinkIconRight7() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[53px]" data-name="Link - Icon right">
      <Container197 />
      <Line7 />
    </div>
  );
}

function Container196() {
  return (
    <div className="absolute h-[26px] left-[647.53px] top-0 w-[53px]" data-name="Container">
      <LinkIconRight7 />
    </div>
  );
}

function Title31() {
  return (
    <div className="absolute h-[25.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Title">
      <Container195 />
      <Container196 />
    </div>
  );
}

function Container201() {
  return (
    <div className="absolute h-[20px] left-0 top-[33.41px] w-[700px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">FWA, 2016</p>
      </div>
    </div>
  );
}

function Default20() {
  return (
    <div className="absolute h-[53.41px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title31 />
      <Container201 />
    </div>
  );
}

function Container194() {
  return (
    <div className="absolute h-[53.41px] left-0 top-[256.23px] w-[700px]" data-name="Container">
      <Default20 />
    </div>
  );
}

function Awards() {
  return (
    <div className="absolute h-[309.64px] left-0 top-[56px] w-[700px]" data-name="Awards">
      <Container170 />
      <Container178 />
      <Container186 />
      <Container194 />
    </div>
  );
}

function Content11() {
  return (
    <div className="absolute h-[365.64px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Content">
      <Title27 />
      <Awards />
    </div>
  );
}

function Container168() {
  return (
    <div className="absolute h-[485.64px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content11 />
    </div>
  );
}

function SectionAwards() {
  return (
    <div className="absolute bg-[#111] h-[485.64px] left-0 top-[4266.72px] w-[1440px]" data-name="Section - Awards">
      <Container168 />
    </div>
  );
}

function Heading32() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Recommendations</p>
      </div>
    </div>
  );
}

function Container203() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading32 />
    </div>
  );
}

function Default21() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container203 />
    </div>
  );
}

function Title32() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Default21 />
    </div>
  );
}

function Heading33() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Jane Smith</p>
      </div>
    </div>
  );
}

function Container204() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[684px]" data-name="Container">
      <Heading33 />
    </div>
  );
}

function Container206() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Chief Marketing Officer at Digital Innovations Agency</p>
      </div>
    </div>
  );
}

function Container205() {
  return (
    <div className="absolute h-[20px] left-0 top-[27.2px] w-[684px]" data-name="Container">
      <Container206 />
    </div>
  );
}

function Title33() {
  return (
    <div className="absolute h-[46.8px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <Container204 />
      <Container205 />
    </div>
  );
}

function Container208() {
  return (
    <div className="absolute h-[68px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[34px] w-[684px] whitespace-pre-wrap">
        <p className="mb-0">{`"Sam's design expertise and innovative approach have been pivotal to our agency's `}</p>
        <p className="mb-0">{`success. His ability to blend creativity with functionality is unmatched, and he consistently `}</p>
        <p>{`delivers projects that exceed client expectations."`}</p>
      </div>
    </div>
  );
}

function Container207() {
  return (
    <div className="absolute h-[68px] left-0 top-[-0.6px] w-[684px]" data-name="Container">
      <Container208 />
    </div>
  );
}

function Description2() {
  return (
    <div className="absolute h-[67.22px] left-[16px] overflow-clip top-[78.8px] w-[684px]" data-name="Description">
      <Container207 />
    </div>
  );
}

function Default22() {
  return (
    <div className="absolute h-[146.02px] left-0 overflow-clip top-0 w-[700px]" data-name="Default">
      <Title33 />
      <Description2 />
      <div className="absolute border-[#363636] border-l border-solid h-[146.02px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Heading34() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Michael Brown</p>
      </div>
    </div>
  );
}

function Container209() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[684px]" data-name="Container">
      <Heading34 />
    </div>
  );
}

function Container211() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Founder of Creative Solutions Studio</p>
      </div>
    </div>
  );
}

function Container210() {
  return (
    <div className="absolute h-[20px] left-0 top-[27.21px] w-[684px]" data-name="Container">
      <Container211 />
    </div>
  );
}

function Title34() {
  return (
    <div className="absolute h-[46.8px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <Container209 />
      <Container210 />
    </div>
  );
}

function Container213() {
  return (
    <div className="absolute h-[68px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[34px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`"Sam is an exceptional web designer with a keen eye for detail and a deep understanding `}</p>
        <p className="mb-0">{`of user experience. His designs are not only visually stunning but also highly functional, `}</p>
        <p>{`making him an invaluable asset to any team."`}</p>
      </div>
    </div>
  );
}

function Container212() {
  return (
    <div className="absolute h-[68px] left-0 top-[-0.6px] w-[684px]" data-name="Container">
      <Container213 />
    </div>
  );
}

function Description3() {
  return (
    <div className="absolute h-[67.22px] left-[16px] overflow-clip top-[78.8px] w-[684px]" data-name="Description">
      <Container212 />
    </div>
  );
}

function Default23() {
  return (
    <div className="absolute h-[146.02px] left-0 overflow-clip top-[194.02px] w-[700px]" data-name="Default">
      <Title34 />
      <Description3 />
      <div className="absolute border-[#363636] border-l border-solid h-[146.02px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Heading35() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Lisa Turner</p>
      </div>
    </div>
  );
}

function Container214() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[684px]" data-name="Container">
      <Heading35 />
    </div>
  );
}

function Container216() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Senior Developer at TechWave LLC</p>
      </div>
    </div>
  );
}

function Container215() {
  return (
    <div className="absolute h-[20px] left-0 top-[27.2px] w-[684px]" data-name="Container">
      <Container216 />
    </div>
  );
}

function Title35() {
  return (
    <div className="absolute h-[46.8px] left-[16px] overflow-clip top-0 w-[684px]" data-name="Title">
      <Container214 />
      <Container215 />
    </div>
  );
}

function Container218() {
  return (
    <div className="absolute h-[68px] left-0 top-0 w-[684px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[16px] top-[34px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">{`"Working with Sam was a pleasure. His collaborative spirit and technical skills made our `}</p>
        <p className="mb-0">{`projects run smoothly and efficiently. Sam's designs always struck the perfect balance `}</p>
        <p>{`between aesthetics and usability."`}</p>
      </div>
    </div>
  );
}

function Container217() {
  return (
    <div className="absolute h-[68px] left-0 top-[-0.6px] w-[684px]" data-name="Container">
      <Container218 />
    </div>
  );
}

function Description4() {
  return (
    <div className="absolute h-[67.22px] left-[16px] overflow-clip top-[78.8px] w-[684px]" data-name="Description">
      <Container217 />
    </div>
  );
}

function Default24() {
  return (
    <div className="absolute h-[146.02px] left-0 overflow-clip top-[388.04px] w-[700px]" data-name="Default">
      <Title35 />
      <Description4 />
      <div className="absolute border-[#363636] border-l border-solid h-[146.02px] left-0 top-0 w-[700px]" data-name="VerticalBorder" />
    </div>
  );
}

function Recommendations() {
  return (
    <div className="absolute h-[534.06px] left-0 top-[56px] w-[700px]" data-name="Recommendations">
      <Default22 />
      <Default23 />
      <Default24 />
    </div>
  );
}

function Content12() {
  return (
    <div className="absolute h-[590.06px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Content">
      <Title32 />
      <Recommendations />
    </div>
  );
}

function Container202() {
  return (
    <div className="absolute h-[710.06px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content12 />
    </div>
  );
}

function SectionRecommendations() {
  return (
    <div className="absolute bg-[#111] h-[710.06px] left-0 top-[4750.72px] w-[1440px]" data-name="Section - Recommendations">
      <Container202 />
    </div>
  );
}

function Heading36() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[559px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">{`Articles & publications`}</p>
      </div>
    </div>
  );
}

function Container221() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[559px]" data-name="Container">
      <Heading36 />
    </div>
  );
}

function Default25() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[559px]" data-name="Default">
      <Container221 />
    </div>
  );
}

function Container220() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[559px]" data-name="Container">
      <Default25 />
    </div>
  );
}

function Container224() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[105px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://gbaltar.framer.website/blog">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">View all posts</p>
      </a>
    </div>
  );
}

function Container223() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[105px]" data-name="Container">
      <Container224 />
    </div>
  );
}

function Container225() {
  return <div className="absolute left-[109px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function LinkIconButton1() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-0 w-[125px]" data-name="Link - Icon button">
      <Container223 />
      <Container225 />
    </div>
  );
}

function Container222() {
  return (
    <div className="absolute h-[23px] left-[575px] top-[0.5px] w-[125px]" data-name="Container">
      <LinkIconButton1 />
    </div>
  );
}

function Title36() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Container220 />
      <Container222 />
    </div>
  );
}

function ImageZ6A1Uul2IyYsOynJLfYeMuXTkPng() {
  return (
    <div className="absolute h-[228.33px] left-0 top-0 w-[342px]" data-name="Image → Z6A1UUL2IYYsOynJLfYEMuXTk.png">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-9.76%] max-w-none top-0 w-[119.52%]" src={imgImageZ6A1Uul2IyYsOynJLfYeMuXTkPng} />
      </div>
    </div>
  );
}

function Image4() {
  return (
    <div className="absolute h-[228.33px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Image">
      <ImageZ6A1Uul2IyYsOynJLfYeMuXTkPng />
      <div className="absolute border border-[#242424] border-solid h-[228.33px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function Heading37() {
  return (
    <div className="absolute h-[39px] left-0 top-0 w-[342px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute cursor-pointer flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[19.2px] left-0 not-italic text-[#fafafa] text-[0px] text-[16px] top-[19.5px] whitespace-nowrap whitespace-pre" href="https://gbaltar.framer.website/blog/the-future-of-web-design-trends-to-watch-in-2024">
        <p className="mb-0">{`The Future of Web Design: Trends to Watch `}</p>
        <p>in 2024</p>
      </a>
    </div>
  );
}

function Container226() {
  return (
    <div className="absolute h-[39px] left-0 top-[-0.9px] w-[342px]" data-name="Container">
      <Heading37 />
    </div>
  );
}

function Container229() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[136px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Web Design Journal,</p>
      </div>
    </div>
  );
}

function Container228() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[136px]" data-name="Container">
      <Container229 />
    </div>
  );
}

function Container231() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[127px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">15 de mai. de 2024</p>
      </div>
    </div>
  );
}

function Container230() {
  return (
    <div className="absolute h-[20px] left-[138px] top-0 w-[127px]" data-name="Container">
      <Container231 />
    </div>
  );
}

function Container227() {
  return (
    <div className="absolute h-[20px] left-0 top-[44.4px] w-[342px]" data-name="Container">
      <Container228 />
      <Container230 />
    </div>
  );
}

function Title37() {
  return (
    <div className="absolute h-[64px] left-0 overflow-clip top-0 w-[342px]" data-name="Title">
      <Container226 />
      <Container227 />
    </div>
  );
}

function Container232() {
  return (
    <div className="absolute h-[90px] left-0 top-0 w-[342px]" data-name="Container">
      <a className="-translate-y-1/2 absolute cursor-pointer flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[0px] text-[16px] top-[45px] whitespace-nowrap whitespace-pre" href="https://gbaltar.framer.website/blog/the-future-of-web-design-trends-to-watch-in-2024">
        <p className="mb-0">{`An in-depth analysis of upcoming trends in `}</p>
        <p className="mb-0">{`web design, focusing on emerging `}</p>
        <p className="mb-0">{`technologies and design philosophies that `}</p>
        <p>are set to shape the future of the industry.</p>
      </a>
    </div>
  );
}

function Description5() {
  return (
    <div className="absolute h-[90px] left-0 overflow-clip top-[84px] w-[342px]" data-name="Description">
      <Container232 />
    </div>
  );
}

function Container235() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[91px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Read article</p>
      </div>
    </div>
  );
}

function Container234() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[91px]" data-name="Container">
      <Container235 />
    </div>
  );
}

function Container236() {
  return <div className="absolute left-[95px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container233() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[111px]" data-name="Container">
      <Container234 />
      <Container236 />
    </div>
  );
}

function Line8() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[111px]" data-name="Line" />;
}

function ButtonsPrimary() {
  return (
    <div className="absolute h-[26px] left-[231px] overflow-clip top-[194px] w-[111px]" data-name="Buttons/Primary">
      <Container233 />
      <Line8 />
    </div>
  );
}

function Content14() {
  return (
    <div className="absolute h-[220px] left-[358px] overflow-clip top-0 w-[342px]" data-name="Content">
      <Title37 />
      <Description5 />
      <ButtonsPrimary />
    </div>
  );
}

function LinkDesktop() {
  return (
    <div className="absolute h-[228.33px] left-0 overflow-clip top-0 w-[700px]" data-name="Link - Desktop">
      <Image4 />
      <Content14 />
    </div>
  );
}

function ImageSDzIy1U53T5YBcy2EHun6E2OsJpg() {
  return (
    <div className="absolute h-[228.33px] left-0 top-0 w-[342px]" data-name="Image → sDzIy1u53t5yBcy2EHun6E2Os.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-0.05%] max-w-none top-0 w-[100.1%]" src={imgImageSDzIy1U53T5YBcy2EHun6E2OsJpg} />
      </div>
    </div>
  );
}

function Image5() {
  return (
    <div className="absolute h-[228.33px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Image">
      <ImageSDzIy1U53T5YBcy2EHun6E2OsJpg />
      <div className="absolute border border-[#242424] border-solid h-[228.33px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function Heading38() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[342px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/blog/responsive-design-best-practices">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">Responsive Design Best Practices</p>
      </a>
    </div>
  );
}

function Container237() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[342px]" data-name="Container">
      <Heading38 />
    </div>
  );
}

function Container240() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[157px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Modern Web Magazine,</p>
      </div>
    </div>
  );
}

function Container239() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[157px]" data-name="Container">
      <Container240 />
    </div>
  );
}

function Container242() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[125px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">11 de mai. de 2024</p>
      </div>
    </div>
  );
}

function Container241() {
  return (
    <div className="absolute h-[20px] left-[159px] top-0 w-[125px]" data-name="Container">
      <Container242 />
    </div>
  );
}

function Container238() {
  return (
    <div className="absolute h-[20px] left-0 top-[25.21px] w-[342px]" data-name="Container">
      <Container239 />
      <Container241 />
    </div>
  );
}

function Title38() {
  return (
    <div className="absolute h-[44.8px] left-0 overflow-clip top-0 w-[342px]" data-name="Title">
      <Container237 />
      <Container238 />
    </div>
  );
}

function Container243() {
  return (
    <div className="absolute h-[90px] left-0 top-0 w-[342px]" data-name="Container">
      <a className="-translate-y-1/2 absolute cursor-pointer flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[0px] text-[16px] top-[45px] whitespace-nowrap whitespace-pre" href="https://gbaltar.framer.website/blog/responsive-design-best-practices">
        <p className="mb-0">{`An article outlining the best practices for `}</p>
        <p className="mb-0">{`creating responsive websites that perform `}</p>
        <p className="mb-0">{`well on all devices, ensuring a seamless user `}</p>
        <p>experience.</p>
      </a>
    </div>
  );
}

function Description6() {
  return (
    <div className="absolute h-[90px] left-0 overflow-clip top-[64.8px] w-[342px]" data-name="Description">
      <Container243 />
    </div>
  );
}

function Container246() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[91px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Read article</p>
      </div>
    </div>
  );
}

function Container245() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[91px]" data-name="Container">
      <Container246 />
    </div>
  );
}

function Container247() {
  return <div className="absolute left-[95px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container244() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[111px]" data-name="Container">
      <Container245 />
      <Container247 />
    </div>
  );
}

function Line9() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[24.99px] w-[111px]" data-name="Line" />;
}

function ButtonsPrimary1() {
  return (
    <div className="absolute h-[25.99px] left-[231px] overflow-clip top-[174.8px] w-[111px]" data-name="Buttons/Primary">
      <Container244 />
      <Line9 />
    </div>
  );
}

function Content15() {
  return (
    <div className="absolute h-[200.79px] left-[358px] overflow-clip top-0 w-[342px]" data-name="Content">
      <Title38 />
      <Description6 />
      <ButtonsPrimary1 />
    </div>
  );
}

function LinkDesktop1() {
  return (
    <div className="absolute h-[228.33px] left-0 overflow-clip top-[268.33px] w-[700px]" data-name="Link - Desktop">
      <Image5 />
      <Content15 />
    </div>
  );
}

function ImagePhUpoeFssCGpuR6LioEu8Kx9VgJpg() {
  return (
    <div className="absolute h-[228.33px] left-0 top-0 w-[342px]" data-name="Image → phUpoeFssCGpuR6LioEu8KX9Vg.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-0.05%] max-w-none top-0 w-[100.1%]" src={imgImagePhUpoeFssCGpuR6LioEu8Kx9VgJpg} />
      </div>
    </div>
  );
}

function Image6() {
  return (
    <div className="absolute h-[228.33px] left-0 overflow-clip rounded-[8px] top-0 w-[342px]" data-name="Image">
      <ImagePhUpoeFssCGpuR6LioEu8Kx9VgJpg />
      <div className="absolute border border-[#242424] border-solid h-[228.33px] left-0 rounded-[8px] top-0 w-[342px]" data-name="Border" />
    </div>
  );
}

function Heading39() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[342px]" data-name="Heading 3">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/blog/the-art-of-minimalist-web-design">
        <p className="cursor-pointer leading-[19.2px] text-[16px]">The Art of Minimalist Web Design</p>
      </a>
    </div>
  );
}

function Container248() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[342px]" data-name="Container">
      <Heading39 />
    </div>
  );
}

function Container251() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[157px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Modern Web Magazine,</p>
      </div>
    </div>
  );
}

function Container250() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[157px]" data-name="Container">
      <Container251 />
    </div>
  );
}

function Container253() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[127px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">10 de mai. de 2024</p>
      </div>
    </div>
  );
}

function Container252() {
  return (
    <div className="absolute h-[20px] left-[159px] top-0 w-[127px]" data-name="Container">
      <Container253 />
    </div>
  );
}

function Container249() {
  return (
    <div className="absolute h-[20px] left-0 top-[25.21px] w-[342px]" data-name="Container">
      <Container250 />
      <Container252 />
    </div>
  );
}

function Title39() {
  return (
    <div className="absolute h-[44.8px] left-0 overflow-clip top-0 w-[342px]" data-name="Title">
      <Container248 />
      <Container249 />
    </div>
  );
}

function Container254() {
  return (
    <div className="absolute h-[90px] left-0 top-0 w-[342px]" data-name="Container">
      <a className="-translate-y-1/2 absolute cursor-pointer flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.4px] left-0 not-italic text-[#ababab] text-[0px] text-[16px] top-[45px] whitespace-nowrap whitespace-pre" href="https://gbaltar.framer.website/blog/the-art-of-minimalist-web-design">
        <p className="mb-0">{`A discussion on the principles of minimalist `}</p>
        <p className="mb-0">{`design, showcasing examples and providing `}</p>
        <p className="mb-0">{`tips on how to implement minimalist design `}</p>
        <p>effectively.</p>
      </a>
    </div>
  );
}

function Description7() {
  return (
    <div className="absolute h-[90px] left-0 overflow-clip top-[64.8px] w-[342px]" data-name="Description">
      <Container254 />
    </div>
  );
}

function Container257() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[91px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Read article</p>
      </div>
    </div>
  );
}

function Container256() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[91px]" data-name="Container">
      <Container257 />
    </div>
  );
}

function Container258() {
  return <div className="absolute left-[95px] size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container255() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[111px]" data-name="Container">
      <Container256 />
      <Container258 />
    </div>
  );
}

function Line10() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[111px]" data-name="Line" />;
}

function ButtonsPrimary2() {
  return (
    <div className="absolute h-[26px] left-[231px] overflow-clip top-[174.8px] w-[111px]" data-name="Buttons/Primary">
      <Container255 />
      <Line10 />
    </div>
  );
}

function Content16() {
  return (
    <div className="absolute h-[200.8px] left-[358px] overflow-clip top-0 w-[342px]" data-name="Content">
      <Title39 />
      <Description7 />
      <ButtonsPrimary2 />
    </div>
  );
}

function LinkDesktop2() {
  return (
    <div className="absolute h-[228.33px] left-0 overflow-clip top-[536.66px] w-[700px]" data-name="Link - Desktop">
      <Image6 />
      <Content16 />
    </div>
  );
}

function ArticleList() {
  return (
    <div className="absolute h-[764.99px] left-0 top-0 w-[700px]" data-name="Article list">
      <LinkDesktop />
      <LinkDesktop1 />
      <LinkDesktop2 />
    </div>
  );
}

function Articles() {
  return (
    <div className="absolute h-[764.99px] left-0 top-[56px] w-[700px]" data-name="Articles">
      <ArticleList />
    </div>
  );
}

function Content13() {
  return (
    <div className="absolute h-[820.99px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Content">
      <Title36 />
      <Articles />
    </div>
  );
}

function Container219() {
  return (
    <div className="absolute h-[940.99px] left-0 top-0 w-[1440px]" data-name="Container">
      <Content13 />
    </div>
  );
}

function SectionBlogPosts() {
  return (
    <div className="absolute bg-[#111] h-[940.99px] left-0 top-[5460.77px] w-[1440px]" data-name="Section - Blog posts">
      <Container219 />
    </div>
  );
}

function Heading40() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">{`Let's talk`}</p>
      </div>
    </div>
  );
}

function Container260() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[700px]" data-name="Container">
      <Heading40 />
    </div>
  );
}

function Default26() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Default">
      <Container260 />
    </div>
  );
}

function Title40() {
  return (
    <div className="absolute h-[24px] left-0 max-w-[1200px] top-0 w-[700px]" data-name="Title">
      <Default26 />
    </div>
  );
}

function Heading41() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[96px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Time for me:</p>
      </div>
    </div>
  );
}

function Container261() {
  return (
    <div className="absolute h-[20px] left-0 top-[-0.8px] w-[96px]" data-name="Container">
      <Heading41 />
    </div>
  );
}

function MyTime() {
  return (
    <div className="absolute h-[23.2px] left-[16px] overflow-clip top-0 w-[224px]" data-name="My time">
      <Container261 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-[104px] not-italic text-[#fafafa] text-[16px] top-[9.2px] whitespace-nowrap">
        <p className="leading-[19.2px]">12:26 PM</p>
      </div>
    </div>
  );
}

function Heading42() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[46px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Email:</p>
      </div>
    </div>
  );
}

function Container262() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[46px]" data-name="Container">
      <Heading42 />
    </div>
  );
}

function Container263() {
  return <div className="absolute left-0 size-[16px] top-[2px]" data-name="Container" />;
}

function Container265() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[166px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">johnsmith@gmail.com</p>
      </div>
    </div>
  );
}

function Container264() {
  return (
    <div className="absolute h-[23px] left-[22px] top-[-1.5px] w-[166px]" data-name="Container">
      <Container265 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#fafafa] h-[20px] left-0 rounded-[50px] top-0 w-[188px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[94px] not-italic text-[39.4px] text-center text-white top-[10px] whitespace-nowrap">
        <p className="leading-[40px]">h@gmail</p>
      </div>
    </div>
  );
}

function Container266() {
  return (
    <div className="absolute h-[20px] left-0 opacity-0 top-0 w-[188px]" data-name="Container">
      <Button />
    </div>
  );
}

function CopyEmailButton() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-[35.21px] w-[188px]" data-name="Copy email button">
      <Container263 />
      <Container264 />
      <Container266 />
    </div>
  );
}

function Email() {
  return (
    <div className="absolute h-[59.2px] left-[16px] overflow-clip top-[55.2px] w-[224px]" data-name="Email">
      <Container262 />
      <CopyEmailButton />
    </div>
  );
}

function Heading43() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[53px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Phone:</p>
      </div>
    </div>
  );
}

function Container267() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[53px]" data-name="Container">
      <Heading43 />
    </div>
  );
}

function Container268() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container270() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[117px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">(123) 456 7890</p>
      </div>
    </div>
  );
}

function Container269() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[117px]" data-name="Container">
      <Container270 />
    </div>
  );
}

function LinkIconButton2() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-[35.2px] w-[137px]" data-name="Link - Icon button">
      <Container268 />
      <Container269 />
    </div>
  );
}

function Socials() {
  return (
    <div className="absolute h-[61.61px] left-[16px] overflow-clip top-[146.4px] w-[224px]" data-name="Socials">
      <Container267 />
      <LinkIconButton2 />
    </div>
  );
}

function Heading44() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[60px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Socials:</p>
      </div>
    </div>
  );
}

function Container271() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[60px]" data-name="Container">
      <Heading44 />
    </div>
  );
}

function Container272() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container274() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[53px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://x.com/ThaerSwailem">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Twitter</p>
      </a>
    </div>
  );
}

function Container273() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[53px]" data-name="Container">
      <Container274 />
    </div>
  );
}

function LinkIconButton3() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-[35.2px] w-[73px]" data-name="Link - Icon button">
      <Container272 />
      <Container273 />
    </div>
  );
}

function Container275() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container277() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[76px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://www.instagram.com/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Instagram</p>
      </a>
    </div>
  );
}

function Container276() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[76px]" data-name="Container">
      <Container277 />
    </div>
  );
}

function LinkIconButton4() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-[73.61px] w-[96px]" data-name="Link - Icon button">
      <Container275 />
      <Container276 />
    </div>
  );
}

function Container278() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container280() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[64px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://linkedin.com/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">LinkedIn</p>
      </a>
    </div>
  );
}

function Container279() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[64px]" data-name="Container">
      <Container280 />
    </div>
  );
}

function LinkIconButton5() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-[112.01px] w-[84px]" data-name="Link - Icon button">
      <Container278 />
      <Container279 />
    </div>
  );
}

function Socials1() {
  return (
    <div className="absolute h-[138.42px] left-[16px] overflow-clip top-[240.01px] w-[224px]" data-name="Socials">
      <Container271 />
      <LinkIconButton3 />
      <LinkIconButton4 />
      <LinkIconButton5 />
    </div>
  );
}

function Info() {
  return (
    <div className="absolute h-[378.43px] left-0 max-w-[240px] top-0 w-[240px]" data-name="Info">
      <MyTime />
      <Email />
      <Socials />
      <Socials1 />
      <div className="absolute border-[#363636] border-l border-solid h-[378.434px] left-0 top-0 w-[240px]" data-name="VerticalBorder" />
    </div>
  );
}

function Heading45() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[82px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Reach out:</p>
      </div>
    </div>
  );
}

function Container281() {
  return (
    <div className="absolute h-[20px] left-0 top-[-1px] w-[82px]" data-name="Container">
      <Heading45 />
    </div>
  );
}

function Container282() {
  return (
    <div className="absolute h-[17px] left-[12px] overflow-clip top-[11px] w-[404px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[8.5px] whitespace-nowrap">
        <p className="leading-[normal]">Your name</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute h-[39.59px] left-0 overflow-clip top-0 w-[428px]" data-name="Input">
      <Container282 />
    </div>
  );
}

function Label() {
  return (
    <div className="absolute bg-[#242424] h-[39.59px] left-0 overflow-clip rounded-[8px] top-0 w-[428px]" data-name="Label">
      <Input />
      <div className="absolute border border-[#363636] border-solid h-[39.59px] left-0 rounded-[8px] top-0 w-[428px]" data-name="Border" />
    </div>
  );
}

function Container283() {
  return (
    <div className="absolute h-[17px] left-[12px] overflow-clip top-[11.5px] w-[404px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[8.5px] whitespace-nowrap">
        <p className="leading-[normal]">Your Email address</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute h-[40px] left-0 overflow-clip top-0 w-[428px]" data-name="Input">
      <Container283 />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute bg-[#242424] h-[40px] left-0 overflow-clip rounded-[8px] top-[59.59px] w-[428px]" data-name="Label">
      <Input1 />
      <div className="absolute border border-[#363636] border-solid h-[40px] left-0 rounded-[8px] top-0 w-[428px]" data-name="Border" />
    </div>
  );
}

function Container284() {
  return (
    <div className="absolute h-[19.59px] left-[12px] top-[10px] w-[403.8px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[9.8px] whitespace-nowrap">
        <p className="leading-[19.6px]">Message</p>
      </div>
    </div>
  );
}

function Textarea() {
  return (
    <div className="absolute h-[180px] left-0 min-h-[180px] overflow-x-clip overflow-y-auto top-0 w-[428px]" data-name="Textarea">
      <Container284 />
      <div className="absolute h-[19.59px] left-[12px] top-[10px] w-[404px]" data-name="Rectangle" />
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute bg-[#242424] h-[180px] left-0 min-h-[180px] overflow-clip rounded-[8px] top-[119.59px] w-[428px]" data-name="Label">
      <Textarea />
      <div className="absolute border border-[#363636] border-solid h-[180px] left-0 rounded-[8px] top-0 w-[428px]" data-name="Border" />
    </div>
  );
}

function Container286() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[112px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#111] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Send Message</p>
      </div>
    </div>
  );
}

function Container285() {
  return (
    <div className="absolute h-[23px] left-[158px] top-[8.5px] w-[112px]" data-name="Container">
      <Container286 />
    </div>
  );
}

function ButtonDefault() {
  return (
    <div className="absolute bg-[#fafafa] h-[40px] left-0 overflow-clip rounded-[6px] top-[319.59px] w-[428px]" data-name="Button - Default">
      <Container285 />
    </div>
  );
}

function Form() {
  return (
    <div className="absolute h-[359.59px] left-0 overflow-clip top-[35.2px] w-[428px]" data-name="Form">
      <Label />
      <Label1 />
      <Label2 />
      <ButtonDefault />
    </div>
  );
}

function ContactForm() {
  return (
    <div className="absolute h-[394.8px] left-[272px] overflow-clip top-0 w-[428px]" data-name="Contact form">
      <Container281 />
      <Form />
    </div>
  );
}

function Content17() {
  return (
    <div className="absolute h-[394.8px] left-0 overflow-clip top-[56px] w-[700px]" data-name="Content">
      <Info />
      <ContactForm />
    </div>
  );
}

function Contact() {
  return (
    <div className="absolute h-[450.8px] left-[370px] max-w-[700px] top-[60px] w-[700px]" data-name="Contact">
      <Title40 />
      <Content17 />
    </div>
  );
}

function Container288() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[78px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Designed in</p>
      </div>
    </div>
  );
}

function Container287() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[78px]" data-name="Container">
      <Container288 />
    </div>
  );
}

function Link() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[47px]" data-name="Link">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[14px] top-[10px] whitespace-nowrap" href="https://framer.link/thaerswailem">
        <p className="cursor-pointer leading-[19.6px]">Framer</p>
      </a>
    </div>
  );
}

function Container290() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[47px]" data-name="Container">
      <Link />
    </div>
  );
}

function Container289() {
  return (
    <div className="absolute h-[20px] left-[82px] top-0 w-[47px]" data-name="Container">
      <Container290 />
    </div>
  );
}

function Container292() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[17px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">By</p>
      </div>
    </div>
  );
}

function Container291() {
  return (
    <div className="absolute h-[20px] left-[133px] top-0 w-[17px]" data-name="Container">
      <Container292 />
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[39px]" data-name="Link">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[10px] whitespace-nowrap" href="https://thaer.shop/">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Thaer</p>
      </a>
    </div>
  );
}

function Container294() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[39px]" data-name="Container">
      <Link1 />
    </div>
  );
}

function Container293() {
  return (
    <div className="absolute h-[20px] left-[154px] top-0 w-[39px]" data-name="Container">
      <Container294 />
    </div>
  );
}

function DesignedBy() {
  return (
    <div className="absolute h-[20px] left-[4px] top-0 w-[565px]" data-name="Designed By">
      <Container287 />
      <Container289 />
      <Container291 />
      <Container293 />
    </div>
  );
}

function Container296() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[121px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">© Copyright 2024</p>
      </div>
    </div>
  );
}

function Container295() {
  return (
    <div className="absolute h-[20px] left-[575px] top-0 w-[121px]" data-name="Container">
      <Container296 />
    </div>
  );
}

function Content18() {
  return (
    <div className="absolute h-[20px] left-0 rounded-[6px] top-[8px] w-[700px]" data-name="Content">
      <DesignedBy />
      <Container295 />
    </div>
  );
}

function Copyright() {
  return (
    <div className="absolute h-[28px] left-[370px] max-w-[700px] overflow-clip top-[570.8px] w-[700px]" data-name="Copyright">
      <div className="absolute border-[#363636] border-solid border-t h-[37.992px] left-0 top-0 w-[700px]" data-name="HorizontalBorder" />
      <Content18 />
    </div>
  );
}

function Container259() {
  return (
    <div className="absolute h-[614.8px] left-0 overflow-clip top-0 w-[1440px]" data-name="Container">
      <Contact />
      <Copyright />
    </div>
  );
}

function FooterDesktopTablet() {
  return (
    <div className="absolute bg-[#111] h-[614.8px] left-0 overflow-clip top-[6401.75px] w-[1440px]" data-name="Footer - Desktop/tablet">
      <Container259 />
    </div>
  );
}

function Component5Ob3HmgwBsS9Eav3CXlcJceZ1EJpeg() {
  return (
    <div className="absolute left-0 rounded-[8px] size-[122px] top-0" data-name="5ob3hmgwBsS9EAV3CXlcJceZ1E.jpeg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[8px]">
        <img alt="" className="absolute h-[101.25%] left-0 max-w-none top-[-0.63%] w-full" src={img5Ob3HmgwBsS9Eav3CXlcJceZ1EJpeg} />
      </div>
    </div>
  );
}

function Photo() {
  return (
    <div className="absolute left-0 overflow-clip rounded-[8px] size-[122px] top-0" data-name="Photo">
      <Component5Ob3HmgwBsS9Eav3CXlcJceZ1EJpeg />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[32px] left-0 top-0 w-[423px]" data-name="Heading 1">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[26px] top-[16px] whitespace-nowrap">
        <p className="leading-[31.2px]">Gabriel Baltar Pereira</p>
      </div>
    </div>
  );
}

function Container297() {
  return (
    <div className="absolute h-[32px] left-0 top-0 w-[423px]" data-name="Container">
      <Heading />
    </div>
  );
}

function Heading46() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[423px]" data-name="Heading 2">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#ababab] text-[20px] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">{`UX Designer `}</p>
      </div>
    </div>
  );
}

function Container298() {
  return (
    <div className="absolute h-[24px] left-0 top-[36px] w-[423px]" data-name="Container">
      <Heading46 />
    </div>
  );
}

function Container299() {
  return (
    <div className="absolute left-0 size-[14px] top-[3px]" data-name="Container">
      <div className="absolute bg-[#d9d9d9] left-[-2.16px] size-[16.162px] top-0" />
    </div>
  );
}

function Container301() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[138px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Rio de Janeiro, Brasil</p>
      </div>
    </div>
  );
}

function Container300() {
  return (
    <div className="absolute h-[20px] left-[16px] top-0 w-[138px]" data-name="Container">
      <Container301 />
    </div>
  );
}

function IconButton6() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-[64px] w-[154px]" data-name="Icon button">
      <Container299 />
      <Container300 />
    </div>
  );
}

function Name6() {
  return (
    <div className="absolute h-[84px] left-0 overflow-clip top-0 w-[423px]" data-name="Name">
      <Container297 />
      <Container298 />
      <IconButton6 />
    </div>
  );
}

function Background1() {
  return <div className="absolute bg-[#00ff3c] left-0 rounded-[10px] size-[6px] top-[7px]" data-name="Background" />;
}

function Container303() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[161px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[14px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.6px]">Disponível para trabalho</p>
      </div>
    </div>
  );
}

function Container302() {
  return (
    <div className="absolute h-[20px] left-[10px] top-0 w-[161px]" data-name="Container">
      <Container303 />
    </div>
  );
}

function IconButton7() {
  return (
    <div className="absolute h-[20px] left-0 overflow-clip top-[99.99px] w-[171px]" data-name="Icon button">
      <Background1 />
      <Container302 />
    </div>
  );
}

function Title41() {
  return (
    <div className="absolute h-[119.99px] left-[138px] overflow-clip top-[1.01px] w-[423px]" data-name="Title">
      <Name6 />
      <IconButton7 />
    </div>
  );
}

function Info1() {
  return (
    <div className="absolute h-[122px] left-0 overflow-clip top-0 w-[561px]" data-name="Info">
      <Photo />
      <Title41 />
    </div>
  );
}

function Container306() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container308() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[102px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[0px] top-[11.5px] whitespace-nowrap" href="https://framer.com/projects/new">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Get Template</p>
      </a>
    </div>
  );
}

function Container307() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[102px]" data-name="Container">
      <Container308 />
    </div>
  );
}

function Container305() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[122px]" data-name="Container">
      <Container306 />
      <Container307 />
    </div>
  );
}

function Line11() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[24.99px] w-[122px]" data-name="Line" />;
}

function LinkIconLeft() {
  return (
    <div className="absolute h-[25.99px] left-0 overflow-clip top-0 w-[122px]" data-name="Link - Icon left">
      <Container305 />
      <Line11 />
    </div>
  );
}

function Container304() {
  return (
    <div className="absolute h-[25.99px] left-0 top-0 w-[122px]" data-name="Container">
      <LinkIconLeft />
    </div>
  );
}

function Container310() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container312() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[103px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">Download CV</p>
      </div>
    </div>
  );
}

function Container311() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[103px]" data-name="Container">
      <Container312 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[123px]" data-name="Text">
      <Container310 />
      <Container311 />
    </div>
  );
}

function Line12() {
  return <div className="absolute bg-[#363636] h-px left-0 top-[25px] w-[123px]" data-name="Line" />;
}

function Link2() {
  return (
    <div className="absolute bg-[#111] h-[26px] left-0 opacity-0 rounded-[50px] top-0 w-[123px]" data-name="Link">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-[10px] not-italic text-[0px] text-white top-[13px] whitespace-nowrap" href="https://framerusercontent.com/assets/eibVEtVqpXg3y3bHpTbVy5a2Y4.pdf">
        <p className="cursor-pointer leading-[16px] text-[16px]">Download</p>
      </a>
    </div>
  );
}

function IconLeft() {
  return (
    <div className="absolute h-[26px] left-0 overflow-clip top-0 w-[123px]" data-name="Icon left">
      <Text />
      <Line12 />
      <Link2 />
    </div>
  );
}

function Container309() {
  return (
    <div className="absolute h-[26px] left-0 top-[41.98px] w-[123px]" data-name="Container">
      <IconLeft />
    </div>
  );
}

function Links() {
  return (
    <div className="absolute h-[67.98px] left-[577px] overflow-clip top-[54.02px] w-[123px]" data-name="Links">
      <Container304 />
      <Container309 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute h-[122px] left-[370px] top-[99.41px] w-[700px]" data-name="header">
      <Info1 />
      <Links />
    </div>
  );
}

function Container313() {
  return <div className="absolute left-[374px] size-[16px] top-[263.41px]" data-name="Container" />;
}

function Container315() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[224px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[16px] top-[11.5px] whitespace-nowrap">
        <p className="leading-[22.4px]">gabriel.baltar21@hotmail.com</p>
      </div>
    </div>
  );
}

function Container314() {
  return (
    <div className="absolute h-[23px] left-[396px] top-[259.91px] w-[224px]" data-name="Container">
      <Container315 />
    </div>
  );
}

function Container316() {
  return (
    <div className="absolute h-[20px] left-[374px] opacity-0 top-[261.41px] w-[246px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[113.5px] not-italic text-[37.8px] text-center text-white top-[10px] whitespace-nowrap">
        <p className="leading-[40px]">r21@hotmail</p>
      </div>
    </div>
  );
}

function Container318() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container320() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[53px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://x.com/ThaerSwailem">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">Twitter</p>
      </a>
    </div>
  );
}

function Container319() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[53px]" data-name="Container">
      <Container320 />
    </div>
  );
}

function LinkIconButton6() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-0 w-[73px]" data-name="Link - Icon button">
      <Container318 />
      <Container319 />
      <div className="absolute bg-[#d9d9d9] left-[-0.16px] size-[16.162px] top-[3.34px]" />
    </div>
  );
}

function Container317() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[73px]" data-name="Container">
      <LinkIconButton6 />
    </div>
  );
}

function Container322() {
  return <div className="absolute left-0 size-[16px] top-[3.5px]" data-name="Container" />;
}

function Container324() {
  return (
    <div className="absolute h-[23px] left-0 top-0 w-[64px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[11.5px] whitespace-nowrap" href="https://linkedin.com/">
        <p className="cursor-pointer leading-[22.4px] text-[16px]">LinkedIn</p>
      </a>
    </div>
  );
}

function Container323() {
  return (
    <div className="absolute h-[23px] left-[20px] top-0 w-[64px]" data-name="Container">
      <Container324 />
    </div>
  );
}

function LinkIconButton7() {
  return (
    <div className="absolute h-[23px] left-0 overflow-clip top-0 w-[84px]" data-name="Link - Icon button">
      <Container322 />
      <Container323 />
      <div className="absolute bg-[#d9d9d9] left-[-0.16px] size-[16.162px] top-[3.5px]" />
    </div>
  );
}

function Container321() {
  return (
    <div className="absolute h-[23px] left-[89px] top-0 w-[84px]" data-name="Container">
      <LinkIconButton7 />
    </div>
  );
}

function Socials2() {
  return (
    <div className="absolute h-[23px] left-[897px] overflow-clip top-[261.41px] w-[173px]" data-name="Socials">
      <Container317 />
      <Container321 />
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#111] h-[7016.14px] left-0 overflow-clip top-0 w-[1440px]" data-name="Background">
      <SectionAboutMe />
      <SectionWork />
      <SectionExperience />
      <SectionEducation />
      <SectionMyCertifications />
      <SectionTechStack />
      <SectionAwards />
      <SectionRecommendations />
      <SectionBlogPosts />
      <FooterDesktopTablet />
      <Header />
      <Container313 />
      <Container314 />
      <Container316 />
      <Socials2 />
      <div className="absolute border-[#363636] border-solid border-t h-[43.991px] left-[370px] top-[253.41px] w-[700px]" data-name="HorizontalBorder" />
      <div className="absolute left-[720px] size-[0.01px] top-[7016.14px]" data-name="Rectangle" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative size-full" data-name="Home" style={{ backgroundImage: "linear-gradient(90deg, rgb(17, 17, 17) 0%, rgb(17, 17, 17) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container />
      <Container1 />
      <Container2 />
      <Background />
    </div>
  );
}