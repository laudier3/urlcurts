'use client';

import React from 'react';

const TermosDeUso: React.FC = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-10 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <h1 className="text-3xl font-bold text-center">Termos de Uso</h1>

        <p>
          Ao acessar o site <strong>UrlCurt</strong>, você concorda em cumprir
          estes termos de serviço, todas as leis e regulamentos aplicáveis e
          concorda que é responsável pelo cumprimento de todas as leis locais
          aplicáveis.
        </p>

        <h2 className="text-xl font-semibold">Uso do Serviço</h2>
        <p>
          O UrlCurt oferece um serviço de encurtamento de URLs com foco em
          praticidade e segurança. O uso do serviço deve ser feito de forma
          responsável e de acordo com estes termos.
        </p>

        <h2 className="text-xl font-semibold">Compromisso do Usuário</h2>
        <p>O usuário se compromete a NÃO:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            Utilizar o serviço para atividades ilegais ou contrárias à boa fé e à ordem pública;
          </li>
          <li>
            Difundir conteúdo de natureza racista, xenofóbica, pornografia ilegal,
            apologia ao terrorismo ou violação de direitos humanos;
          </li>
          <li>
            Utilizar o serviço para disseminação de spam, phishing ou links maliciosos;
          </li>
          <li>
            Tentar acessar, modificar ou comprometer sistemas do UrlCurt ou de terceiros;
          </li>
          <li>
            Introduzir vírus, malware ou qualquer código que cause danos à plataforma.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">Privacidade</h2>
        <p>
          A sua privacidade é importante para nós. Coletamos apenas as informações
          necessárias para fornecer nossos serviços, sempre com transparência e
          segurança.
        </p>

        <p>
          Não compartilhamos informações pessoais publicamente ou com terceiros,
          exceto quando exigido por lei.
        </p>

        <h2 className="text-xl font-semibold">Cookies e Publicidade</h2>
        <p>
          Utilizamos cookies para melhorar a experiência do usuário e exibir
          anúncios relevantes através de serviços como o Google AdSense.
        </p>

        <p>
          Esses cookies podem rastrear interesses de forma anônima para exibir
          conteúdos mais relevantes ao usuário.
        </p>

        <h2 className="text-xl font-semibold">Links Externos</h2>
        <p>
          O UrlCurt pode conter links para sites externos. Não temos controle
          sobre o conteúdo e práticas desses sites e não nos responsabilizamos
          por suas políticas.
        </p>

        <h2 className="text-xl font-semibold">Limitação de Responsabilidade</h2>
        <p>
          O UrlCurt não se responsabiliza pelo conteúdo acessado através de links
          encurtados, sendo o usuário totalmente responsável pelo uso dos links
          gerados.
        </p>

        <h2 className="text-xl font-semibold">Suspensão de Serviço</h2>
        <p>
          Reservamo-nos o direito de suspender ou bloquear qualquer usuário que
          viole estes termos, sem aviso prévio.
        </p>

        <h2 className="text-xl font-semibold">Aceitação dos Termos</h2>
        <p>
          O uso contínuo do site será considerado como aceitação destes termos.
          Caso não concorde, recomendamos que não utilize nossos serviços.
        </p>

        <h2 className="text-xl font-semibold">Contato</h2>
        <p>
          Se você tiver dúvidas sobre estes termos, entre em contato através da
          página de contato disponível no site.
        </p>

        <p className="text-sm text-gray-500 text-center mt-10">
          Estes termos são efetivos a partir de 27 de julho de 2025.
        </p>
      </div>
    </div>
  );
};

export default TermosDeUso;