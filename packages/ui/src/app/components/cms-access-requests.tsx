import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Clock3, Mail, ShieldCheck, ShieldOff } from "lucide-react";
import type { ProjectAccessRequest, ProjectAccessRequestStatus } from "@portfolio/core";
import { toast } from "sonner";
import { useCMS } from "./cms-data";
import { dataProvider } from "./data-provider";

type StatusFilter = "all" | ProjectAccessRequestStatus;

function formatDateTime(value: string) {
  if (!value) return "Agora";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StatusBadge({ status }: { status: ProjectAccessRequestStatus }) {
  const config = {
    pending: { label: "Pendente", bg: "#f59e0b14", text: "#f59e0b" },
    approved: { label: "Aprovado", bg: "#10b98114", text: "#10b981" },
    denied: { label: "Negado", bg: "#ef444414", text: "#ef4444" },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1"
      style={{ backgroundColor: config.bg, color: config.text, fontSize: "11px", lineHeight: "16px" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.text }} />
      {config.label}
    </span>
  );
}

export function CMSAccessRequests() {
  const { data } = useCMS();
  const [requests, setRequests] = useState<ProjectAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    void dataProvider
      .loadProjectAccessRequests()
      .then((items) => {
        if (!active) return;
        setRequests(items);
      })
      .catch((error) => {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitações de acesso.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const projectTitleById = useMemo(
    () =>
      new Map(
        data.projects.map((project) => [
          project.id,
          project.title?.trim() || project.slug?.trim() || "Projeto sem título",
        ]),
      ),
    [data.projects],
  );

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length,
      denied: requests.filter((request) => request.status === "denied").length,
    }),
    [requests],
  );

  const filteredRequests =
    filter === "all" ? requests : requests.filter((request) => request.status === filter);

  const updateStatus = async (requestId: string, status: ProjectAccessRequestStatus) => {
    setProcessingId(requestId);
    try {
      await dataProvider.updateProjectAccessRequestStatus(requestId, status);
      const reviewedAt = new Date().toISOString();
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status,
                reviewedAt,
                updatedAt: reviewedAt,
              }
            : request,
        ),
      );
      toast.success(status === "approved" ? "Solicitação aprovada." : "Solicitação negada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar solicitação.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[#fafafa]" style={{ fontSize: "22px", lineHeight: "33px" }}>
          Solicitações de acesso
        </h1>
        <p style={{ fontSize: "13px", lineHeight: "19.5px", color: "#666" }}>
          Aprove ou negue pedidos para projetos protegidos por senha sem alterar o fluxo atual de senha.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { key: "pending", label: "Pendentes", count: counts.pending },
          { key: "approved", label: "Aprovados", count: counts.approved },
          { key: "denied", label: "Negados", count: counts.denied },
          { key: "all", label: "Todos", count: counts.all },
        ] as Array<{ key: StatusFilter; label: string; count: number }>).map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 transition-colors"
              style={{
                fontSize: "12px",
                lineHeight: "18px",
                borderColor: active ? "#3a3a3a" : "#242424",
                backgroundColor: active ? "#181818" : "#111111",
                color: active ? "#fafafa" : "#888",
              }}
            >
              <span>{item.label}</span>
              <span
                className="rounded-full px-1.5 py-0.5"
                style={{
                  backgroundColor: active ? "#242424" : "#1a1a1a",
                  color: active ? "#fafafa" : "#777",
                  fontSize: "11px",
                  lineHeight: "16px",
                }}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div
          className="flex h-[220px] items-center justify-center rounded-[14px] border"
          style={{ backgroundColor: "#141414", borderColor: "#1e1e1e", color: "#666" }}
        >
          Carregando solicitações...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div
          className="flex h-[220px] flex-col items-center justify-center gap-3 rounded-[14px] border text-center"
          style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
        >
          <Clock3 size={28} className="text-[#444]" />
          <div>
            <p className="text-[#fafafa]" style={{ fontSize: "14px", lineHeight: "21px" }}>
              Nenhuma solicitação nesta visualização
            </p>
            <p style={{ fontSize: "12px", lineHeight: "18px", color: "#666" }}>
              Assim que alguém pedir acesso a um projeto protegido, ela aparecerá aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const projectTitle = projectTitleById.get(request.projectId) || "Projeto removido";
            const isBusy = processingId === request.id;

            return (
              <div
                key={request.id}
                className="rounded-[16px] border p-5"
                style={{ backgroundColor: "#141414", borderColor: "#1e1e1e" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={request.status} />
                      <span style={{ fontSize: "12px", lineHeight: "18px", color: "#666" }}>
                        {formatDateTime(request.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-[#fafafa]" style={{ fontSize: "16px", lineHeight: "24px" }}>
                      {projectTitle}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2" style={{ fontSize: "13px", lineHeight: "19.5px", color: "#aaa" }}>
                      <span>{request.requesterName}</span>
                      <a
                        href={`mailto:${request.requesterEmail}`}
                        className="inline-flex items-center gap-1.5 hover:text-white"
                      >
                        <Mail size={13} />
                        {request.requesterEmail}
                      </a>
                    </div>
                  </div>

                  <Link
                    to={`/content/projects/${request.projectId}/edit`}
                    className="inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 transition-colors hover:bg-[#181818]"
                    style={{ borderColor: "#242424", color: "#aaa", fontSize: "12px", lineHeight: "18px" }}
                  >
                    Abrir projeto
                  </Link>
                </div>

                <div
                  className="mt-4 rounded-[12px] border p-4"
                  style={{ backgroundColor: "#101010", borderColor: "#1d1d1d" }}
                >
                  <p className="mb-2 uppercase tracking-[0.08em]" style={{ fontSize: "10px", lineHeight: "15px", color: "#555" }}>
                    Mensagem
                  </p>
                  <p className="whitespace-pre-wrap text-[#d6d6d6]" style={{ fontSize: "13px", lineHeight: "21px" }}>
                    {request.requesterMessage}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void updateStatus(request.id, "approved")}
                    disabled={isBusy || request.status === "approved"}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "#10b98114", color: "#10b981", fontSize: "12px", lineHeight: "18px" }}
                  >
                    <ShieldCheck size={14} />
                    Aprovar acesso
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateStatus(request.id, "denied")}
                    disabled={isBusy || request.status === "denied"}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "#ef444414", color: "#ef4444", fontSize: "12px", lineHeight: "18px" }}
                  >
                    <ShieldOff size={14} />
                    Negar acesso
                  </button>
                  {request.reviewedAt ? (
                    <span style={{ fontSize: "11px", lineHeight: "16px", color: "#666" }}>
                      Revisado em {formatDateTime(request.reviewedAt)}
                    </span>
                  ) : null}
                  {isBusy ? (
                    <span style={{ fontSize: "11px", lineHeight: "16px", color: "#666" }}>
                      Salvando decisão...
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
