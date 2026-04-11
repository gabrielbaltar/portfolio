import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Save, RotateCcw, ChevronDown, ChevronUp, Plus, Trash2, Upload, GripVertical } from "lucide-react";
import { useCMS, type ProfileData, type Experience, type Education, type Certification, type StackItem, type Award, type Recommendation, type SiteSettings } from "./cms-data";
import {
  clampStackLogoRadius,
  DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT,
  DEFAULT_STACK_LOGO_RADIUS,
  clampExperienceTaskLineHeight,
  getProfileAboutParagraphs,
  normalizePortfolioSectionOrder,
  getPublicContentVisibilityKey,
  syncProfileAboutFields,
  type HomeGalleryItem,
  type PortfolioSectionId,
  type PublicContentVisibilityCollection,
} from "@portfolio/core";
import { toast } from "sonner";
import { CMSConfirmDialog } from "./cms-confirm-dialog";
import { dataProvider } from "./data-provider";
import { LineHeightControl } from "./line-height-control";
import { ImagePositionEditorCompact } from "./image-position-editor";
import { ProfilePhotoCropDialog } from "./profile-photo-crop-dialog";
import { RichTextEditor } from "./rich-text";
import { CMS_SAVE_SHORTCUT_EVENT } from "./cms-shortcuts";
import {
  SelectionProtectedInput,
  SelectionProtectedTextarea,
} from "./text-protection";

