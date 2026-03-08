import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { dataProvider } from "./data-provider";

export function CMSLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await dataProvider.signIn(email, password);
      setLoading(false);
      if (result.success) {
        const nextPath = (location.state as { from?: string } | null)?.from || "/dashboard";
        navigate(nextPath, { replace: true });
      } else {
        setError(result.error || "Credenciais invalidas");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Erro ao fazer login");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-['Inter',sans-serif] px-4"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-[14px] mb-4"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #242424" }}
          >
            <Lock size={20} className="text-[#fafafa]" />
          </div>
          <h1 className="text-[#fafafa] mb-1" style={{ fontSize: "20px", lineHeight: "30px" }}>
            CMS Admin
          </h1>
          <p className="text-[#666]" style={{ fontSize: "13px", lineHeight: "19.5px" }}>
            Acesse o painel de gerenciamento
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[#888] block" style={{ fontSize: "12px", lineHeight: "18px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@portfolio.com"
              className="w-full rounded-[10px] px-3.5 py-2.5 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
              style={{
                fontSize: "14px",
                backgroundColor: "#141414",
                border: "1px solid #242424",
                height: "43px",
              }}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#888] block" style={{ fontSize: "12px", lineHeight: "18px" }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[10px] px-3.5 py-2.5 pr-10 text-[#fafafa] placeholder-[#444] focus:outline-none transition-colors"
                style={{
                  fontSize: "14px",
                  backgroundColor: "#141414",
                  border: "1px solid #242424",
                  height: "43px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] cursor-pointer"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400" style={{ fontSize: "13px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-[10px] py-2.5 text-[#111] cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              fontSize: "14px",
              backgroundColor: "#fafafa",
              height: "41px",
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[#444]" style={{ fontSize: "11px", lineHeight: "16.5px" }}>
          Use suas credenciais reais do Supabase
        </p>
      </div>
    </div>
  );
}
