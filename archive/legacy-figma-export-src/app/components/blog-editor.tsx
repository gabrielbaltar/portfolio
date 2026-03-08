import { useState } from "react";
import { type BlogPost, type ContentBlock } from "./cms-data";
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { BlockEditor } from "./block-editor";
import { toast } from "sonner";

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[#ababab] block" style={{ fontSize: "13px" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-[#363636] rounded-lg px-3 py-2 text-[#fafafa] placeholder-[#555] focus:outline-none focus:border-[#555]"
        style={{ fontSize: "14px" }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
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

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
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

export function BlogEditor({
  blogList,
  setBlogList,
  onSave,
}: {
  blogList: BlogPost[];
  setBlogList: (list: BlogPost[]) => void;
  onSave: (list: BlogPost[]) => void;
}) {
  const add = () => {
    setBlogList([...blogList, {
      id: Date.now().toString(),
      title: "",
      slug: "",
      publisher: "",
      date: new Date().toLocaleDateString("pt-BR"),
      image: "",
      description: "",
      content: "",
      contentBlocks: [],
    }]);
  };

  const remove = (id: string) => setBlogList(blogList.filter((b) => b.id !== id));

  const update = (id: string, field: keyof BlogPost, value: any) => {
    setBlogList(blogList.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const save = () => {
    onSave(blogList);
    toast.success("Blog atualizado!");
  };

  return (
    <div className="space-y-4">
      {blogList.map((post) => (
        <Section key={post.id} title={post.title || "Novo Artigo"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Titulo" value={post.title} onChange={(v) => update(post.id, "title", v)} />
            <Input label="Slug (URL)" value={post.slug} onChange={(v) => update(post.id, "slug", v)} />
            <Input label="Publicacao" value={post.publisher} onChange={(v) => update(post.id, "publisher", v)} />
            <Input label="Data" value={post.date} onChange={(v) => update(post.id, "date", v)} />
            <div className="sm:col-span-2">
              <Input label="Imagem URL" value={post.image} onChange={(v) => update(post.id, "image", v)} />
            </div>
          </div>
          <TextArea label="Descricao" value={post.description} onChange={(v) => update(post.id, "description", v)} rows={3} />

          {/* Block editor for rich content */}
          <BlockEditor
            blocks={post.contentBlocks || []}
            onChange={(blocks) => update(post.id, "contentBlocks", blocks)}
          />

          {/* Legacy markdown fallback */}
          <details className="mt-2">
            <summary className="text-[#666] cursor-pointer" style={{ fontSize: "12px" }}>
              Conteudo Markdown (legado)
            </summary>
            <TextArea label="" value={post.content} onChange={(v) => update(post.id, "content", v)} rows={6} />
          </details>

          <button onClick={() => remove(post.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1 mt-2 cursor-pointer" style={{ fontSize: "13px" }}>
            <Trash2 size={13} /> Remover
          </button>
        </Section>
      ))}
      <div className="flex gap-3">
        <button onClick={add} className="border border-[#363636] text-[#ababab] px-3 py-2 rounded-md flex items-center gap-2 hover:border-[#555] hover:text-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Plus size={14} /> Adicionar Artigo
        </button>
        <button onClick={save} className="bg-[#fafafa] text-[#111] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-white transition-colors cursor-pointer" style={{ fontSize: "14px" }}>
          <Save size={14} /> Salvar
        </button>
      </div>
    </div>
  );
}
