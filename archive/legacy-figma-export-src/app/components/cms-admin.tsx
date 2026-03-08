import { useState } from "react";
import { useCMS, type ProfileData, type Project, type Experience, type Education, type Certification, type StackItem, type Award, type Recommendation, type BlogPost, type ContentBlock } from "./cms-data";
import { Link } from "react-router";
import { ArrowLeft, Plus, Trash2, Save, RotateCcw, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { BlockEditor } from "./block-editor";
import { BlogEditor } from "./blog-editor";

type Tab = "profile" | "projects" | "experiences" | "education" | "certifications" | "stack" | "awards" | "recommendations" | "blog";

function Input({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[#ababab] block" style={{ fontSize: "13px" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border border-[#363636] rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#555] focus:outline-none focus:border-[#555]"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[#ababab] block" style={{ fontSize: "13px" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-[#1a1a1a] border border-[#363636] rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#555] focus:outline-none focus:border-[#555] resize-none"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#363636] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-[#1a1a1a] hover:bg-[#222] transition-colors cursor-pointer">
        <span className="text-[#fafafa] font-['Inter',sans-serif]" style={{ fontSize: "14px" }}>{title}</span>
        {open ? <ChevronUp size={16} className="text-[#ababab]" /> : <ChevronDown size={16} className="text-[#ababab]" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

function ProfileEditor() {
  const { data, updateProfile } = useCMS();
  const [profile, setProfile] = useState<ProfileData>({ ...data.profile });

  const save = () => {
    updateProfile(profile);
    toast.success("Perfil atualizado!");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nome" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
        <Input label="Cargo" value={profile.role} onChange={(v) => setProfile({ ...profile, role: v })} />
        <Input label="Localizacao" value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} />
        <Input label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
        <Input label="Telefone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
        <Input label="Foto URL" value={profile.photo} onChange={(v) => setProfile({ ...profile, photo: v })} />
        <Input label="Twitter" value={profile.twitter} onChange={(v) => setProfile({ ...profile, twitter: v })} />
        <Input label="Instagram" value={profile.instagram} onChange={(v) => setProfile({ ...profile, instagram: v })} />
        <Input label="LinkedIn" value={profile.linkedin} onChange={(v) => setProfile({ ...profile, linkedin: v })} />
        <Input label="Texto disponibilidade" value={profile.availableText} onChange={(v) => setProfile({ ...profile, availableText: v })} />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-[#ababab] cursor-pointer" style={{ fontSize: "14px" }}>
          <input type="checkbox" checked={profile.available} onChange={(e) => setProfile({ ...profile, available: e.target.checked })} className="accent-[#00ff3c]" />
          Disponivel para trabalho
        </label>
      </div>
      {!profile.available && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Input label="Cargo atual" value={profile.currentJobTitle} onChange={(v) => setProfile({ ...profile, currentJobTitle: v })} />
          <Input label="Empresa atual" value={profile.currentCompany} onChange={(v) => setProfile({ ...profile, currentCompany: v })} />
          <Input label="Site da empresa" value={profile.currentCompanyUrl} onChange={(v) => setProfile({ ...profile, currentCompanyUrl: v })} placeholder="https://..." />
        </div>
      )}
      <Input label="Titulo da secao" value={profile.aboutTitle} onChange={(v) => setProfile({ ...profile, aboutTitle: v })} />
      <TextArea label="Paragrafo 1" value={profile.aboutParagraph1} onChange={(v) => setProfile({ ...profile, aboutParagraph1: v })} />
      <TextArea label="Paragrafo 2" value={profile.aboutParagraph2} onChange={(v) => setProfile({ ...profile, aboutParagraph2: v })} />
      <button onClick={save} className="bg-[#fafafa] text-[#111] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
        <Save size={14} /> Salvar Perfil
      </button>
    </div>
  );
}

function ProjectsEditor() {
  const { data, updateProjects } = useCMS();
  const [projects, setProjects] = useState<Project[]>([...data.projects]);

  const add = () => {
    setProjects([...projects, {
      id: Date.now().toString(),
      title: "",
      subtitle: "",
      category: "",
      services: "",
      client: "",
      year: new Date().getFullYear().toString(),
      image: "",
      galleryImages: [],
      link: "#",
      slug: "",
      description: "",
      contentBlocks: [],
    }]);
  };

  const remove = (id: string) => setProjects(projects.filter((p) => p.id !== id));
  const update = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const save = () => {
    updateProjects(projects);
    toast.success("Projetos atualizados!");
  };

  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <Section key={p.id} title={p.title || "Novo Projeto"} defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Titulo" value={p.title} onChange={(v) => update(p.id, "title", v)} />
            <Input label="Subtitulo" value={p.subtitle || ""} onChange={(v) => update(p.id, "subtitle", v)} />
            <Input label="Slug (URL)" value={p.slug || ""} onChange={(v) => update(p.id, "slug", v)} />
            <Input label="Categoria" value={p.category} onChange={(v) => update(p.id, "category", v)} />
            <Input label="Servicos" value={p.services || ""} onChange={(v) => update(p.id, "services", v)} />
            <Input label="Cliente" value={p.client || ""} onChange={(v) => update(p.id, "client", v)} />
            <Input label="Ano" value={p.year || ""} onChange={(v) => update(p.id, "year", v)} />
            <Input label="Link externo" value={p.link} onChange={(v) => update(p.id, "link", v)} />
            <Input label="Imagem capa URL" value={p.image} onChange={(v) => update(p.id, "image", v)} />
          </div>
          <TextArea label="Descricao curta" value={p.description || ""} onChange={(v) => update(p.id, "description", v)} rows={3} />

          {/* Gallery images */}
          <div className="space-y-2">
            <label className="text-[#ababab] block" style={{ fontSize: "13px" }}>Imagens da galeria</label>
            {(p.galleryImages || []).map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={img}
                  onChange={(e) => {
                    const newImgs = [...(p.galleryImages || [])];
                    newImgs[i] = e.target.value;
                    update(p.id, "galleryImages", newImgs);
                  }}
                  className="flex-1 bg-[#1a1a1a] border border-[#363636] rounded-lg px-3 py-2 text-[#fafafa] focus:outline-none focus:border-[#555]"
                  style={{ fontSize: "14px" }}
                  placeholder="URL da imagem..."
                />
                <button onClick={() => {
                  update(p.id, "galleryImages", (p.galleryImages || []).filter((_, j) => j !== i));
                }} className="text-red-400 hover:text-red-300 cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => update(p.id, "galleryImages", [...(p.galleryImages || []), ""])}
              className="text-[#ababab] hover:text-white flex items-center gap-1 cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              <Plus size={13} /> Adicionar imagem
            </button>
          </div>

          {/* Block editor */}
          <BlockEditor
            blocks={p.contentBlocks || []}
            onChange={(blocks) => update(p.id, "contentBlocks", blocks)}
          />

          <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1 mt-2 cursor-pointer" style={{ fontSize: "13px" }}>
            <Trash2 size={13} /> Remover
          </button>
        </Section>
      ))}
      <div className="flex gap-3">
        <button onClick={add} className="border border-[#363636] text-[#ababab] px-3 py-2 rounded-md flex items-center gap-2 hover:border-[#555] hover:text-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Plus size={14} /> Adicionar Projeto
        </button>
        <button onClick={save} className="bg-[#fafafa] text-[#111] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Save size={14} /> Salvar
        </button>
      </div>
    </div>
  );
}

function ExperiencesEditor() {
  const { data, updateExperiences } = useCMS();
  const [experiences, setExperiences] = useState<Experience[]>(data.experiences.map((e) => ({ ...e, tasks: [...e.tasks] })));

  const add = () => {
    setExperiences([...experiences, { id: Date.now().toString(), location: "", company: "", period: "", role: "", tasks: [""] }]);
  };

  const remove = (id: string) => setExperiences(experiences.filter((e) => e.id !== id));
  const update = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const save = () => {
    updateExperiences(experiences);
    toast.success("Experiencias atualizadas!");
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp) => (
        <Section key={exp.id} title={exp.company || "Nova Experiencia"} defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Empresa" value={exp.company} onChange={(v) => update(exp.id, "company", v)} />
            <Input label="Cargo" value={exp.role} onChange={(v) => update(exp.id, "role", v)} />
            <Input label="Periodo" value={exp.period} onChange={(v) => update(exp.id, "period", v)} />
            <Input label="Localizacao" value={exp.location} onChange={(v) => update(exp.id, "location", v)} />
          </div>
          <div className="space-y-2">
            <label className="text-[#ababab] block" style={{ fontSize: "13px" }}>Tarefas</label>
            {exp.tasks.map((task, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={task}
                  onChange={(e) => {
                    const newTasks = [...exp.tasks];
                    newTasks[i] = e.target.value;
                    update(exp.id, "tasks", newTasks);
                  }}
                  className="flex-1 bg-[#1a1a1a] border border-[#363636] rounded-lg px-3 py-2 text-[#fafafa] focus:outline-none focus:border-[#555]"
                  style={{ fontSize: "14px" }}
                />
                <button onClick={() => {
                  const newTasks = exp.tasks.filter((_, j) => j !== i);
                  update(exp.id, "tasks", newTasks);
                }} className="text-red-400 hover:text-red-300 cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => update(exp.id, "tasks", [...exp.tasks, ""])} className="text-[#ababab] hover:text-white flex items-center gap-1 cursor-pointer" style={{ fontSize: "13px" }}>
              <Plus size={13} /> Adicionar tarefa
            </button>
          </div>
          <button onClick={() => remove(exp.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer" style={{ fontSize: "13px" }}>
            <Trash2 size={13} /> Remover
          </button>
        </Section>
      ))}
      <div className="flex gap-3">
        <button onClick={add} className="border border-[#363636] text-[#ababab] px-3 py-2 rounded-md flex items-center gap-2 hover:border-[#555] hover:text-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Plus size={14} /> Adicionar
        </button>
        <button onClick={save} className="bg-[#fafafa] text-[#111] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Save size={14} /> Salvar
        </button>
      </div>
    </div>
  );
}

function SimpleListEditor<T extends { id: string }>({
  items,
  setItems,
  fields,
  addLabel,
  onSave,
  createNew,
}: {
  items: T[];
  setItems: (items: T[]) => void;
  fields: { key: keyof T; label: string; type?: "text" | "textarea" }[];
  addLabel: string;
  onSave: (items: T[]) => void;
  createNew: () => T;
}) {
  const add = () => setItems([...items, createNew()]);
  const remove = (id: string) => setItems(items.filter((item) => item.id !== id));
  const update = (id: string, field: keyof T, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const save = () => {
    onSave(items);
    toast.success("Atualizado!");
  };

  const getTitle = (item: T) => {
    const firstStringField = fields.find((f) => f.key !== "id");
    return firstStringField ? String(item[firstStringField.key]) || addLabel : addLabel;
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Section key={item.id} title={getTitle(item)} defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) =>
              field.type === "textarea" ? (
                <div key={String(field.key)} className="sm:col-span-2">
                  <TextArea label={field.label} value={String(item[field.key])} onChange={(v) => update(item.id, field.key, v)} rows={4} />
                </div>
              ) : (
                <Input key={String(field.key)} label={field.label} value={String(item[field.key])} onChange={(v) => update(item.id, field.key, v)} />
              )
            )}
          </div>
          <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1 mt-2 cursor-pointer" style={{ fontSize: "13px" }}>
            <Trash2 size={13} /> Remover
          </button>
        </Section>
      ))}
      <div className="flex gap-3">
        <button onClick={add} className="border border-[#363636] text-[#ababab] px-3 py-2 rounded-md flex items-center gap-2 hover:border-[#555] hover:text-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Plus size={14} /> {addLabel}
        </button>
        <button onClick={save} className="bg-[#fafafa] text-[#111] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Save size={14} /> Salvar
        </button>
      </div>
    </div>
  );
}

