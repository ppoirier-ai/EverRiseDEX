import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Libro Blanco',
  subtitle: 'Bitcoin pionero en dinero que no se puede imprimir. EverRise mejoró con precios que no se pueden regatear.',
  sections: [
    {
      id: 'introduction',
      title: 'Introducción',
      content: `¿Alguna vez has sido víctima de esquemas de bombeo y descarga? ¿Comprar un activo en la cima, solo para sufrir una caída masiva poco después? Querrás prestar atención a EverRise, el activo innovador que está programáticamente diseñado para nunca disminuir de precio. Mientras que Bitcoin fue pionero en dinero que no se puede imprimir, EverRise mejoró con precios que no se pueden regatear.

En una era donde los mercados financieros están cada vez más plagados de volatilidad a corto plazo, el mundo demanda una nueva clase de reserva de valor: una que proteja a los inversores de los vaivenes erráticos de los activos tradicionales mientras entrega crecimiento constante a largo plazo. Las reservas tradicionales como el oro o los bonos gubernamentales ofrecen estabilidad pero a menudo se quedan atrás en apreciación, mientras que las criptomonedas como Bitcoin prometen un potencial revolucionario pero exponen a los tenedores a caídas dramáticas impulsadas por la especulación y las presiones macroeconómicas.

EverRise ($EVER) emerge como una alternativa innovadora: una criptomoneda diseñada para impulso ascendente perpetuo, ofreciendo un paradigma diferente de los enfoques tradicionales. Al eliminar los pools de liquidez tradicionales e incorporar un sistema de transacciones atómicas, EverRise tiene como objetivo proporcionar estabilidad y acumulación de valor a largo plazo para los tenedores.`
    },
    {
      id: 'need-for-new-store',
      title: 'La Necesidad de una Nueva Reserva de Valor',
      content: `El panorama financiero global está evolucionando rápidamente, con la inflación erosionando las monedas fiat y las incertidumbres geopolíticas amplificando la turbulencia del mercado. Los inversores buscan activos que no solo preserven la riqueza sino que la compongan activamente sin la volatilidad que detiene el corazón que caracteriza a muchas criptomonedas.

Desde el principio de los tiempos, cada activo que la humanidad ha conocido se ha inclinado ante la expansión y la negociación. ¿El precio del oro se dispara? Cava más profundo, inunda el mercado con más oferta, y observa cómo el valor regatea hacia abajo. Petróleo, tierra, incluso bienes de trueque antiguos: la demanda creciente siempre invita a más creación, diluyendo el pastel, mientras que los precios se hablan hacia arriba o hacia abajo basándose en caprichos.

Bitcoin rompió ese ciclo como el primer dinero verdaderamente no imprimible: un límite fijo de 21 millones, escasez forzada por código que nadie podría inflar. Fue una gran explosión para la moneda programable, probando que el dinero podría resistir la dilución infinita.

Pero, ¿y si lo lleváramos más lejos? EverRise conceptualiza el primer activo de precio no regateable, donde el algoritmo previene cualquier debate descendente: los precios no se pueden negociar hacia abajo, diseñados para solo subir a un ritmo manejable.`
    },
    {
      id: 'core-mechanics',
      title: 'Mecánicas Centrales',
      content: `EverRise opera sobre una base que prioriza el impulso de precio ascendente. Las características clave incluyen:

• Aumento de Precio Perpetuo: Utiliza un modelo de curva de enlace diseñado de tal manera que el precio nunca disminuye y solo aumenta con cada transacción de compra, creando crecimiento constante.

• Comercio Atómico: Las transacciones se procesan inmediatamente a través de operaciones atómicas, asegurando ejecución instantánea sin períodos de espera.

• Integración de Suministro de Reserva: Para las compras, los tokens se extraen del suministro de reserva (si está disponible), con los ingresos dirigidos a una tesorería externa. El suministro máximo está limitado a 100M tokens, asegurando escasez.

• Utilización de Tesorería: Los fondos acumulados en la tesorería se mantienen para propósitos estratégicos futuros, con el potencial de generación de rendimiento y recompras.

Estos elementos se combinan para fomentar un ambiente donde la apreciación del precio es inherente y predecible.`
    },
    {
      id: 'pricing-formula',
      title: 'Fórmula de Precios',
      content: `El precio de $EVER se calcula usando un modelo de curva de enlace inspirado en mecanismos de producto constante, aumentado por una garantía de crecimiento mínimo diario.

Definiciones de Variables:
• X: Cantidad de USDC en el pool de reserva virtual. Valor inicial: 10,000 USDC. Aumenta con las compras de reserva.
• Y: Tokens $EVER en reservas. Suministro inicial/máximo: 100,000,000. Disminuye en las compras de reserva.
• K: Producto constante (K = X * Y), actualizado después de las transacciones de reserva.
• SC: Suministro circulante de $EVER, comenzando en 0 y aumentando con las compras.
• P(Y): Precio actual en USDC.

Cálculo de Precio Orgánico:
El precio base se calcula usando la siguiente fórmula:

![Fórmula de Precio Orgánico](/images/organic-price-formula.svg)

Donde:
- El primer término **(X / Y)** proporciona una línea base que sube a medida que las reservas disminuyen
- La sumatoria añade bonificaciones permanentes de compras basadas en cola
- Cada compra histórica de cola i contribuye una bonificación escalada por volumen y normalizada por precio y suministro circulante

Impulso Mínimo Diario:
Para garantizar al menos 0.02% de crecimiento por período de 24 horas, el sistema aplica un impulso diario si el crecimiento orgánico cae por debajo de este umbral:

![Fórmula de Impulso Diario](/images/daily-boost-formula.svg)

Este impulso es temporal y no compuesto, reiniciándose cada día.`
    },
    {
      id: 'affiliate-program',
      title: 'Programa de Marketing de Afiliados',
      content: `EverRise incluye un programa de marketing de afiliados diseñado para impulsar la expansión del ecosistema y recompensar el crecimiento impulsado por la comunidad.

Características Clave:
• Comisión del 5%: Los afiliados reciben 5% de USDC de las compras de reserva como comisión directa
• Enlaces de Referencia: Cualquiera puede generar un enlace de referencia único para compartir con usuarios potenciales
• Pago Directo: Las comisiones se pagan directamente a la cuenta USDC del afiliado como parte de la transacción atómica
• Respaldo de Tesorería: Si no se proporciona un referidor, la comisión del 5% va a la billetera de tesorería

El programa subraya el compromiso de EverRise con el marketing descentralizado y alineado con incentivos, fomentando la adopción generalizada mientras compensa a los promotores por su papel en la construcción de la red.`
    },
    {
      id: 'roadmap',
      title: 'Hoja de Ruta',
      content: `Compañía de Tesorería de Activos Digitales

Habrá el lanzamiento de una Bóveda de Staking donde los usuarios pueden bloquear sus tokens EVER con la intención de que se conviertan en acciones de una compañía listada en Nasdaq. La compañía listada en Nasdaq será una compañía de Tesorería de Activos Digitales (DAT) similar a MicroStrategy.

Los tokens EVER que se staken se usarán para iniciar el proceso de una OPI/SPAC una vez que el capital sea lo suficientemente grande para completar el proceso de listado. Típicamente cuesta aproximadamente $4M recaudar un SPAC de $250M. La mayoría de los fondos recaudados en el proceso de listado público se usarán para crecer una tesorería mucho más grande, pero los stakers recibirán una porción de acciones de la compañía públicamente comercializada que sea proporcional a su stake.

Nota que esta actividad de staking requerirá KYC (Conoce a tu Cliente), que es una práctica estándar de identificación para cumplir con las autoridades regulatorias, en este caso con la SEC.

Si el umbral de capital requerido no se alcanza de manera oportuna, los stakers tendrán la oportunidad de desbloquear su capital bloqueado, y esto significa que es completamente posible que la DAT nunca se materialice.

Durante el proceso de staking, los usuarios seguirán beneficiándose del crecimiento del precio del token, pero no podrán vender o transferir los tokens hasta que se desbloqueen.

También nota que los stakers se convertirán en parte de una Organización Autónoma Descentralizada con derechos de voto y visibilidad en todo el proceso de listado.`
    },
    {
      id: 'conclusion',
      title: 'Conclusión',
      content: `EverRise ofrece un marco estructurado para criptomonedas que enfatiza el crecimiento sostenido y la estabilidad. Al integrar curvas de enlace, mecanismos de transacciones atómicas, garantías de apreciación mínima y un sistema respaldado por tesorería, se posiciona como un activo confiable en la economía digital.

Este modelo se basa en avances en finanzas descentralizadas mientras proporciona un enfoque único para la estabilidad de precios y el crecimiento. EverRise representa un nuevo paradigma en activos digitales: uno donde la apreciación de precios está garantizada por código, no por especulación.`
    }
  ]
};

export default function SpanishLitepaper() {
  return (
    <LitepaperLayout 
      language="Español" 
      content={litepaperContent} 
    />
  );
}
