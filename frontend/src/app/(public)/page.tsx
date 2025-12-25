"use client";

import React, { useRef, useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";

import ConsentFooter from "./pages/ConsentFooter";
import FeaturesSection from "./pages/FeaturesSection";
import FeaturesSection1 from "./pages/FeaturesSection1";
import FeaturesSection2 from "./pages/FeaturesSection2";
import AboutSection from "./pages/AboutSection";
import ArticlesSection from "./pages/ArticlesSection";
import { FloatingShare } from "./components/FloatingShare";

const articlesMock = [
  {
    id: 1,
    title: "Por que usar encurtadores de URL?",
    summary: "URLs curtas aumentam conversão e confiança.",
    url: "https://blog.hubspot.com/marketing/",
  },
  {
    id: 2,
    title: "Benefícios do encurtamento de URLs",
    summary: "Links curtos melhoram métricas.",
    url: "https://neilpatel.com/blog/",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    router.push("/login");
  };

   const handleSobre = () => {
    setIsLoggedIn(true);
    router.push("/sobre");
  };

   const handlePolitica = () => {
    setIsLoggedIn(true);
    router.push("/politica");
  };

  const handleRegister = () => router.push("/register");
  const handleLogout = () => {
    setIsLoggedIn(false);
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  /* 🌌 CANVAS (MANTIDO) */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
    }));

    const animate = () => {
      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        s.z -= 2;
        if (s.z <= 0) s.z = canvas.width;

        const k = 128 / s.z;
        const px = s.x * k + canvas.width / 2;
        const py = s.y * k + canvas.height / 2;

        if (px >= 0 && py >= 0 && px <= canvas.width && py <= canvas.height) {
          ctx.fillStyle = "rgba(139,92,246,.8)";
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>UrlCurt — Encurte Links</title>
      </Head>

      {/* NAVBAR (estilo imagem) */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => router.push("/")}>
            URLCURT
          </div>
            
          <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            {!isLoggedIn ? (
              <>
                <button onClick={handlePolitica}>Politica</button>
                <button onClick={handleSobre}>Sobre</button>
                <button onClick={handleLogin}>Entrar</button>
                <button className="cta" onClick={handleRegister}>
                  Registre-se
                </button>
              </>
            ) : (
              <button onClick={() => router.push("/dashboard")}>
                Dashboard
              </button>
            )}

          </nav>

          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      <FloatingShare />

      {/* HERO (IGUAL À IMAGEM) */}
      <main className="home">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-left">
              <h1>
                Encurte Links Longos <br />
                e Monitore seus Cliques!
              </h1>

              <p>
                Transforme URLs extensas em links curtos e obtenha estatísticas
                detalhadas em segundos.
              </p>

              <div className="shortener-box">
                <input placeholder="Cole seu link aqui..." />
                <button onClick={handleRegister}>Encurtar URL</button>
              </div>

              <span className="login-text">
                Já tem uma conta? <b onClick={handleLogin}>Entrar</b>
              </span>
              <a
              href="https://hilltopads.com/pt?ref=329233"
              target="_blank"
              rel="noopener noreferrer"
              className="ad-banner"
            >
              <img
                src="https://static.hilltopads.com/other/banners/pub/huge_income/728x90.gif"
                alt="Anúncio HilltopAds"
              />
            </a>
            </div>

            <div className="hero-right">
              <div className="dashboard-card">
                <div className="browser-bar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="url-bar">urlcurt.com/campanha</div>

                <div className="stats-row">
                  <div>
                    <strong>5.280 </strong>
                    <span>Cliques</span>
                  </div>
                  <div>
                    <strong>75% </strong>
                    <span>Via Mobile</span>
                  </div>
                </div>

                <div className="chart-box">📈</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-strip">
          <div className="feature">
            🔗
            <h4>Encurtamento Fácil</h4>
            <p>Crie URLs curtas em um clique.</p>
          </div>

          <div className="feature">
            📊
            <h4>Estatísticas Avançadas</h4>
            <p>Analise o desempenho dos seus links.</p>
          </div>

          <div className="feature">
            🔒
            <h4>Links Seguros</h4>
            <p>Proteção e privacidade garantida.</p>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="how-it-works">
          <h2>Como Funciona</h2>
          <p>Encurte seu link em 3 passos simples:</p>

          <div className="steps">
            <div className="step">1️⃣ Cole seu link longo</div>
            <div className="step">2️⃣ Clique em “Encurtar”</div>
            <div className="step">3️⃣ Compartilhe e acompanhe</div>
          </div>

          <button className="cta-main" onClick={handleRegister}>
            Comece Agora
          </button>
        </section>
        <div>
          <a
              href="https://hilltopads.com/pt?ref=329233"
              target="_blank"
              rel="noopener noreferrer"
            >
            <img
              src="//static.hilltopads.com/other/banners/pub/get_high_ecpm/728x90.gif?v=1766584030"
              alt="Anúncio HilltopAds"
              width={728}
              height={90}
              style={{display: "flex", margin: "auto"}}
            />
          </a>
        </div>
        {/* NÚMEROS */}
        <section className="numbers">
          <h2>Números que Impressionam</h2>

          <div className="numbers-grid">
            <div>
              <strong>1.2M+ </strong>
              <span>Links Encurtados</span>
            </div>
            <div>
              <strong>85K+ </strong>
              <span>Usuários Satisfeitos</span>
            </div>
            <div>
              <strong>100% </strong>
              <span>Segurança Garantida</span>
            </div>
          </div>
        </section>
      </main>

      {/* SEÇÕES ORIGINAIS */}
      <FeaturesSection />
      <FeaturesSection1 />
      <FeaturesSection2 />
      <AboutSection />
      <ArticlesSection articles={articlesMock} />
      <ConsentFooter />

      <footer className="footer">
        © {new Date().getFullYear()} UrlCurt
      </footer>

      <canvas ref={canvasRef} className="background" />

      {/* CSS */}
      <style jsx>{`
        body {
          margin: 0;
          font-family: Inter, sans-serif;
        }

        .navbar {
          position: fixed;
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,.08);
          z-index: 10;
        }

        .nav-container {
          max-width: 1200px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
        }

        .logo {
          font-weight: 800;
          color: #2563eb;
          cursor: pointer;
        }

        /* Botões normais do menu */
          .nav-links button {
            position: relative;
            background: none;
            border: none;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            color: #0b1020;
            padding: 0.4rem 0;
            margin-left: 1rem;
            letter-spacing: 0.3px;

            transition: color 0.25s ease, transform 0.25s ease;
          }

          /* underline animado */
          .nav-links button::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            transition: width 0.3s ease;
          }

          .nav-links button:hover {
            color: #2563eb;
            transform: translateY(-1px);
          }

          .nav-links button:hover::after {
            width: 100%;
          }

          /* CTA – Registre-se */
          .nav-links .cta {
            background: linear-gradient(135deg, #f97316, #fb923c);
            color: white;
            padding: 0.45rem 1.1rem;
            border-radius: 6px;
            margin-left: 1rem;

            box-shadow: 0 6px 18px rgba(249,115,22,.35);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          /* remove underline do CTA */
          .nav-links .cta::after {
            display: none;
          }

          .nav-links .cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(249,115,22,.45);
          }
        .cta {
          background: #f97316;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        .hamburger {
          display: none;
        }

        .hero {
          padding-top: 120px;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          color: white;
        }

        .hero-container {
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          padding: 3rem 2rem;
        }

        .shortener {
          display: flex;
          margin-top: 1rem;
        }

        .shortener input {
          flex: 1;
          padding: 0.8rem;
          border-radius: 6px 0 0 6px;
          border: none;
        }

        .shortener button {
          background: #f97316;
          border: none;
          color: white;
          padding: 0 1.2rem;
          border-radius: 0 6px 6px 0;
        }

        .hero-card {
          background: white;
          color: #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,.25);
        }

        .stats {
          display: flex;
          justify-content: space-between;
          margin: 1rem 0;
        }

        .chart {
          background: #e0f2fe;
          height: 120px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
        }

        .background {
          position: fixed;
          inset: 0;
          z-index: -1;
        }

        @media (max-width: 768px) {

          /* Navbar */
          .nav-container {
            padding: 0.75rem 1rem;
          }

          .nav-links {
            position: absolute;
            top: 64px; /* altura da navbar */
            left: 0;
            width: 100%;
            background: white;

            display: none;
            flex-direction: column;
            align-items: center;

            padding: 1rem 0;
            box-shadow: 0 10px 20px rgba(0,0,0,.1);
            z-index: 9;
          }

          .nav-links.open {
            display: flex;
          }

          .nav-links button {
            margin: 0.5rem 0;
            font-size: 1rem;
          }

          .hamburger {
            display: block;
            font-size: 1.6rem;
            background: none;
            border: none;
            cursor: pointer;
            color: gray;
          }

          .hamburger {
            display: block;
            font-size: 1.5rem;
            cursor: pointer;
          }

          /* Hero */
          .hero-section {
            padding: 4rem 1rem;
            text-align: center;
          }

          .hero-left h1 {
            font-size: 2rem;
          }

          .hero-left p {
            font-size: 1rem;
          }

          /* Grids */
          .hero-grid,
          .features-strip,
          .steps,
          .numbers-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          /* Shortener */
          .shortener,
          .shortener-box {
            flex-direction: column;
          }

          .shortener input,
          .shortener-box input {
            border-radius: 6px;
          }

          .shortener button,
          .shortener-box button {
            width: 100%;
            padding: 0.9rem;
            border-radius: 6px;
            margin-top: 0.5rem;
          }

          /* Cards */
          .hero-card,
          .dashboard-card {
            padding: 1rem;
          }

          /* Chart / ícone */
          .chart-box {
            height: 90px;
            font-size: 70px;
          }

          /* Stats */
          .stats,
          .stats-row {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          /* Features */
          .feature {
            padding: 1.5rem 1rem;
          }

          /* Footer */
          .footer {
            font-size: 0.9rem;
            padding: 1.5rem 1rem;
          }
        }
        .home {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }

        .hero-section {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          padding: 6rem 2rem;
          color: white;
        }

        .hero-grid {
          max-width: 1200px;
          margin: auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3rem;
        }

        .hero-left h1 {
          font-size: 2.8rem;
          font-weight: 800;
        }

        .hero-left p {
          margin: 1rem 0 2rem;
          font-size: 1.1rem;
        }

        .shortener-box {
          display: flex;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          color: black;
        }

        .shortener-box input {
          flex: 1;
          padding: 1rem;
          border: none;
        }

        .shortener-box button {
          background: #f97316;
          color: white;
          padding: 0 1.5rem;
          border: none;
          font-weight: 600;
        }

        .dashboard-card {
          background: white;
          color: #1e293b;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 30px 60px rgba(0,0,0,.25);
        }

        .browser-bar span {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #cbd5e1;
          border-radius: 50%;
          margin-right: 5px;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          margin: 1rem 0;
        }

        .chart-box {
          height: 120px;
          background: #e0f2fe;
          border-radius: 8px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 100px;
          line-height: 1; /* remove espaço extra do emoji */
        }


        .features-strip {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          max-width: 1200px;
          margin: -60px auto 0;
          background: #e0f2fe;
          color: black;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.1);
        }

        .feature {
          padding: 2rem;
          text-align: center;
          color: rgb(10, 10, 10);
          margin: 1px;
          p {
            color: rgb(10, 10, 10)
          }
        }

        .how-it-works,
        .numbers {
          text-align: center;
          padding: 4rem 2rem;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          max-width: 900px;
          margin: 2rem auto;
          gap: 1rem;
        }

        .step {
          background: #e0f2fe;
          color: black;
          padding: 1.5rem;
          border-radius: 10px;
        }

        .cta-main {
          background: #f97316;
          color: white;
          padding: 1rem 2rem;
          border-radius: 8px;
          border: none;
          font-size: 1.1rem;
        }

        .numbers-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          max-width: 900px;
          margin: auto;
          gap: 1rem;
          color: rgb(10, 10, 10);
        }

        .numbers-grid div {
          background: white;
          padding: 2rem;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .hero-grid,
          .features-strip,
          .steps,
          .numbers-grid {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </>
  );
}
