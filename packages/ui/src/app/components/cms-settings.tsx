import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Save, RotateCcw, ChevronDown, ChevronUp, Plus, Trash2, Upload, GripVertical } from "lucide-react";
import { useCMS, type ProfileData, type Experience, type Education, type Certification, type StackItem, type Award, type Recommendation, type SiteSettings } from "./cms-data";
import {
  getProfileAboutParagraphs,
  getPublicContentVisibilityKey,
  syncProfileAboutFields,
  type PortfolioSectionId,
  type PublicContentVisibilityCollection,
} from "@portfolio/core";
import { toast } from "sonner";
import { CMSConfirmDialog } from "./cms-confirm-dialog";
import { dataProvider } from "./data-provider";
import { RichTextEditor } from "./rich-text";

function hasMeaningfulSelection(field: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!field) return false;
  const { selectionStart, selectionEnd, value } = field;
  if (selectionStart == null || selectionEnd == null || selectionStart === selectionEnd) return false;
  return value.slice(selectionStart, selectionEnd).trim().length > 0;
}

function protectFieldSelection(
  field: HTMLInputElement | HTMLTextAreaElement | null,
  onChange: (value: string) => void,
) {
  if (!field) return false;

  const { selectionStart, selectionEnd, value } = field;
  if (selectionStart == null || selectionEnd == null || selectionStart === selectionEnd) return false;

  const selectedText = value.slice(selectionStart, selectionEnd);
  if (!selectedText.trim()) return false;

  const isAlreadyProtected =
    value.slice(Math.max(0, selectionStart - 2), selectionStart) === "[[" &&
    value.slice(selectionEnd, selectionEnd + 2) === "]]";

  if (isAlreadyProtected || (selectedText.startsWith("[[") && selectedText.endsWith("]]"))) {
    return false;
  }

  const nextValue = `${value.slice(0, selectionStart)}[[${selectedText}]]${value.slice(selectionEnd)}`;
  onChange(nextValue);

  const nextSelectionStart = selectionStart + 2;
  const nextSelectionEnd = selectionEnd + 2;
  requestAnimationFrame(() => {
    field.focus();
    field.setSelectionRange(nextSelectionStart, nextSelectionEnd);
  });

  return true;
}

function ProtectSelectionButton({
  disabled,
  onProtect,
}: {
  disabled: boolean;
  onProtect: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        if (!disabled) {
          onProtect();
        }
      }}
      disabled={disabled}
      title="Selecione um termo e clique para impedir a tradução"
      className="rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-35"
      style={{ border: "1px solid #2a2a2a", color: disabled ? "#555" : "#9a9a9a", backgroundColor: "#101010" }}
    >
      [[ ]]
    </button>
  );
}

