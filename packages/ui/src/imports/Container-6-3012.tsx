import imgOuJv0UQa3Jjr5TSQkR8FvAiByMJpg from "figma:asset/f74e8c8e6ce6a8687ceb8511bee3d4fab9235e7a.png";

function OuJv0UQa3Jjr5TSQkR8FvAiByMJpg() {
  return (
    <div className="absolute h-[525px] left-0 rounded-tl-[8px] rounded-tr-[8px] top-0 w-[700px]" data-name="ouJv0UQa3jjr5tSQkR8FvAiByM.jpg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-tl-[8px] rounded-tr-[8px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgOuJv0UQa3Jjr5TSQkR8FvAiByMJpg} />
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="absolute h-[525px] left-0 overflow-clip top-0 w-[700px]" data-name="Image">
      <OuJv0UQa3Jjr5TSQkR8FvAiByMJpg />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[642px]" data-name="Heading 3">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] left-0 not-italic text-[#fafafa] text-[16px] top-[10px] whitespace-nowrap">
        <p className="leading-[19.2px]">Capture</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[20px] left-[-6.36px] top-[2.73px] w-[642px]" data-name="Container">
      <Heading />
    </div>
  );
}

function Container3() {
  return <div className="size-[18px]" data-name="Container" />;
}

function Title() {
  return (
    <div className="absolute h-[25.456px] left-[16px] top-[12.87px] w-[671.728px]" data-name="Title">
      <Container2 />
      <div className="absolute flex items-center justify-center left-[652.64px] size-[25.456px] top-0" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-45">
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[20px] left-0 top-0 w-[668px]" data-name="Container">
      <a className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-0 not-italic text-[#ababab] text-[0px] top-[10px] whitespace-nowrap" href="https://gbaltar.framer.website/work/capture">
        <p className="cursor-pointer leading-[19.6px] text-[14px]">Video Agency</p>
      </a>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[20px] left-[16px] top-[43.2px] w-[668px]" data-name="Container">
      <Container5 />
    </div>
  );
}

function Content() {
  return (
    <div className="absolute bg-[#121212] h-[79.21px] left-0 overflow-clip rounded-bl-[8px] rounded-br-[8px] top-[525px] w-[700px]" data-name="Content">
      <Title />
      <Container4 />
      <div className="absolute border-[#242424] border-solid border-t h-[82.442px] left-0 rounded-bl-[8px] rounded-br-[8px] top-0 w-[700px]" data-name="HorizontalBorder" />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[#121212] h-[604.21px] left-0 overflow-clip rounded-[8px] top-0 w-[700px]" data-name="Container">
      <Image />
      <Content />
      <div className="absolute border border-[#363636] border-solid h-[604.275px] left-0 rounded-[8px] top-0 w-[700px]" data-name="Border" />
    </div>
  );
}

function LinkDefault() {
  return (
    <div className="absolute h-[604.21px] left-0 overflow-clip rounded-[8px] top-0 w-[700px]" data-name="Link - Default">
      <Container1 />
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <LinkDefault />
    </div>
  );
}