import { useEffect, useState } from "react";
import { usersApi } from "../api/users";
import { useHealth } from "../hooks/useHealth";
import type { PagedResult, User } from "../types";
import { errorMessage, formatDate } from "../utils";
import { googleLoginUrl } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

export default function UsersPage() {
  const health = useHealth();
  const auth = useAuth();
  const authenticated = auth.status === "authenticated";
  const authFailed =
    new URLSearchParams(window.location.search).get("auth") === "failed";

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<PagedResult<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    setLoading(true);
    usersApi
      .list(page, pageSize)
      .then((d) => {
        if (cancelled) return;
        if (d.items.length === 0 && page > 1) {
          setPage(Math.max(1, d.totalPages));
          return;
        }
        setData(d);
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(errorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, authenticated]);

  const items = data?.items ?? [];
  const from =
    !data || data.totalCount === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const to = data ? (data.page - 1) * data.pageSize + data.items.length : 0;

  return (
    <main className="wrap">
      <header className="top">
        <h1>Utilizatori</h1>
        <div className="top-right">
          <span className="health" data-state={health}>
            <span className="dot" />
            {health === "up"
              ? "Server activ"
              : health === "down"
                ? "Server indisponibil"
                : "Se verifică serverul"}
          </span>
          {authenticated ? (
            <>
              <span className="whoami">
                {auth.user.name ?? auth.user.email}
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setData(null);
                  void auth.logout();
                }}
              >
                Deconectare
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn login-trigger"
              onClick={() => setLoginOpen(true)}
            >
              Logare
            </button>
          )}
        </div>
      </header>
      {authFailed && !authenticated && (
        <div className="load-error">
          Autentificarea cu Google a eșuat sau nu ai acces. Încearcă din nou.
        </div>
      )}
      {auth.status === "anonymous" && (
        <div className="empty">Autentifică-te pentru a vedea utilizatorii.</div>
      )}
      <div className="table-wrap">
        <table aria-busy={loading}>
          <thead>
            <tr>
              <th className="id">ID</th>
              <th>Nume</th>
              <th>Email</th>
              <th className="num">Vârstă</th>
              <th>Adăugat la</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td className="id">{u.id}</td>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.email}</td>
                <td className="num">{u.age ?? "–"}</td>
                <td>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {error && (
          <div className="load-error">
            Nu am putut încărca utilizatorii. {error}
          </div>
        )}
        {!error && data && items.length === 0 && (
          <div className="empty">Nu există utilizatori.</div>
        )}
      </div>

      <div className="pager">
        <span aria-live="polite">
          {data ? `${from}–${to} din ${data.totalCount}` : ""}
        </span>
        <div className="pager-controls">
          <label htmlFor="pageSize" className="hint" style={{ margin: 0 }}>
            Pe pagină
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            disabled={!data?.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
          >
            Înapoi
          </button>
          <span>
            {data
              ? `Pagina ${data.page} din ${Math.max(1, data.totalPages)}`
              : ""}
          </span>
          <button
            type="button"
            className="btn"
            disabled={!data?.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Înainte
          </button>
        </div>
      </div>

      {loginOpen && (
        <div className="login-overlay">
          <section
            className="login-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
          >
            <div className="login-heading">
              <h2 id="login-title">Logare</h2>
              <button
                type="button"
                className="login-close"
                aria-label="Închide"
                onClick={() => setLoginOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="login-fields">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="nume@exemplu.ro"
              />
              <label htmlFor="login-password">Parolă</label>
              <input id="login-password" type="password" placeholder="Parola" />
              <button type="button" className="btn primary login-submit">
                Logare
              </button>
              <div className="login-divider" aria-hidden="true">
                sau
              </div>
              <button
                type="button"
                className="btn google-login"
                onClick={() => {
                  const url = googleLoginUrl();
                  console.log(url);
                  window.location.href = url;
                }}
              >
                <span className="google-mark" aria-hidden="true">
                  G
                </span>
                Continuă cu Google
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