function Input({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [canProtect, setCanProtect] = useState(false);

  const syncSelectionState = () => {
    setCanProtect(hasMeaningfulSelection(inputRef.current));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
        <ProtectSelectionButton
          disabled={!canProtect}
          onProtect={() => {
            if (protectFieldSelection(inputRef.current, onChange)) {
              requestAnimationFrame(syncSelectionState);
            }
          }}
        />
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={syncSelectionState}
        onKeyUp={syncSelectionState}
        onFocus={syncSelectionState}
        onBlur={() => setCanProtect(false)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none"
        style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [canProtect, setCanProtect] = useState(false);

  const syncSelectionState = () => {
    setCanProtect(hasMeaningfulSelection(textareaRef.current));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
        <ProtectSelectionButton
          disabled={!canProtect}
          onProtect={() => {
            if (protectFieldSelection(textareaRef.current, onChange)) {
              requestAnimationFrame(syncSelectionState);
            }
          }}
        />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={syncSelectionState}
        onKeyUp={syncSelectionState}
        onFocus={syncSelectionState}
        onBlur={() => setCanProtect(false)}
        rows={rows}
        className="w-full rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none resize-none"
        style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function RichTextField({
  label,
  value,
  onChange,
  placeholder = "",
  multiline = true,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  helperText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
        {helperText ? (
          <span className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
            {helperText}
          </span>
        ) : null}
      </div>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline={multiline}
        containerClassName="rounded-lg border border-[#1e1e1e] bg-[#141414] p-2"
        editorClassName={multiline ? "min-h-[110px] px-3 py-2 text-[#fafafa]" : "min-h-[44px] px-3 py-2 text-[#fafafa]"}
        placeholderClassName="px-3 py-2"
        editorStyle={{ fontSize: "13px", lineHeight: multiline ? "21px" : "18px" }}
      />
    </div>
  );
}

function ExperienceTaskInput({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [canProtect, setCanProtect] = useState(false);

  const syncSelectionState = () => {
    setCanProtect(hasMeaningfulSelection(inputRef.current));
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onSelect={syncSelectionState}
        onKeyUp={syncSelectionState}
        onFocus={syncSelectionState}
        onBlur={() => setCanProtect(false)}
        className="flex-1 rounded-lg px-3 py-1.5 text-[#fafafa] focus:outline-none"
        style={{ fontSize: "12px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
      <ProtectSelectionButton
        disabled={!canProtect}
        onProtect={() => {
          if (protectFieldSelection(inputRef.current, onChange)) {
            requestAnimationFrame(syncSelectionState);
          }
        }}
      />
      <button onClick={onRemove} className="text-[#555] hover:text-red-400 cursor-pointer">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#141414] transition-colors"
      >
        <span className="text-[#ddd]" style={{ fontSize: "13px" }}>{title}</span>
        {open ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

function VisibilitySwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors"
      style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}
    >
      <div className="space-y-1">
        <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19px" }}>
          {label}
        </p>
        <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          {description}
        </p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 accent-[#fafafa]"
      />
    </label>
  );
}

const PORTFOLIO_SECTION_FIELDS: Array<{ id: PortfolioSectionId; label: string; description: string }> = [
  { id: "about", label: "Sobre", description: "Mostra ou oculta o bloco de apresentação pessoal." },
  { id: "projects", label: "Projetos", description: "Controla a seção de projetos na home do portfólio." },
  { id: "experience", label: "Experiência", description: "Controla a linha do tempo de experiência profissional." },
  { id: "education", label: "Educação", description: "Controla a seção de formação acadêmica." },
  { id: "certifications", label: "Certificações", description: "Mostra ou oculta a lista de certificados." },
  { id: "stack", label: "Stack", description: "Controla a seção de ferramentas e tecnologias." },
  { id: "awards", label: "Prêmios", description: "Mostra ou oculta a lista de prêmios." },
  { id: "recommendations", label: "Recomendações", description: "Controla os depoimentos e recomendações." },
  { id: "blog", label: "Artigos", description: "Controla a seção de artigos e publicações." },
  { id: "contact", label: "Contato", description: "Mostra ou oculta o bloco final de contato." },
];

type ExperienceDragItem = {
  index: number;
  type: string;
};

const EXPERIENCE_DND_TYPE = "CMS_SETTINGS_EXPERIENCE";

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function reindexSortableItems<T extends { sortOrder: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function DraggableExperienceSection({
  index,
  children,
  onMovePreview,
  onCommit,
  onCancel,
}: {
  index: number;
  children: React.ReactNode;
  onMovePreview: (dragIndex: number, hoverIndex: number) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: EXPERIENCE_DND_TYPE,
    item: (): ExperienceDragItem => ({ index, type: EXPERIENCE_DND_TYPE }),
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        onCommit();
        return;
      }
      onCancel();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<ExperienceDragItem, { moved: true } | void, { isOver: boolean; canDrop: boolean }>({
    accept: EXPERIENCE_DND_TYPE,
    hover(dragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = dragItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMovePreview(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
    },
    drop() {
      return { moved: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(handleRef);
  drop(ref);

  return (
    <div
      ref={ref}
      className="space-y-2 rounded-[16px] p-1 transition-colors"
      style={{
        opacity: isDragging ? 0.48 : 1,
        backgroundColor: isOver && canDrop ? "#0f0f0f" : "transparent",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-[#666]">
          <button
            ref={handleRef}
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1f1f1f] bg-[#101010] text-[#777] transition-colors hover:border-[#2f2f2f] hover:text-[#ddd] cursor-grab active:cursor-grabbing"
            aria-label="Arrastar experiência"
          >
            <GripVertical size={14} />
          </button>
          <span style={{ fontSize: "11px", lineHeight: "16px" }}>Arraste para reorganizar</span>
        </div>
        <span className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
          {isOver && canDrop ? "Solte aqui" : `Posição ${index + 1}`}
        </span>
      </div>
      {children}
    </div>
  );
}

type SettingsTab = "profile" | "experience" | "education" | "certifications" | "stack" | "awards" | "recommendations";

export function CMSSettings() {
  const cms = useCMS();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ ...cms.data.siteSettings });
  const [profile, setProfile] = useState<ProfileData>(syncProfileAboutFields({ ...cms.data.profile }));
  const [experiences, setExperiences] = useState<Experience[]>(
    reindexSortableItems(cms.data.experiences.map((experience) => ({ ...experience, tasks: [...experience.tasks] }))),
  );
  const [education, setEducation] = useState<Education[]>(cms.data.education.map(e => ({ ...e })));
  const [certs, setCerts] = useState<Certification[]>(cms.data.certifications.map(c => ({ ...c })));
  const [stack, setStack] = useState<StackItem[]>(cms.data.stack.map(s => ({ ...s })));
  const [awards, setAwards] = useState<Award[]>(cms.data.awards.map(a => ({ ...a })));
  const [recs, setRecs] = useState<Recommendation[]>(cms.data.recommendations.map(r => ({ ...r })));
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const experienceOrderSnapshotRef = useRef<Experience[] | null>(null);

  const isSectionVisible = (sectionId: PortfolioSectionId) => siteSettings.sectionVisibility?.[sectionId] !== false;

  const setSectionVisibility = (sectionId: PortfolioSectionId, visible: boolean) => {
    setSiteSettings((current) => {
      const nextVisibility = { ...(current.sectionVisibility || {}) };
      if (visible) {
        delete nextVisibility[sectionId];
      } else {
        nextVisibility[sectionId] = false;
      }

      return {
        ...current,
        sectionVisibility: nextVisibility,
      };
    });
  };

  const isItemVisible = (collection: PublicContentVisibilityCollection, id: string) =>
    siteSettings.contentVisibility?.[getPublicContentVisibilityKey(collection, id)] !== false;

  const setItemVisibility = (collection: PublicContentVisibilityCollection, id: string, visible: boolean) => {
    setSiteSettings((current) => {
      const key = getPublicContentVisibilityKey(collection, id);
      const nextVisibility = { ...(current.contentVisibility || {}) };

      if (visible) {
        delete nextVisibility[key];
      } else {
        nextVisibility[key] = false;
      }

      return {
        ...current,
        contentVisibility: nextVisibility,
      };
    });
  };

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "profile", label: "Perfil" },
    { key: "experience", label: "Experiencia" },
    { key: "education", label: "Educacao" },
    { key: "certifications", label: "Certificados" },
    { key: "stack", label: "Stack" },
    { key: "awards", label: "Premios" },
    { key: "recommendations", label: "Recomendacoes" },
  ];

  const aboutParagraphs = getProfileAboutParagraphs(profile);

  const updateProfileState = (updater: (current: ProfileData) => ProfileData) => {
    setProfile((current) => syncProfileAboutFields(updater(current)));
  };

  const updateAboutParagraphs = (updater: (current: string[]) => string[]) => {
    updateProfileState((current) => ({
      ...current,
      aboutParagraphs: updater(getProfileAboutParagraphs(current)),
    }));
  };

  const updateExperience = (experienceId: string, updater: (current: Experience) => Experience) => {
    setExperiences((current) =>
      current.map((experience) => (
        experience.id === experienceId ? updater(experience) : experience
      )),
    );
  };

  const previewExperienceMove = (dragIndex: number, hoverIndex: number) => {
    setExperiences((current) => {
      if (!experienceOrderSnapshotRef.current) {
        experienceOrderSnapshotRef.current = current;
      }

      return reindexSortableItems(moveArrayItem(current, dragIndex, hoverIndex));
    });
  };

  const commitExperienceOrder = () => {
    experienceOrderSnapshotRef.current = null;
    setExperiences((current) => reindexSortableItems(current));
  };

  const cancelExperienceOrder = () => {
    if (!experienceOrderSnapshotRef.current) return;
    setExperiences(reindexSortableItems(experienceOrderSnapshotRef.current));
    experienceOrderSnapshotRef.current = null;
  };

  const saveProfile = () => {
    const nextProfile = syncProfileAboutFields(profile);
    setProfile(nextProfile);
    cms.updateSiteSettings(siteSettings);
    cms.updateProfile(nextProfile);
    toast.success("Configuracoes salvas!");
  };

  useEffect(() => {
    if (tab !== "profile") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "s") return;

      event.preventDefault();
      saveProfile();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tab, profile, siteSettings]);

  const handleReset = async () => {
    try {
      setResetting(true);
      await cms.resetData();
      setResetOpen(false);
      toast.success("Conteudo demo restaurado!");
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  const handleProfilePhotoUpload = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida.");
      return;
    }

    setPhotoUploading(true);
    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      const nextProfile = syncProfileAboutFields({ ...profile, photo: uploaded.url });
      cms.addMediaItem(uploaded);
      cms.updateProfile(nextProfile);
      setProfile(nextProfile);
      toast.success("Foto enviada e salva.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar foto.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleStackLogoUpload = async (stackId: string, files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida para a logo.");
      return;
    }

    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      const nextStackForSave = stack.map((item) => (
        item.id === stackId ? { ...item, logo: uploaded.url } : item
      ));
      cms.addMediaItem(uploaded);
      cms.updateStack(nextStackForSave);
      setStack(nextStackForSave);
      toast.success("Logo enviada e salva.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar logo.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[#fafafa] mb-1" style={{ fontSize: "22px" }}>Configuracoes</h1>
          <p className="text-[#666]" style={{ fontSize: "13px" }}>Perfil, experiencia e dados do site</p>
          <p className="text-[#555]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            Selecione qualquer termo em um campo e clique em <span className="font-semibold text-[#8d8d8d]">[[ ]]</span> para manter o nome original na traducao. Para desfazer, remova os colchetes.
          </p>
        </div>
        <button
          onClick={() => setResetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 cursor-pointer transition-colors"
          style={{ fontSize: "12px", border: "1px solid #2a2a2a" }}
        >
          <RotateCcw size={12} /> Restaurar demo
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              tab === t.key ? "text-[#fafafa] bg-[#1e1e1e]" : "text-[#666] hover:text-[#aaa]"
            }`}
            style={{ fontSize: "12px" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="grid gap-4 min-[1380px]:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.95fr)]">
          <div className="space-y-4">
            <Section title="Informacoes pessoais">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 min-[1680px]:grid-cols-3">
                <Input label="Nome" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                <Input label="Cargo" value={profile.role} onChange={(v) => setProfile({ ...profile, role: v })} />
                <Input label="Localizacao" value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} />
                <Input label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                <Input label="Telefone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <Input label="Foto URL" value={profile.photo} onChange={(v) => setProfile({ ...profile, photo: v })} />
              </div>

              <div className="space-y-3">
                <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Upload da foto
                </label>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      void handleProfilePhotoUpload(event.target.files);
                    }
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setPhotoDragOver(true);
                  }}
                  onDragLeave={() => setPhotoDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setPhotoDragOver(false);
                    if (event.dataTransfer.files.length) {
                      void handleProfilePhotoUpload(event.dataTransfer.files);
                    }
                  }}
                  onClick={() => photoInputRef.current?.click()}
                  className="flex min-h-[148px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "#101010",
                    borderColor: photoDragOver ? "#3a3a3a" : "#1f1f1f",
                  }}
                >
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt="Preview da foto de perfil"
                      className="h-16 w-16 rounded-2xl object-cover"
                      style={{ border: "1px solid #262626" }}
                    />
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: "#171717", border: "1px solid #262626" }}
                    >
                      <Upload size={18} className="text-[#666]" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[#ddd]" style={{ fontSize: "13px" }}>
                      {photoUploading ? "Enviando foto..." : photoDragOver ? "Solte para enviar a foto" : "Upload original da foto de perfil"}
                    </p>
                    <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                      O arquivo sobe sem compressao automatica para manter a qualidade original.
                    </p>
                  </div>
                </button>
              </div>
            </Section>

            <Section title="Redes sociais">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input label="Nome da rede 1" value={profile.twitterLabel} onChange={(v) => setProfile({ ...profile, twitterLabel: v })} placeholder="Twitter ou X" />
                <Input label="Link da rede 1" value={profile.twitter} onChange={(v) => setProfile({ ...profile, twitter: v })} placeholder="https://..." />
                <Input label="Nome da rede 2" value={profile.instagramLabel} onChange={(v) => setProfile({ ...profile, instagramLabel: v })} placeholder="Instagram ou Behance" />
                <Input label="Link da rede 2" value={profile.instagram} onChange={(v) => setProfile({ ...profile, instagram: v })} placeholder="https://..." />
                <Input label="Nome da rede 3" value={profile.linkedinLabel} onChange={(v) => setProfile({ ...profile, linkedinLabel: v })} placeholder="LinkedIn ou GitHub" />
                <Input label="Link da rede 3" value={profile.linkedin} onChange={(v) => setProfile({ ...profile, linkedin: v })} placeholder="https://..." />
              </div>
            </Section>

            <Section title="Sobre">
              <RichTextField
                label="Titulo"
                value={profile.aboutTitle}
                onChange={(value) => updateProfileState((current) => ({ ...current, aboutTitle: value }))}
                placeholder="Use o toolbar para estilizar o título da seção"
                multiline={false}
                helperText="Negrito, sublinhado, link, cor e tamanho."
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Parágrafos
                  </label>
                  <span className="text-[#555]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                    Adicione quantos blocos quiser e remova os que não precisa.
                  </span>
                </div>
                {aboutParagraphs.map((paragraph, index) => (
                  <div key={`about-paragraph-${index}`} className="space-y-2 rounded-xl border border-[#1a1a1a] bg-[#101010] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                        {`Parágrafo ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateAboutParagraphs((current) => current.filter((_, paragraphIndex) => paragraphIndex !== index))}
                        className="flex items-center gap-1 text-red-400 transition-colors hover:text-red-300 cursor-pointer"
                        style={{ fontSize: "11px", lineHeight: "16px" }}
                      >
                        <Trash2 size={12} />
                        Remover
                      </button>
                    </div>
                    <RichTextField
                      label={`Conteúdo ${index + 1}`}
                      value={paragraph}
                      onChange={(value) =>
                        updateAboutParagraphs((current) => current.map((item, paragraphIndex) => (
                          paragraphIndex === index ? value : item
                        )))
                      }
                      placeholder="Escreva o texto do sobre e use o toolbar para link, sublinhado, cor e tamanho."
                      helperText="Selecione um trecho para formatar."
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateAboutParagraphs((current) => [...current, ""])}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer transition-colors"
                  style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
                >
                  <Plus size={12} />
                  Adicionar parágrafo
                </button>
              </div>
            </Section>
          </div>

          <div className="space-y-4">
            <Section title="Disponibilidade">
              <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={profile.available} onChange={(e) => setProfile({ ...profile, available: e.target.checked })} className="accent-[#00ff3c]" />
                <label className="text-[#aaa]" style={{ fontSize: "13px" }}>Disponivel para trabalho</label>
              </div>
              <Input label="Texto de disponibilidade" value={profile.availableText} onChange={(v) => setProfile({ ...profile, availableText: v })} />
              {!profile.available && (
                <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg p-3 md:grid-cols-2" style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}>
                  <Input label="Cargo atual" value={profile.currentJobTitle} onChange={(v) => setProfile({ ...profile, currentJobTitle: v })} />
                  <Input label="Empresa atual" value={profile.currentCompany} onChange={(v) => setProfile({ ...profile, currentCompany: v })} />
                  <div className="md:col-span-2">
                    <Input label="Site da empresa" value={profile.currentCompanyUrl} onChange={(v) => setProfile({ ...profile, currentCompanyUrl: v })} placeholder="https://..." />
                  </div>
                </div>
              )}
            </Section>

            <Section title="Links do topo">
              <div className="space-y-3">
                <p className="text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  Esses dois links aparecem no topo do perfil no portfolio, ao lado do seu nome.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input label="Link do template" value={siteSettings.templateUrl} onChange={(v) => setSiteSettings({ ...siteSettings, templateUrl: v })} placeholder="https://..." />
                  <Input label="Link do CV" value={siteSettings.resumeUrl} onChange={(v) => setSiteSettings({ ...siteSettings, resumeUrl: v })} placeholder="https://..." />
                </div>
              </div>
            </Section>

            <Section title="Visibilidade do portfolio">
              <div className="space-y-3">
                <p className="text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  O conteúdo ocultado some do site público, mas continua salvo aqui no CMS para edição futura.
                </p>
                {PORTFOLIO_SECTION_FIELDS.map((section) => (
                  <VisibilitySwitch
                    key={section.id}
                    label={section.label}
                    description={section.description}
                    checked={isSectionVisible(section.id)}
                    onChange={(visible) => setSectionVisibility(section.id, visible)}
                  />
                ))}
              </div>
            </Section>

            <Section title="Site & SEO" defaultOpen={false}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 min-[1680px]:grid-cols-3">
                <Input label="Titulo do site" value={siteSettings.siteTitle} onChange={(v) => setSiteSettings({ ...siteSettings, siteTitle: v })} />
                <Input label="Idioma padrao" value={siteSettings.defaultLanguage} onChange={(v) => setSiteSettings({ ...siteSettings, defaultLanguage: v as SiteSettings["defaultLanguage"] })} />
                <div className="md:col-span-2 min-[1680px]:col-span-3">
                  <TextArea label="Descricao do site" value={siteSettings.siteDescription} onChange={(v) => setSiteSettings({ ...siteSettings, siteDescription: v })} rows={2} />
                </div>
                <div className="md:col-span-2 min-[1680px]:col-span-3">
                  <Input label="SEO title" value={siteSettings.seoTitle} onChange={(v) => setSiteSettings({ ...siteSettings, seoTitle: v })} />
                </div>
                <div className="md:col-span-2 min-[1680px]:col-span-3">
                  <TextArea label="SEO description" value={siteSettings.seoDescription} onChange={(v) => setSiteSettings({ ...siteSettings, seoDescription: v })} rows={2} />
                </div>
              </div>
            </Section>

            <button
              onClick={saveProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer transition-colors hover:opacity-90"
              style={{ fontSize: "13px", backgroundColor: "#fafafa" }}
            >
              <Save size={14} /> Salvar Perfil
            </button>
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {tab === "experience" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A ordem salva aqui é a mesma exibida no portfólio público.
          </div>
          {experiences.map((exp, index) => (
            <DraggableExperienceSection
              key={exp.id}
              index={index}
              onMovePreview={previewExperienceMove}
              onCommit={commitExperienceOrder}
              onCancel={cancelExperienceOrder}
            >
              <Section title={exp.company || "Nova experiencia"}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Empresa" value={exp.company} onChange={(value) => updateExperience(exp.id, (current) => ({ ...current, company: value }))} />
                  <Input label="Cargo" value={exp.role} onChange={(value) => updateExperience(exp.id, (current) => ({ ...current, role: value }))} />
                  <Input label="Periodo" value={exp.period} onChange={(value) => updateExperience(exp.id, (current) => ({ ...current, period: value }))} />
                  <Input label="Localizacao" value={exp.location} onChange={(value) => updateExperience(exp.id, (current) => ({ ...current, location: value }))} />
                </div>
                <div className="space-y-2">
                  <VisibilitySwitch
                    label="Mostrar no site"
                    description="Oculta esta experiência do portfólio sem remover do CMS."
                    checked={isItemVisible("experiences", exp.id)}
                    onChange={(visible) => setItemVisibility("experiences", exp.id, visible)}
                  />
                  <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tarefas</label>
                  {exp.tasks.map((task, taskIndex) => (
                    <ExperienceTaskInput
                      key={taskIndex}
                      value={task}
                      onChange={(value) =>
                        updateExperience(exp.id, (current) => ({
                          ...current,
                          tasks: current.tasks.map((item, itemIndex) => (itemIndex === taskIndex ? value : item)),
                        }))
                      }
                      onRemove={() =>
                        updateExperience(exp.id, (current) => ({
                          ...current,
                          tasks: current.tasks.filter((_, itemIndex) => itemIndex !== taskIndex),
                        }))
                      }
                    />
                  ))}
                  <button
                    onClick={() => updateExperience(exp.id, (current) => ({ ...current, tasks: [...current.tasks, ""] }))}
                    className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer"
                    style={{ fontSize: "11px" }}
                  >
                    <Plus size={11} /> Adicionar tarefa
                  </button>
                </div>
                <button
                  onClick={() => setExperiences((current) => reindexSortableItems(current.filter((experience) => experience.id !== exp.id)))}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  style={{ fontSize: "12px" }}
                >
                  <Trash2 size={12} /> Remover
                </button>
              </Section>
            </DraggableExperienceSection>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setExperiences((current) => reindexSortableItems([...current, { id: Date.now().toString(), company: "", role: "", period: "", location: "", tasks: [""], sortOrder: current.length + 1 }]))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer transition-colors" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { const nextExperiences = reindexSortableItems(experiences); setExperiences(nextExperiences); cms.updateSiteSettings(siteSettings); cms.updateExperiences(nextExperiences); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Education Tab */}
      {tab === "education" && (
        <div className="space-y-4">
          {education.map((edu) => (
            <Section key={edu.id} title={edu.degree || "Nova formacao"}>
              <VisibilitySwitch
                label="Mostrar no site"
                description="Oculta esta formação do portfólio sem remover do CMS."
                checked={isItemVisible("education", edu.id)}
                onChange={(visible) => setItemVisibility("education", edu.id, visible)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Grau" value={edu.degree} onChange={(v) => setEducation(education.map(e => e.id === edu.id ? { ...e, degree: v } : e))} />
                <Input label="Universidade" value={edu.university} onChange={(v) => setEducation(education.map(e => e.id === edu.id ? { ...e, university: v } : e))} />
                <Input label="Periodo" value={edu.period} onChange={(v) => setEducation(education.map(e => e.id === edu.id ? { ...e, period: v } : e))} />
                <Input label="Localizacao" value={edu.location} onChange={(v) => setEducation(education.map(e => e.id === edu.id ? { ...e, location: v } : e))} />
              </div>
              <TextArea label="Descricao" value={edu.description} onChange={(v) => setEducation(education.map(e => e.id === edu.id ? { ...e, description: v } : e))} />
              <button onClick={() => setEducation(education.filter(e => e.id !== edu.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setEducation([...education, { id: Date.now().toString(), degree: "", university: "", period: "", location: "", description: "", sortOrder: education.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateSiteSettings(siteSettings); cms.updateEducation(education); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {tab === "certifications" && (
        <div className="space-y-4">
          {certs.map((cert) => (
            <Section key={cert.id} title={cert.title || "Novo certificado"}>
              <VisibilitySwitch
                label="Mostrar no site"
                description="Oculta este certificado do portfólio sem remover do CMS."
                checked={isItemVisible("certifications", cert.id)}
                onChange={(visible) => setItemVisibility("certifications", cert.id, visible)}
              />
              <Input label="Titulo" value={cert.title} onChange={(v) => setCerts(certs.map(c => c.id === cert.id ? { ...c, title: v } : c))} />
              <Input label="Emissor" value={cert.issuer} onChange={(v) => setCerts(certs.map(c => c.id === cert.id ? { ...c, issuer: v } : c))} />
              <div className="space-y-3 rounded-lg p-3" style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}>
                <label className="flex items-center gap-2 text-[#ddd]" style={{ fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={cert.showLink !== false}
                    onChange={(event) =>
                      setCerts(certs.map((c) => (
                        c.id === cert.id
                          ? { ...c, showLink: event.target.checked }
                          : c
                      )))
                    }
                    className="accent-[#fafafa]"
                  />
                  Mostrar botao de visita
                </label>
                {cert.showLink !== false && (
                  <Input
                    label="Link"
                    value={cert.link}
                    onChange={(v) => setCerts(certs.map(c => c.id === cert.id ? { ...c, link: v } : c))}
                    placeholder="https://..."
                  />
                )}
              </div>
              <button onClick={() => setCerts(certs.filter(c => c.id !== cert.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setCerts([...certs, { id: Date.now().toString(), title: "", issuer: "", link: "", showLink: false, sortOrder: certs.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateSiteSettings(siteSettings); cms.updateCertifications(certs); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Stack Tab */}
      {tab === "stack" && (
        <div className="space-y-4">
          {stack.map((item) => (
            <Section key={item.id} title={item.name || "Nova ferramenta"}>
              <VisibilitySwitch
                label="Mostrar no site"
                description="Oculta esta stack do portfólio sem remover do CMS."
                checked={isItemVisible("stack", item.id)}
                onChange={(visible) => setItemVisibility("stack", item.id, visible)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Nome" value={item.name} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, name: v } : s))} />
                <Input label="Descricao" value={item.description} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, description: v } : s))} />
                <Input label="Cor (hex)" value={item.color} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, color: v } : s))} />
                <Input label="Link" value={item.link} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, link: v } : s))} />
              </div>
              <div className="space-y-3">
                <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Logo
                </label>
                <input
                  id={`stack-logo-${item.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files?.length) {
                      void handleStackLogoUpload(item.id, event.target.files);
                    }
                    event.target.value = "";
                  }}
                />
                <div className="flex flex-col gap-3 rounded-lg p-3" style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: item.color || "#555555", border: "1px solid #1f1f1f" }}
                    >
                      {item.logo ? (
                        <img src={item.logo} alt={item.name || "Logo da stack"} className="h-7 w-7 object-contain" draggable={false} />
                      ) : (
                        <span className="text-[#fafafa]" style={{ fontSize: "14px" }}>
                          {(item.name || "?").charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[#ddd]" style={{ fontSize: "13px" }}>
                        {item.logo ? "Logo atual carregada" : "Nenhuma logo enviada"}
                      </p>
                      <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                        O upload usa o arquivo original, sem compressao automatica.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById(`stack-logo-${item.id}`)?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90"
                      style={{ fontSize: "12px", backgroundColor: "#fafafa" }}
                    >
                      <Upload size={12} /> {item.logo ? "Trocar logo" : "Enviar logo"}
                    </button>
                    {item.logo && (
                      <button
                        type="button"
                        onClick={() => setStack(stack.map((s) => (s.id === item.id ? { ...s, logo: "" } : s)))}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 cursor-pointer hover:text-red-300"
                        style={{ fontSize: "12px", border: "1px solid #2a2a2a" }}
                      >
                        <Trash2 size={12} /> Remover logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setStack(stack.filter(s => s.id !== item.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStack([...stack, { id: Date.now().toString(), name: "", description: "", color: "#555", logo: "", link: "", sortOrder: stack.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateSiteSettings(siteSettings); cms.updateStack(stack); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Awards Tab */}
      {tab === "awards" && (
        <div className="space-y-4">
          {awards.map((award) => (
            <Section key={award.id} title={award.title || "Novo premio"} defaultOpen={false}>
              <VisibilitySwitch
                label="Mostrar no site"
                description="Oculta este prêmio do portfólio sem remover do CMS."
                checked={isItemVisible("awards", award.id)}
                onChange={(visible) => setItemVisibility("awards", award.id, visible)}
              />
              <Input label="Titulo" value={award.title} onChange={(v) => setAwards(awards.map(a => a.id === award.id ? { ...a, title: v } : a))} />
              <Input label="Emissor" value={award.issuer} onChange={(v) => setAwards(awards.map(a => a.id === award.id ? { ...a, issuer: v } : a))} />
              <Input label="Link" value={award.link} onChange={(v) => setAwards(awards.map(a => a.id === award.id ? { ...a, link: v } : a))} />
              <button onClick={() => setAwards(awards.filter(a => a.id !== award.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setAwards([...awards, { id: Date.now().toString(), title: "", issuer: "", link: "", sortOrder: awards.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateSiteSettings(siteSettings); cms.updateAwards(awards); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {tab === "recommendations" && (
        <div className="space-y-4">
          {recs.map((rec) => (
            <Section key={rec.id} title={rec.name || "Nova recomendacao"} defaultOpen={false}>
              <VisibilitySwitch
                label="Mostrar no site"
                description="Oculta esta recomendação do portfólio sem remover do CMS."
                checked={isItemVisible("recommendations", rec.id)}
                onChange={(visible) => setItemVisibility("recommendations", rec.id, visible)}
              />
              <Input label="Nome" value={rec.name} onChange={(v) => setRecs(recs.map(r => r.id === rec.id ? { ...r, name: v } : r))} />
              <Input label="Cargo" value={rec.role} onChange={(v) => setRecs(recs.map(r => r.id === rec.id ? { ...r, role: v } : r))} />
              <TextArea label="Citacao" value={rec.quote} onChange={(v) => setRecs(recs.map(r => r.id === rec.id ? { ...r, quote: v } : r))} rows={4} />
              <button onClick={() => setRecs(recs.filter(r => r.id !== rec.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setRecs([...recs, { id: Date.now().toString(), name: "", role: "", quote: "", sortOrder: recs.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateSiteSettings(siteSettings); cms.updateRecommendations(recs); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      <CMSConfirmDialog
        open={resetOpen}
        onOpenChange={(open) => {
          if (!resetting) setResetOpen(open);
        }}
        title="Restaurar conteudo demo?"
        description="Esta acao restaura o conteudo demo original do sistema e descarta os dados atuais do painel."
        confirmLabel="Restaurar demo"
        cancelLabel="Cancelar"
        busy={resetting}
        onConfirm={() => void handleReset()}
      />
      </div>
    </DndProvider>
  );
}
