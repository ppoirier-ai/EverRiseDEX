import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Litepaper',
  subtitle: 'Bitcoin foi pioneiro do dinheiro que não pode ser impresso. EverRise melhorou com preços que não podem ser negociados.',
  sections: [
    {
      id: 'introduction',
      title: 'Introdução',
      content: `Já foi vítima de esquemas de pump and dump? Comprar um ativo no topo, apenas para sofrer uma queda massiva pouco depois? Você vai querer prestar atenção ao EverRise, o ativo inovador que é programaticamente projetado para nunca diminuir de preço. Enquanto Bitcoin foi pioneiro do dinheiro que não pode ser impresso, EverRise melhorou com preços que não podem ser negociados.

Numa era onde os mercados financeiros estão cada vez mais atormentados pela volatilidade de curto prazo, o mundo exige uma nova raça de reserva de valor—uma que protege os investidores das oscilações erráticas dos ativos tradicionais enquanto oferece crescimento consistente e de longo prazo. Reservas tradicionais como ouro ou títulos governamentais oferecem estabilidade mas frequentemente ficam para trás na valorização, enquanto criptomoedas como Bitcoin prometem potencial revolucionário mas expõem os detentores a quedas dramáticas impulsionadas pela especulação e pressões macroeconômicas.

EverRise ($EVER) emerge como uma alternativa inovadora—uma criptomoeda projetada para momentum ascendente perpétuo, oferecendo um paradigma diferente das abordagens tradicionais. Ao eliminar pools de liquidez tradicionais e incorporar um sistema de transações atômicas, EverRise visa fornecer estabilidade e acúmulo de valor de longo prazo para os detentores.`
    },
    {
      id: 'need-for-new-store',
      title: 'A Necessidade de uma Nova Reserva de Valor',
      content: `O cenário financeiro global está evoluindo rapidamente, com inflação corroendo moedas fiat e incertezas geopolíticas amplificando a turbulência do mercado. Investidores buscam ativos que não apenas preservem a riqueza mas a componham ativamente sem a volatilidade que para o coração que caracteriza muitas criptomoedas.

Desde o início dos tempos, todo ativo que a humanidade conheceu se curvou à expansão e negociação. O preço do ouro sobe? Cave mais fundo, inunde o mercado com mais oferta, e veja o valor negociar para baixo. Petróleo, terra, até mesmo bens de escambo antigos—demanda crescente sempre convida mais criação, diluindo o bolo, enquanto preços são falados para cima ou para baixo baseados em caprichos.

Bitcoin quebrou esse ciclo como a primeira moeda verdadeiramente não-imprimível: um limite fixo de 21 milhões, escassez imposta por código que ninguém poderia inflar. Foi um big bang para moeda programável, provando que dinheiro poderia resistir à diluição infinita.

Mas e se levarmos isso adiante? EverRise conceitua o primeiro ativo de preço não-negociável, onde o algoritmo impede qualquer debate descendente—preços não podem ser negociados para baixo, projetados para subir apenas a uma taxa gerenciável.`
    },
    {
      id: 'core-mechanics',
      title: 'Mecânicas Centrais',
      content: `EverRise opera numa fundação que prioriza momentum de preço ascendente. Características-chave incluem:

• Aumento de Preço Perpétuo: Usa um modelo de curva de ligação projetado de tal forma que o preço nunca diminui e só aumenta com cada transação de compra, criando crescimento consistente.

• Comércio Atômico: Transações são processadas imediatamente através de operações atômicas, garantindo execução instantânea sem períodos de espera.

• Integração de Oferta de Reserva: Para compras, tokens são retirados da oferta de reserva (se disponível), com receitas direcionadas para um tesouro externo. A oferta máxima é limitada a 100M tokens, garantindo escassez.

• Utilização do Tesouro: Fundos acumulados no tesouro são mantidos para propósitos estratégicos futuros, com potencial para geração de rendimento e recompras.

Estes elementos se combinam para fomentar um ambiente onde apreciação de preço é inerente e previsível.`
    },
    {
      id: 'pricing-formula',
      title: 'Fórmula de Preço',
      content: `O preço de $EVER é calculado usando um modelo de curva de ligação inspirado em mecanismos de produto constante, aumentado por uma garantia de crescimento mínimo diário.

Definições de Variáveis:
• X: Quantidade USDC no pool de reserva virtual. Valor inicial: 10,000 USDC. Aumenta com compras de reserva.
• Y: Tokens $EVER em reservas. Oferta inicial/máxima: 100,000,000. Diminui com compras de reserva.
• K: Produto constante (K = X * Y), atualizado após transações de reserva.
• SC: Oferta circulante de $EVER, começando em 0 e aumentando com compras.
• P(Y): Preço atual em USDC.

Cálculo de Preço Orgânico:
O preço base é calculado usando a seguinte fórmula:

<img src="/images/organic-price-formula.png" alt="Fórmula de Preço Orgânico" className="mx-auto my-4 max-w-full h-auto" />

Onde:
- O primeiro termo **(X / Y)** fornece uma linha base que sobe à medida que as reservas diminuem
- A somatória adiciona bônus permanentes de compras baseadas em fila
- Cada compra histórica de fila i contribui um bônus escalado por volume e normalizado por preço e oferta circulante

Impulso Mínimo Diário:
Para garantir pelo menos 0.02% de crescimento por período de 24 horas, o sistema aplica um impulso diário se o crescimento orgânico cair abaixo deste limiar:

<img src="/images/daily-boost-formula.png" alt="Fórmula de Impulso Diário" className="mx-auto my-4 max-w-full h-auto" />

Este impulso é temporário e não-composto, reiniciando a cada dia.`
    },
    {
      id: 'affiliate-program',
      title: 'Programa de Marketing de Afiliados',
      content: `EverRise inclui um programa de marketing de afiliados projetado para impulsionar a expansão do ecossistema e recompensar crescimento dirigido pela comunidade.

Características Principais:
• Comissão de 5%: Afiliados recebem 5% de USDC de compras de reserva como comissão direta
• Links de Referência: Qualquer um pode gerar um link de referência único para compartilhar com usuários potenciais
• Pagamento Direto: Comissões são pagas diretamente à conta USDC do afiliado como parte da transação atômica
• Fallback do Tesouro: Se nenhum referenciador for fornecido, a comissão de 5% vai para a carteira do tesouro

O programa destaca o compromisso do EverRise com marketing descentralizado e alinhado com incentivos, promovendo adoção generalizada enquanto compensa promotores por seu papel na construção da rede.`
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      content: `Empresa de Tesouraria de Ativos Digitais

Haverá o lançamento de um Cofre de Staking onde usuários podem bloquear seus tokens EVER com a intenção de que sejam convertidos em ações de uma empresa listada na Nasdaq. A empresa listada na Nasdaq será uma Empresa de Tesouraria de Ativos Digitais (DAT) similar à MicroStrategy.

O Cofre de Staking permitirá que usuários bloqueiem seus tokens EVER e em troca recebam ações da empresa. Esta é uma proposta única que cria uma ponte entre criptomoedas e mercados financeiros tradicionais.

Planos Futuros:
• Formação da Empresa de Tesouraria de Ativos Digitais
• Processo de listagem na Nasdaq
• Desenvolvimento do Cofre de Staking
• Utilidade adicional para a comunidade`
    }
  ]
};

export default function PortugueseLitepaperPage() {
  return (
    <LitepaperLayout
      title={litepaperContent.title}
      sections={litepaperContent.sections}
      languageCode="pt"
    />
  );
}
