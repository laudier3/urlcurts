"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

interface ClickDetail {
  id: number;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent?: string | null;
  referer?: string | null;
  timestamp: string;
}

interface Props {
  urlId: number;
  isVisible: boolean;
}

export const ClickDetailsPanel: React.FC<Props> = ({ urlId, isVisible }) => {
  const [clicks, setClicks] = useState<ClickDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isVisible || loaded) return;

    const fetchClicks = async () => {
      setLoading(true);
      try {
        const res = await api.get<ClickDetail[]>(
          `/urls/${urlId}/clicks`,
          { withCredentials: true }
        );
        setClicks(res.data);
        setLoaded(true);
      } catch (err) {
        console.error("Erro ao buscar rastreamento de IP:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClicks();
  }, [isVisible, urlId, loaded]);

  const maskIp = (ip: string | null) => {
    if (!ip) return "Desconhecido";
    const parts = ip.split(".");
    if (parts.length !== 4) return ip;
    return `${parts[0]}.${parts[1]}.***.***`; // LGPD friendly
  };

  return (
    <div className="bg-gray-800/70 p-4 rounded-lg mt-4 border border-gray-700">
      <h4 className="text-indigo-400 font-semibold mb-3">
        Rastreamento de IP
      </h4>

      {loading ? (
        <p className="text-gray-400">Carregando visitas...</p>
      ) : clicks.length ? (
        <div className="max-h-72 overflow-y-auto space-y-3">
          {clicks.map(click => (
            <div
              key={click.id}
              className="flex flex-col md:flex-row md:justify-between text-sm border-b border-gray-700 pb-2"
            >
              <span>
                <strong>IP:</strong> {maskIp(click.ip)}
              </span>

              <span>
                {click.city ?? "Cidade desconhecida"} -{" "}
                {click.country ?? "País desconhecido"}
              </span>

              <span>
                {new Date(click.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma visita registrada.</p>
      )}
    </div>
  );
};