function Input({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <SelectionProtectedInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <SelectionProtectedTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  return (
    <div className="flex w-full gap-2">
      <SelectionProtectedInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        wrapperClassName="flex min-w-0 flex-1 items-center gap-2"
        className="min-w-0 w-full flex-1 rounded-lg px-3 py-1.5 text-[#fafafa] focus:outline-none"
        style={{ fontSize: "12px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
      <button onClick={onRemove} className="shrink-0 text-[#555] hover:text-red-400 cursor-pointer">
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
  { id: "gallery", label: "Galeria", description: "Mostra ou oculta a galeria de fotos da home." },
  { id: "awards", label: "Prêmios", description: "Mostra ou oculta a lista de prêmios." },
  { id: "recommendations", label: "Recomendações", description: "Controla os depoimentos e recomendações." },
  { id: "blog", label: "Artigos", description: "Controla a seção de artigos e publicações." },
  { id: "contact", label: "Contato", description: "Mostra ou oculta o bloco final de contato." },
];

type ExperienceDragItem = {
  index: number;
  type: string;
};

type SortableItem = {
  id: string;
  sortOrder: number;
};

type HomeSectionSortableItem = SortableItem & {
  id: PortfolioSectionId;
};

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

function areSectionOrdersEqual(left: PortfolioSectionId[], right: PortfolioSectionId[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function buildHomeSectionSortableItems(order: PortfolioSectionId[] | undefined): HomeSectionSortableItem[] {
  return normalizePortfolioSectionOrder(order).map((id, index) => ({
    id,
    sortOrder: index + 1,
  }));
}

function useSortableCollectionState<T extends SortableItem>(initialItems: T[]) {
  const [items, setItemsState] = useState<T[]>(() => reindexSortableItems(initialItems));
  const orderSnapshotRef = useRef<T[] | null>(null);

  const setItems = (value: T[] | ((current: T[]) => T[])) => {
    setItemsState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      return reindexSortableItems(next);
    });
  };

  const previewMove = (dragIndex: number, hoverIndex: number) => {
    setItemsState((current) => {
      if (!orderSnapshotRef.current) {
        orderSnapshotRef.current = current;
      }

      return reindexSortableItems(moveArrayItem(current, dragIndex, hoverIndex));
    });
  };

  const commitMove = () => {
    orderSnapshotRef.current = null;
    setItemsState((current) => reindexSortableItems(current));
  };

  const cancelMove = () => {
    if (!orderSnapshotRef.current) return;
    setItemsState(reindexSortableItems(orderSnapshotRef.current));
    orderSnapshotRef.current = null;
  };

  return {
    items,
    setItems,
    previewMove,
    commitMove,
    cancelMove,
  };
}

function buildExperienceOverrides(experiences: Experience[]) {
  return Object.fromEntries(
    experiences.map((experience) => [
      experience.id,
      {
        taskLineHeight: clampExperienceTaskLineHeight(
          experience.taskLineHeight ?? DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT,
        ),
      },
    ]),
  );
}

function SortableSectionCard({
  index,
  children,
  dndType,
  dragLabel,
  onMovePreview,
  onCommit,
  onCancel,
}: {
  index: number;
  children: React.ReactNode;
  dndType: string;
  dragLabel: string;
  onMovePreview: (dragIndex: number, hoverIndex: number) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: dndType,
    item: (): ExperienceDragItem => ({ index, type: dndType }),
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
    accept: dndType,
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
            aria-label={`Arrastar ${dragLabel}`}
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

type SettingsTab = "profile" | "gallery" | "experience" | "education" | "certifications" | "stack" | "awards" | "recommendations";

export function CMSSettings() {
  const cms = useCMS();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ ...cms.data.siteSettings });
  const siteSettingsRef = useRef<SiteSettings>({ ...cms.data.siteSettings });
  const [profile, setProfile] = useState<ProfileData>(syncProfileAboutFields({ ...cms.data.profile }));
  const {
    items: homeSections,
    previewMove: previewHomeSectionMove,
    commitMove: commitHomeSectionOrder,
    cancelMove: cancelHomeSectionOrder,
  } = useSortableCollectionState<HomeSectionSortableItem>(
    buildHomeSectionSortableItems(cms.data.siteSettings.homeSectionOrder),
  );
  const {
    items: experiences,
    setItems: setExperiences,
    previewMove: previewExperienceMove,
    commitMove: commitExperienceOrder,
    cancelMove: cancelExperienceOrder,
  } = useSortableCollectionState<Experience>(
    cms.data.experiences.map((experience) => ({ ...experience, tasks: [...experience.tasks] })),
  );
  const {
    items: education,
    setItems: setEducation,
    previewMove: previewEducationMove,
    commitMove: commitEducationOrder,
    cancelMove: cancelEducationOrder,
  } = useSortableCollectionState<Education>(cms.data.education.map((item) => ({ ...item })));
  const {
    items: certs,
    setItems: setCerts,
    previewMove: previewCertificationMove,
    commitMove: commitCertificationOrder,
    cancelMove: cancelCertificationOrder,
  } = useSortableCollectionState<Certification>(cms.data.certifications.map((item) => ({ ...item })));
  const {
    items: stack,
    setItems: setStack,
    previewMove: previewStackMove,
    commitMove: commitStackOrder,
    cancelMove: cancelStackOrder,
  } = useSortableCollectionState<StackItem>(cms.data.stack.map((item) => ({ ...item })));
  const {
    items: awards,
    setItems: setAwards,
    previewMove: previewAwardMove,
    commitMove: commitAwardOrder,
    cancelMove: cancelAwardOrder,
  } = useSortableCollectionState<Award>(cms.data.awards.map((item) => ({ ...item })));
  const {
    items: recs,
    setItems: setRecs,
    previewMove: previewRecommendationMove,
    commitMove: commitRecommendationOrder,
    cancelMove: cancelRecommendationOrder,
  } = useSortableCollectionState<Recommendation>(cms.data.recommendations.map((item) => ({ ...item })));
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [profilePhotoDraft, setProfilePhotoDraft] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    siteSettingsRef.current = siteSettings;
  }, [siteSettings]);

  const updateSiteSettingsState = (updater: (current: SiteSettings) => SiteSettings) => {
    const nextSettings = updater(siteSettingsRef.current);
    siteSettingsRef.current = nextSettings;
    setSiteSettings(nextSettings);
    return nextSettings;
  };

  const persistSiteSettingsState = (
    updater: (current: SiteSettings) => SiteSettings,
    successMessage?: string,
  ) => {
    const nextSettings = updateSiteSettingsState(updater);
    cms.updateSiteSettings(nextSettings);
    if (successMessage) {
      toast.success(successMessage);
    }
    return nextSettings;
  };

  const isSectionVisible = (sectionId: PortfolioSectionId) => siteSettings.sectionVisibility?.[sectionId] !== false;

  const setSectionVisibility = (sectionId: PortfolioSectionId, visible: boolean) => {
    updateSiteSettingsState((current) => {
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
    updateSiteSettingsState((current) => {
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
    { key: "gallery", label: "Galeria" },
    { key: "experience", label: "Experiencia" },
    { key: "education", label: "Educacao" },
    { key: "certifications", label: "Certificados" },
    { key: "stack", label: "Stack" },
    { key: "awards", label: "Premios" },
    { key: "recommendations", label: "Recomendacoes" },
  ];

  const aboutParagraphs = getProfileAboutParagraphs(profile);
  const homeGalleryItems = siteSettings.homeGalleryItems || [];

  useEffect(() => {
    const nextOrder = homeSections.map((item) => item.id);
    if (areSectionOrdersEqual(normalizePortfolioSectionOrder(siteSettingsRef.current.homeSectionOrder), nextOrder)) {
      return;
    }

    updateSiteSettingsState((current) => ({
      ...current,
      homeSectionOrder: nextOrder,
    }));
  }, [homeSections]);

  const updateProfileState = (updater: (current: ProfileData) => ProfileData) => {
    setProfile((current) => syncProfileAboutFields(updater(current)));
  };

  const updateAboutParagraphs = (updater: (current: string[]) => string[]) => {
    updateProfileState((current) => ({
      ...current,
      aboutParagraphs: updater(getProfileAboutParagraphs(current)),
    }));
  };

  const updateHomeGalleryItems = (updater: (current: HomeGalleryItem[]) => HomeGalleryItem[]) => {
    updateSiteSettingsState((current) => ({
      ...current,
      homeGalleryItems: updater(current.homeGalleryItems || []),
    }));
  };

  const persistHomeGalleryItems = (
    updater: (current: HomeGalleryItem[]) => HomeGalleryItem[],
    successMessage?: string,
  ) => {
    persistSiteSettingsState((current) => ({
      ...current,
      homeGalleryItems: updater(current.homeGalleryItems || []),
    }), successMessage);
  };

  const persistHomeSectionOrder = () => {
    const nextOrder = homeSections.map((item) => item.id);
    commitHomeSectionOrder();
    const nextSettings = updateSiteSettingsState((current) => ({
      ...current,
      homeSectionOrder: nextOrder,
    }));
    cms.updateSiteSettings(nextSettings);
    toast.success("Ordem da home publicada.");
  };

  const updateHomeGalleryItem = (itemId: string, updater: (current: HomeGalleryItem) => HomeGalleryItem) => {
    updateHomeGalleryItems((current) => current.map((item) => (item.id === itemId ? updater(item) : item)));
  };

  const moveHomeGalleryItem = (itemId: string, direction: -1 | 1) => {
    persistHomeGalleryItems((current) => {
      const currentIndex = current.findIndex((item) => item.id === itemId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      return moveArrayItem(current, currentIndex, nextIndex);
    });
  };

  const createHomeGalleryItem = (): HomeGalleryItem => ({
    id: `home-gallery-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    subtitle: "",
    image: "",
    imagePosition: "50% 50%",
  });

  const updateExperience = (experienceId: string, updater: (current: Experience) => Experience) => {
    setExperiences((current) =>
      current.map((experience) => (
        experience.id === experienceId ? updater(experience) : experience
      )),
    );
  };

  const saveExperiences = () => {
    const nextExperiences = reindexSortableItems(
      experiences.map((experience) => ({
        ...experience,
        taskLineHeight: clampExperienceTaskLineHeight(
          experience.taskLineHeight ?? DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT,
        ),
      })),
    );
    const nextSiteSettings = {
      ...siteSettings,
      experienceOverrides: buildExperienceOverrides(nextExperiences),
    };

    setExperiences(nextExperiences);
    setSiteSettings(nextSiteSettings);
    cms.updateSiteSettings(nextSiteSettings);
    cms.updateExperiences(nextExperiences);
    toast.success("Salvo!");
  };

  const saveProfile = () => {
    const nextProfile = syncProfileAboutFields(profile);
    setProfile(nextProfile);
    cms.updateSiteSettings(siteSettingsRef.current);
    cms.updateProfile(nextProfile);
    toast.success("Configuracoes salvas!");
  };
  const saveGallery = () => {
    cms.updateSiteSettings(siteSettingsRef.current);
    toast.success("Galeria salva!");
  };
  const saveEducation = () => {
    const nextEducation = reindexSortableItems(education);
    setEducation(nextEducation);
    cms.updateSiteSettings(siteSettings);
    cms.updateEducation(nextEducation);
    toast.success("Salvo!");
  };
  const saveCertifications = () => {
    const nextCertifications = reindexSortableItems(certs);
    setCerts(nextCertifications);
    cms.updateSiteSettings(siteSettings);
    cms.updateCertifications(nextCertifications);
    toast.success("Salvo!");
  };
  const saveStack = () => {
    const nextStack = reindexSortableItems(stack);
    setStack(nextStack);
    cms.updateSiteSettings(siteSettings);
    cms.updateStack(nextStack);
    toast.success("Salvo!");
  };
  const saveAwards = () => {
    const nextAwards = reindexSortableItems(awards);
    setAwards(nextAwards);
    cms.updateSiteSettings(siteSettings);
    cms.updateAwards(nextAwards);
    toast.success("Salvo!");
  };
  const saveRecommendations = () => {
    const nextRecommendations = reindexSortableItems(recs);
    setRecs(nextRecommendations);
    cms.updateSiteSettings(siteSettings);
    cms.updateRecommendations(nextRecommendations);
    toast.success("Salvo!");
  };
  const saveCurrentTab = () => {
    switch (tab) {
      case "profile":
        saveProfile();
        return;
      case "gallery":
        saveGallery();
        return;
      case "experience":
        saveExperiences();
        return;
      case "education":
        saveEducation();
        return;
      case "certifications":
        saveCertifications();
        return;
      case "stack":
        saveStack();
        return;
      case "awards":
        saveAwards();
        return;
      case "recommendations":
        saveRecommendations();
        return;
      default:
        return;
    }
  };

  useEffect(() => {
    const handleShortcutSave = (event: Event) => {
      event.preventDefault();
      saveCurrentTab();
    };

    window.addEventListener(CMS_SAVE_SHORTCUT_EVENT, handleShortcutSave);
    return () => window.removeEventListener(CMS_SAVE_SHORTCUT_EVENT, handleShortcutSave);
  }, [tab, profile, siteSettings, experiences, education, certs, stack, awards, recs]);

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

  const handleProfilePhotoUpload = async (source: FileList | File[] | File) => {
    const file = source instanceof File ? source : Array.from(source)[0];
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida.");
      return false;
    }

    setPhotoUploading(true);
    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      const nextProfile = syncProfileAboutFields({ ...profile, photo: uploaded.url });
      cms.addMediaItem(uploaded);
      cms.updateProfile(nextProfile);
      setProfile(nextProfile);
      toast.success("Foto enviada e salva.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar foto.");
      return false;
    } finally {
      setPhotoUploading(false);
    }
  };

  const queueProfilePhotoForEditing = (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida.");
      return;
    }

    setProfilePhotoDraft(file);
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

  const handleHomeGalleryImageUpload = async (itemId: string, files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem valida para a galeria.");
      return;
    }

    try {
      const uploaded = await dataProvider.uploadMedia(file, "public");
      cms.addMediaItem(uploaded);
      persistHomeGalleryItems((current) => current.map((item) => (
        item.id === itemId
          ? {
            ...item,
            image: uploaded.url,
          }
          : item
      )), "Foto adicionada na galeria e publicada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar foto da galeria.");
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
                      queueProfilePhotoForEditing(event.target.files);
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
                      queueProfilePhotoForEditing(event.dataTransfer.files);
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
                      {photoUploading ? "Enviando foto..." : photoDragOver ? "Solte para ajustar a foto" : "Clique ou arraste para adicionar a foto"}
                    </p>
                    <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                      Antes de salvar, voce pode arrastar, reposicionar e recortar a imagem do avatar.
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

            <Section title="Ordem das seções da home">
              <div className="space-y-3">
                <p className="text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  Arraste para reorganizar a sequência da home. A ordem salva aqui também orienta a navegação pública.
                </p>
                {homeSections.map((section, index) => {
                  const metadata = PORTFOLIO_SECTION_FIELDS.find((item) => item.id === section.id);
                  if (!metadata) return null;

                  return (
                    <SortableSectionCard
                      key={section.id}
                      index={index}
                      dndType="CMS_SETTINGS_HOME_SECTIONS"
                      dragLabel={`seção ${metadata.label}`}
                      onMovePreview={previewHomeSectionMove}
                      onCommit={persistHomeSectionOrder}
                      onCancel={cancelHomeSectionOrder}
                    >
                      <div
                        className="rounded-xl border px-4 py-3"
                        style={{ backgroundColor: "#101010", borderColor: "#1a1a1a" }}
                      >
                        <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19px" }}>
                          {metadata.label}
                        </p>
                        <p className="mt-1 text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                          {metadata.description}
                        </p>
                      </div>
                    </SortableSectionCard>
                  );
                })}
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

      {tab === "gallery" && (
        <div className="space-y-4">
          <Section title="Configuração da seção">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                label="Título em português"
                value={siteSettings.homeGalleryTitlePt || ""}
                onChange={(value) => setSiteSettings({ ...siteSettings, homeGalleryTitlePt: value })}
                placeholder="Galeria"
              />
              <Input
                label="Título em inglês"
                value={siteSettings.homeGalleryTitleEn || ""}
                onChange={(value) => setSiteSettings({ ...siteSettings, homeGalleryTitleEn: value })}
                placeholder="Gallery"
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Introdução em português"
                  value={siteSettings.homeGalleryIntroPt || ""}
                  onChange={(value) => setSiteSettings({ ...siteSettings, homeGalleryIntroPt: value })}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <TextArea
                  label="Introdução em inglês"
                  value={siteSettings.homeGalleryIntroEn || ""}
                  onChange={(value) => setSiteSettings({ ...siteSettings, homeGalleryIntroEn: value })}
                  rows={2}
                />
              </div>
            </div>
          </Section>

          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A galeria só aparece na home quando existe pelo menos uma foto publicada. Uploads, remoções e reordenação estrutural são publicados automaticamente; títulos e textos continuam sendo salvos pelo botão abaixo.
          </div>

          {homeGalleryItems.length === 0 ? (
            <div
              className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed text-center"
              style={{ borderColor: "#242424", backgroundColor: "#101010" }}
            >
              <Upload size={18} className="text-[#555]" />
              <div>
                <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19px" }}>
                  Nenhuma foto adicionada ainda
                </p>
                <p className="text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                  Crie os cards da galeria para mostrar eventos, workshops, talks e bastidores.
                </p>
              </div>
            </div>
          ) : null}

          {homeGalleryItems.map((item, index) => (
            <Section key={item.id} title={item.title || item.subtitle || `Foto ${index + 1}`}>
              <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <input
                    id={`home-gallery-upload-${item.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files?.length) {
                        void handleHomeGalleryImageUpload(item.id, event.target.files);
                      }
                      event.target.value = "";
                    }}
                  />

                  {item.image ? (
                    <ImagePositionEditorCompact
                      src={item.image}
                      alt={item.title || item.subtitle || `Foto ${index + 1}`}
                      position={item.imagePosition || "50% 50%"}
                      onChange={(position) => updateHomeGalleryItem(item.id, (current) => ({ ...current, imagePosition: position }))}
                      onRemove={() => persistHomeGalleryItems((current) => current.map((galleryItem) => (
                        galleryItem.id === item.id
                          ? { ...galleryItem, image: "" }
                          : galleryItem
                      )))}
                      canMoveBackward={index > 0}
                      canMoveForward={index < homeGalleryItems.length - 1}
                      onMoveBackward={() => moveHomeGalleryItem(item.id, -1)}
                      onMoveForward={() => moveHomeGalleryItem(item.id, 1)}
                    />
                  ) : (
                    <label
                      htmlFor={`home-gallery-upload-${item.id}`}
                      className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors hover:border-[#333]"
                      style={{ borderColor: "#242424", backgroundColor: "#101010" }}
                    >
                      <Upload size={18} className="text-[#666]" />
                      <div>
                        <p className="text-[#ddd]" style={{ fontSize: "13px", lineHeight: "19px" }}>
                          Clique para enviar a foto
                        </p>
                        <p className="text-[#666]" style={{ fontSize: "11px", lineHeight: "16px" }}>
                          Você também pode colar uma URL no campo ao lado.
                        </p>
                      </div>
                    </label>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor={`home-gallery-upload-${item.id}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[#888] transition-colors hover:text-white"
                      style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
                    >
                      <Upload size={12} />
                      {item.image ? "Trocar foto" : "Enviar foto"}
                    </label>
                    <button
                      type="button"
                      onClick={() => persistHomeGalleryItems((current) => current.map((galleryItem) => (
                        galleryItem.id === item.id
                          ? { ...galleryItem, image: "" }
                          : galleryItem
                      )))}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#888] transition-colors hover:text-white cursor-pointer"
                      style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
                    >
                      <Trash2 size={12} />
                      Limpar imagem
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Título"
                    value={item.title}
                    onChange={(value) => updateHomeGalleryItem(item.id, (current) => ({ ...current, title: value }))}
                    placeholder="Workshop de discovery"
                  />
                  <TextArea
                    label="Subtítulo"
                    value={item.subtitle}
                    onChange={(value) => updateHomeGalleryItem(item.id, (current) => ({ ...current, subtitle: value }))}
                    rows={3}
                  />
                  <Input
                    label="Imagem URL"
                    value={item.image}
                    onChange={(value) => updateHomeGalleryItem(item.id, (current) => ({ ...current, image: value }))}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => persistHomeGalleryItems((current) => current.filter((galleryItem) => galleryItem.id !== item.id))}
                    className="inline-flex items-center gap-2 text-red-400 transition-colors hover:text-red-300 cursor-pointer"
                    style={{ fontSize: "12px" }}
                  >
                    <Trash2 size={12} />
                    Remover card da galeria
                  </button>
                </div>
              </div>
            </Section>
          ))}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => persistHomeGalleryItems((current) => [...current, createHomeGalleryItem()])}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#888] transition-colors hover:text-white cursor-pointer"
              style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}
            >
              <Plus size={12} />
              Adicionar foto
            </button>
            <button
              type="button"
              onClick={saveGallery}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-[#111] cursor-pointer hover:opacity-90"
              style={{ fontSize: "13px", backgroundColor: "#fafafa" }}
            >
              <Save size={14} />
              Salvar galeria
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
            <SortableSectionCard
              key={exp.id}
              index={index}
              dndType="CMS_SETTINGS_EXPERIENCE"
              dragLabel="experiência"
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
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0e0e0e] px-3 py-2">
                    <span className="text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
                      Ajuste a entrelinha das tarefas exibidas nesta experiência.
                    </span>
                    <LineHeightControl
                      value={clampExperienceTaskLineHeight(exp.taskLineHeight ?? DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT)}
                      onChange={(value) =>
                        updateExperience(exp.id, (current) => ({
                          ...current,
                          taskLineHeight: clampExperienceTaskLineHeight(value),
                        }))
                      }
                    />
                  </div>
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
                  onClick={() => setExperiences((current) => current.filter((experience) => experience.id !== exp.id))}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  style={{ fontSize: "12px" }}
                >
                  <Trash2 size={12} /> Remover
                </button>
              </Section>
            </SortableSectionCard>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setExperiences((current) => [...current, { id: Date.now().toString(), company: "", role: "", period: "", location: "", tasks: [""], taskLineHeight: DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT, sortOrder: current.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer transition-colors" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={saveExperiences} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Education Tab */}
      {tab === "education" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A ordem salva aqui é a mesma exibida no portfólio público.
          </div>
          {education.map((edu, index) => (
            <SortableSectionCard
              key={edu.id}
              index={index}
              dndType="CMS_SETTINGS_EDUCATION"
              dragLabel="formação"
              onMovePreview={previewEducationMove}
              onCommit={commitEducationOrder}
              onCancel={cancelEducationOrder}
            >
            <Section title={edu.degree || "Nova formacao"}>
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
            </SortableSectionCard>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setEducation([...education, { id: Date.now().toString(), degree: "", university: "", period: "", location: "", description: "", sortOrder: education.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={saveEducation} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {tab === "certifications" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A ordem salva aqui é a mesma exibida no portfólio público.
          </div>
          {certs.map((cert, index) => (
            <SortableSectionCard
              key={cert.id}
              index={index}
              dndType="CMS_SETTINGS_CERTIFICATIONS"
              dragLabel="certificado"
              onMovePreview={previewCertificationMove}
              onCommit={commitCertificationOrder}
              onCancel={cancelCertificationOrder}
            >
            <Section title={cert.title || "Novo certificado"}>
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
            </SortableSectionCard>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setCerts([...certs, { id: Date.now().toString(), title: "", issuer: "", link: "", showLink: false, sortOrder: certs.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={saveCertifications} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Stack Tab */}
      {tab === "stack" && (
        <div className="space-y-4">
          <Section title="Título da seção" defaultOpen={false}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Título em português"
                value={siteSettings.stackSectionTitlePt || ""}
                onChange={(value) => setSiteSettings({ ...siteSettings, stackSectionTitlePt: value })}
                placeholder="Ferramentas"
              />
              <Input
                label="Título em inglês"
                value={siteSettings.stackSectionTitleEn || ""}
                onChange={(value) => setSiteSettings({ ...siteSettings, stackSectionTitleEn: value })}
                placeholder="Stacks"
              />
            </div>
          </Section>
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A ordem salva aqui é a mesma exibida no portfólio público.
          </div>
          {stack.map((item, index) => (
            <SortableSectionCard
              key={item.id}
              index={index}
              dndType="CMS_SETTINGS_STACK"
              dragLabel="item de stack"
              onMovePreview={previewStackMove}
              onCommit={commitStackOrder}
              onCancel={cancelStackOrder}
            >
            <Section title={item.name || "Nova ferramenta"}>
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
                        <img
                          src={item.logo}
                          alt={item.name || "Logo da stack"}
                          className="h-7 w-7 object-contain"
                          style={{ borderRadius: `${clampStackLogoRadius(item.logoRadius ?? DEFAULT_STACK_LOGO_RADIUS)}px` }}
                          draggable={false}
                        />
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[#777]" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Radius da logo
                      </label>
                      <span className="text-[#aaa]" style={{ fontSize: "11px" }}>
                        {clampStackLogoRadius(item.logoRadius ?? DEFAULT_STACK_LOGO_RADIUS)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={clampStackLogoRadius(item.logoRadius ?? DEFAULT_STACK_LOGO_RADIUS)}
                      onChange={(event) => {
                        const logoRadius = clampStackLogoRadius(Number(event.target.value));
                        setStack(stack.map((s) => (s.id === item.id ? { ...s, logoRadius } : s)));
                      }}
                      className="w-full accent-[#fafafa]"
                    />
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
            </SortableSectionCard>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setStack([...stack, { id: Date.now().toString(), name: "", description: "", color: "#555", logo: "", logoRadius: DEFAULT_STACK_LOGO_RADIUS, link: "", sortOrder: stack.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={saveStack} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Awards Tab */}
      {tab === "awards" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A ordem salva aqui é a mesma exibida no portfólio público.
          </div>
          {awards.map((award, index) => (
            <SortableSectionCard
              key={award.id}
              index={index}
              dndType="CMS_SETTINGS_AWARDS"
              dragLabel="prêmio"
              onMovePreview={previewAwardMove}
              onCommit={commitAwardOrder}
              onCancel={cancelAwardOrder}
            >
            <Section title={award.title || "Novo premio"} defaultOpen={false}>
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
            </SortableSectionCard>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setAwards([...awards, { id: Date.now().toString(), title: "", issuer: "", link: "", sortOrder: awards.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={saveAwards} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {tab === "recommendations" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-3 text-[#666]" style={{ fontSize: "12px", lineHeight: "18px" }}>
            A ordem salva aqui é a mesma exibida no portfólio público.
          </div>
          {recs.map((rec, index) => (
            <SortableSectionCard
              key={rec.id}
              index={index}
              dndType="CMS_SETTINGS_RECOMMENDATIONS"
              dragLabel="recomendação"
              onMovePreview={previewRecommendationMove}
              onCommit={commitRecommendationOrder}
              onCancel={cancelRecommendationOrder}
            >
            <Section title={rec.name || "Nova recomendacao"} defaultOpen={false}>
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
            </SortableSectionCard>
          ))}
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setRecs([...recs, { id: Date.now().toString(), name: "", role: "", quote: "", sortOrder: recs.length + 1 }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={saveRecommendations} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      <ProfilePhotoCropDialog
        open={Boolean(profilePhotoDraft)}
        file={profilePhotoDraft}
        uploading={photoUploading}
        onOpenChange={(open) => {
          if (open) return;
          setProfilePhotoDraft(null);
        }}
        onConfirm={async (croppedFile) => {
          const uploaded = await handleProfilePhotoUpload(croppedFile);
          if (uploaded) {
            setProfilePhotoDraft(null);
          }
          return uploaded;
        }}
      />

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
