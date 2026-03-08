import { useState } from "react";
import { Save, RotateCcw, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useCMS, type ProfileData, type Experience, type Education, type Certification, type StackItem, type Award, type Recommendation } from "./cms-data";
import { toast } from "sonner";

function Input({ label, value, onChange, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      <input
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#444] focus:outline-none resize-none"
        style={{ fontSize: "13px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
      />
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #1e1e1e" }}>
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

type SettingsTab = "profile" | "experience" | "education" | "certifications" | "stack" | "awards" | "recommendations";

export function CMSSettings() {
  const cms = useCMS();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<ProfileData>({ ...cms.data.profile });
  const [experiences, setExperiences] = useState<Experience[]>(cms.data.experiences.map(e => ({ ...e, tasks: [...e.tasks] })));
  const [education, setEducation] = useState<Education[]>(cms.data.education.map(e => ({ ...e })));
  const [certs, setCerts] = useState<Certification[]>(cms.data.certifications.map(c => ({ ...c })));
  const [stack, setStack] = useState<StackItem[]>(cms.data.stack.map(s => ({ ...s })));
  const [awards, setAwards] = useState<Award[]>(cms.data.awards.map(a => ({ ...a })));
  const [recs, setRecs] = useState<Recommendation[]>(cms.data.recommendations.map(r => ({ ...r })));

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "profile", label: "Perfil" },
    { key: "experience", label: "Experiencia" },
    { key: "education", label: "Educacao" },
    { key: "certifications", label: "Certificados" },
    { key: "stack", label: "Stack" },
    { key: "awards", label: "Premios" },
    { key: "recommendations", label: "Recomendacoes" },
  ];

  const saveProfile = () => { cms.updateProfile(profile); toast.success("Perfil salvo!"); };

  const handleReset = () => {
    if (confirm("Resetar todos os dados para o padrao?")) {
      cms.resetData();
      toast.success("Dados resetados!");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#fafafa] mb-1" style={{ fontSize: "22px" }}>Configuracoes</h1>
          <p className="text-[#666]" style={{ fontSize: "13px" }}>Perfil, experiencia e dados do site</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 cursor-pointer transition-colors"
          style={{ fontSize: "12px", border: "1px solid #2a2a2a" }}
        >
          <RotateCcw size={12} /> Resetar tudo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none mb-6">
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
        <div className="space-y-4">
          <Section title="Informacoes pessoais">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nome" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
              <Input label="Cargo" value={profile.role} onChange={(v) => setProfile({ ...profile, role: v })} />
              <Input label="Localizacao" value={profile.location} onChange={(v) => setProfile({ ...profile, location: v })} />
              <Input label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
              <Input label="Telefone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
              <Input label="Foto URL" value={profile.photo} onChange={(v) => setProfile({ ...profile, photo: v })} />
            </div>
          </Section>

          <Section title="Redes sociais">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Twitter" value={profile.twitter} onChange={(v) => setProfile({ ...profile, twitter: v })} />
              <Input label="Instagram" value={profile.instagram} onChange={(v) => setProfile({ ...profile, instagram: v })} />
              <Input label="LinkedIn" value={profile.linkedin} onChange={(v) => setProfile({ ...profile, linkedin: v })} />
            </div>
          </Section>

          <Section title="Disponibilidade">
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={profile.available} onChange={(e) => setProfile({ ...profile, available: e.target.checked })} className="accent-[#00ff3c]" />
              <label className="text-[#aaa]" style={{ fontSize: "13px" }}>Disponivel para trabalho</label>
            </div>
            <Input label="Texto de disponibilidade" value={profile.availableText} onChange={(v) => setProfile({ ...profile, availableText: v })} />
            {!profile.available && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 rounded-lg" style={{ backgroundColor: "#0e0e0e", border: "1px solid #1a1a1a" }}>
                <Input label="Cargo atual" value={profile.currentJobTitle} onChange={(v) => setProfile({ ...profile, currentJobTitle: v })} />
                <Input label="Empresa atual" value={profile.currentCompany} onChange={(v) => setProfile({ ...profile, currentCompany: v })} />
                <div className="sm:col-span-2">
                  <Input label="Site da empresa" value={profile.currentCompanyUrl} onChange={(v) => setProfile({ ...profile, currentCompanyUrl: v })} placeholder="https://..." />
                </div>
              </div>
            )}
          </Section>

          <Section title="Sobre">
            <Input label="Titulo" value={profile.aboutTitle} onChange={(v) => setProfile({ ...profile, aboutTitle: v })} />
            <TextArea label="Paragrafo 1" value={profile.aboutParagraph1} onChange={(v) => setProfile({ ...profile, aboutParagraph1: v })} />
            <TextArea label="Paragrafo 2" value={profile.aboutParagraph2} onChange={(v) => setProfile({ ...profile, aboutParagraph2: v })} />
          </Section>

          <button
            onClick={saveProfile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer transition-colors hover:opacity-90"
            style={{ fontSize: "13px", backgroundColor: "#fafafa" }}
          >
            <Save size={14} /> Salvar Perfil
          </button>
        </div>
      )}

      {/* Experience Tab */}
      {tab === "experience" && (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Section key={exp.id} title={exp.company || "Nova experiencia"} defaultOpen={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Empresa" value={exp.company} onChange={(v) => setExperiences(experiences.map(e => e.id === exp.id ? { ...e, company: v } : e))} />
                <Input label="Cargo" value={exp.role} onChange={(v) => setExperiences(experiences.map(e => e.id === exp.id ? { ...e, role: v } : e))} />
                <Input label="Periodo" value={exp.period} onChange={(v) => setExperiences(experiences.map(e => e.id === exp.id ? { ...e, period: v } : e))} />
                <Input label="Localizacao" value={exp.location} onChange={(v) => setExperiences(experiences.map(e => e.id === exp.id ? { ...e, location: v } : e))} />
              </div>
              <div className="space-y-2">
                <label className="text-[#777] block" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tarefas</label>
                {exp.tasks.map((task, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={task}
                      onChange={(e) => {
                        const newTasks = [...exp.tasks]; newTasks[i] = e.target.value;
                        setExperiences(experiences.map(ex => ex.id === exp.id ? { ...ex, tasks: newTasks } : ex));
                      }}
                      className="flex-1 rounded-lg px-3 py-1.5 text-[#fafafa] focus:outline-none"
                      style={{ fontSize: "12px", backgroundColor: "#141414", border: "1px solid #1e1e1e" }}
                    />
                    <button onClick={() => setExperiences(experiences.map(ex => ex.id === exp.id ? { ...ex, tasks: ex.tasks.filter((_, j) => j !== i) } : ex))} className="text-[#555] hover:text-red-400 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setExperiences(experiences.map(ex => ex.id === exp.id ? { ...ex, tasks: [...ex.tasks, ""] } : ex))} className="text-[#666] hover:text-[#aaa] flex items-center gap-1 cursor-pointer" style={{ fontSize: "11px" }}>
                  <Plus size={11} /> Adicionar tarefa
                </button>
              </div>
              <button onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))} className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setExperiences([...experiences, { id: Date.now().toString(), company: "", role: "", period: "", location: "", tasks: [""] }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer transition-colors" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateExperiences(experiences); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Education Tab */}
      {tab === "education" && (
        <div className="space-y-4">
          {education.map((edu) => (
            <Section key={edu.id} title={edu.degree || "Nova formacao"} defaultOpen={false}>
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
          <div className="flex gap-3">
            <button onClick={() => setEducation([...education, { id: Date.now().toString(), degree: "", university: "", period: "", location: "", description: "" }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateEducation(education); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {tab === "certifications" && (
        <div className="space-y-4">
          {certs.map((cert) => (
            <Section key={cert.id} title={cert.title || "Novo certificado"} defaultOpen={false}>
              <Input label="Titulo" value={cert.title} onChange={(v) => setCerts(certs.map(c => c.id === cert.id ? { ...c, title: v } : c))} />
              <Input label="Emissor" value={cert.issuer} onChange={(v) => setCerts(certs.map(c => c.id === cert.id ? { ...c, issuer: v } : c))} />
              <Input label="Link" value={cert.link} onChange={(v) => setCerts(certs.map(c => c.id === cert.id ? { ...c, link: v } : c))} />
              <button onClick={() => setCerts(certs.filter(c => c.id !== cert.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setCerts([...certs, { id: Date.now().toString(), title: "", issuer: "", link: "" }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateCertifications(certs); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Stack Tab */}
      {tab === "stack" && (
        <div className="space-y-4">
          {stack.map((item) => (
            <Section key={item.id} title={item.name || "Nova ferramenta"} defaultOpen={false}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Nome" value={item.name} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, name: v } : s))} />
                <Input label="Descricao" value={item.description} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, description: v } : s))} />
                <Input label="Cor (hex)" value={item.color} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, color: v } : s))} />
                <Input label="Link" value={item.link} onChange={(v) => setStack(stack.map(s => s.id === item.id ? { ...s, link: v } : s))} />
              </div>
              <button onClick={() => setStack(stack.filter(s => s.id !== item.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setStack([...stack, { id: Date.now().toString(), name: "", description: "", color: "#555", link: "" }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateStack(stack); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
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
              <Input label="Titulo" value={award.title} onChange={(v) => setAwards(awards.map(a => a.id === award.id ? { ...a, title: v } : a))} />
              <Input label="Emissor" value={award.issuer} onChange={(v) => setAwards(awards.map(a => a.id === award.id ? { ...a, issuer: v } : a))} />
              <Input label="Link" value={award.link} onChange={(v) => setAwards(awards.map(a => a.id === award.id ? { ...a, link: v } : a))} />
              <button onClick={() => setAwards(awards.filter(a => a.id !== award.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setAwards([...awards, { id: Date.now().toString(), title: "", issuer: "", link: "" }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateAwards(awards); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
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
              <Input label="Nome" value={rec.name} onChange={(v) => setRecs(recs.map(r => r.id === rec.id ? { ...r, name: v } : r))} />
              <Input label="Cargo" value={rec.role} onChange={(v) => setRecs(recs.map(r => r.id === rec.id ? { ...r, role: v } : r))} />
              <TextArea label="Citacao" value={rec.quote} onChange={(v) => setRecs(recs.map(r => r.id === rec.id ? { ...r, quote: v } : r))} rows={4} />
              <button onClick={() => setRecs(recs.filter(r => r.id !== rec.id))} className="text-red-400 flex items-center gap-1 cursor-pointer" style={{ fontSize: "12px" }}>
                <Trash2 size={12} /> Remover
              </button>
            </Section>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setRecs([...recs, { id: Date.now().toString(), name: "", role: "", quote: "" }])} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-white cursor-pointer" style={{ fontSize: "12px", border: "1px solid #1e1e1e" }}>
              <Plus size={12} /> Adicionar
            </button>
            <button onClick={() => { cms.updateRecommendations(recs); toast.success("Salvo!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#111] cursor-pointer hover:opacity-90" style={{ fontSize: "13px", backgroundColor: "#fafafa" }}>
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