export function CMSAdmin() {
  const { data, updateEducation, updateCertifications, updateStack, updateAwards, updateRecommendations, updateBlogPosts, resetData } = useCMS();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [educationList, setEducationList] = useState<Education[]>(data.education.map((e) => ({ ...e })));
  const [certList, setCertList] = useState<Certification[]>(data.certifications.map((c) => ({ ...c })));
  const [stackList, setStackList] = useState<StackItem[]>(data.stack.map((s) => ({ ...s })));
  const [awardsList, setAwardsList] = useState<Award[]>(data.awards.map((a) => ({ ...a })));
  const [recList, setRecList] = useState<Recommendation[]>(data.recommendations.map((r) => ({ ...r })));
  const [blogList, setBlogList] = useState<BlogPost[]>(data.blogPosts.map((b) => ({ ...b })));

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Perfil" },
    { key: "projects", label: "Projetos" },
    { key: "experiences", label: "Experiencia" },
    { key: "education", label: "Educacao" },
    { key: "certifications", label: "Certificados" },
    { key: "stack", label: "Stack" },
    { key: "awards", label: "Premios" },
    { key: "recommendations", label: "Recomendacoes" },
    { key: "blog", label: "Blog" },
  ];

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todos os dados para o padrao?")) {
      resetData();
      toast.success("Dados resetados!");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['Inter',sans-serif]">
      {/* Top bar */}
      <div className="border-b border-[#242424] bg-[#111] sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#ababab] hover:text-white transition-colors flex items-center gap-2" style={{ fontSize: "14px" }}>
              <ArrowLeft size={14} /> Voltar
            </Link>
            <span className="text-[#fafafa] font-['Inter',sans-serif]" style={{ fontSize: "16px" }}>CMS Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[#ababab] hover:text-white transition-colors flex items-center gap-1" style={{ fontSize: "13px" }}>
              <Eye size={13} /> Preview
            </Link>
            <button onClick={handleReset} className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer" style={{ fontSize: "13px" }}>
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key ? "bg-[#fafafa] text-[#111]" : "text-[#ababab] hover:text-white hover:bg-[#1a1a1a]"
              }`}
              style={{ fontSize: "13px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "profile" && <ProfileEditor />}
        {activeTab === "projects" && <ProjectsEditor />}
        {activeTab === "experiences" && <ExperiencesEditor />}
        {activeTab === "education" && (
          <SimpleListEditor
            items={educationList}
            setItems={setEducationList}
            fields={[
              { key: "degree", label: "Grau" },
              { key: "university", label: "Universidade" },
              { key: "location", label: "Localizacao" },
              { key: "period", label: "Periodo" },
              { key: "description", label: "Descricao", type: "textarea" },
            ]}
            addLabel="Adicionar"
            onSave={updateEducation}
            createNew={() => ({ id: Date.now().toString(), location: "", period: "", degree: "", university: "", description: "" })}
          />
        )}
        {activeTab === "certifications" && (
          <SimpleListEditor
            items={certList}
            setItems={setCertList}
            fields={[
              { key: "title", label: "Titulo" },
              { key: "issuer", label: "Emissor" },
              { key: "link", label: "Link" },
            ]}
            addLabel="Adicionar"
            onSave={updateCertifications}
            createNew={() => ({ id: Date.now().toString(), title: "", issuer: "", link: "" })}
          />
        )}
        {activeTab === "stack" && (
          <SimpleListEditor
            items={stackList}
            setItems={setStackList}
            fields={[
              { key: "name", label: "Nome" },
              { key: "description", label: "Descricao" },
              { key: "color", label: "Cor (hex)" },
              { key: "link", label: "Link" },
            ]}
            addLabel="Adicionar"
            onSave={updateStack}
            createNew={() => ({ id: Date.now().toString(), name: "", description: "", color: "#555555", link: "" })}
          />
        )}
        {activeTab === "awards" && (
          <SimpleListEditor
            items={awardsList}
            setItems={setAwardsList}
            fields={[
              { key: "title", label: "Titulo" },
              { key: "issuer", label: "Emissor" },
              { key: "link", label: "Link" },
            ]}
            addLabel="Adicionar"
            onSave={updateAwards}
            createNew={() => ({ id: Date.now().toString(), title: "", issuer: "", link: "" })}
          />
        )}
        {activeTab === "recommendations" && (
          <SimpleListEditor
            items={recList}
            setItems={setRecList}
            fields={[
              { key: "name", label: "Nome" },
              { key: "role", label: "Cargo" },
              { key: "quote", label: "Citacao", type: "textarea" },
            ]}
            addLabel="Adicionar"
            onSave={updateRecommendations}
            createNew={() => ({ id: Date.now().toString(), name: "", role: "", quote: "" })}
          />
        )}
        {activeTab === "blog" && (
          <BlogEditor blogList={blogList} setBlogList={setBlogList} onSave={updateBlogPosts} />
        )}
      </div>
    </div>
  );
}