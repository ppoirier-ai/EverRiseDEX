import LitepaperLayout from '@/components/LitepaperLayout';

const litepaperContent = {
  title: 'EverRise - Livre Blanc',
  subtitle: 'Bitcoin a été pionnier de l\'argent qui ne peut pas être imprimé. EverRise a amélioré avec des prix qui ne peuvent pas être négociés.',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `Avez-vous déjà été victime de schémas de pompe et de vidage ? Acheter un actif au sommet, pour subir un crash massif peu après ? Vous voudrez prêter attention à EverRise, l'actif innovant qui est programmatiquement conçu pour ne jamais diminuer de prix. Alors que Bitcoin a été pionnier de l'argent qui ne peut pas être imprimé, EverRise a amélioré avec des prix qui ne peuvent pas être négociés.

Dans une ère où les marchés financiers sont de plus en plus en proie à la volatilité à court terme, le monde exige une nouvelle race de réserve de valeur—une qui protège les investisseurs des oscillations erratiques des actifs traditionnels tout en offrant une croissance constante à long terme. Les réserves traditionnelles comme l'or ou les obligations gouvernementales offrent la stabilité mais traînent souvent dans l'appréciation, tandis que les cryptomonnaies comme Bitcoin promettent un potentiel révolutionnaire mais exposent les détenteurs à des chutes dramatiques entraînées par la spéculation et les pressions macroéconomiques.

EverRise ($EVER) émerge comme une alternative innovante—une cryptomonnaie conçue pour un élan ascendant perpétuel, offrant un paradigme différent des approches traditionnelles. En éliminant les pools de liquidité traditionnels et en incorporant un système de transactions atomiques, EverRise vise à fournir stabilité et accumulation de valeur à long terme pour les détenteurs.`
    },
    {
      id: 'need-for-new-store',
      title: 'Le Besoin d\'une Nouvelle Réserve de Valeur',
      content: `Le paysage financier mondial évolue rapidement, avec l'inflation qui érode les monnaies fiat et les incertitudes géopolitiques qui amplifient la turbulence du marché. Les investisseurs cherchent des actifs qui non seulement préservent la richesse mais la composent activement sans la volatilité qui arrête le cœur qui caractérise de nombreuses cryptomonnaies.

Depuis le début des temps, chaque actif que l'humanité a connu s'est incliné devant l'expansion et la négociation. Le prix de l'or monte ? Creusez plus profond, inondez le marché avec plus d'offre, et regardez la valeur marchander vers le bas. Le pétrole, la terre, même les biens de troc anciens—la demande croissante invite toujours plus de création, diluant le gâteau, tandis que les prix sont parlés vers le haut ou vers le bas basés sur des caprices.

Bitcoin a brisé ce cycle comme la première monnaie vraiment non-imprimable : un plafond fixe de 21 millions, une rareté imposée par le code que personne ne pourrait gonfler. C'était un big bang pour la monnaie programmable, prouvant que l'argent pouvait résister à la dilution infinie.

Mais que se passerait-il si nous allions plus loin ? EverRise conceptualise le premier actif de prix non-négociable, où l'algorithme empêche tout débat descendant—les prix ne peuvent pas être négociés vers le bas, conçus pour ne monter qu'à un rythme gérable.`
    },
    {
      id: 'core-mechanics',
      title: 'Mécaniques Centrales',
      content: `EverRise opère sur une fondation qui priorise l'élan de prix ascendant. Les caractéristiques clés incluent :

• Augmentation de Prix Perpétuelle : Utilise un modèle de courbe de liaison conçu de telle manière que le prix ne diminue jamais et n'augmente qu'avec chaque transaction d'achat, créant une croissance constante.

• Commerce Atomique : Les transactions sont traitées immédiatement par des opérations atomiques, assurant une exécution instantanée sans périodes d'attente.

• Intégration d'Offre de Réserve : Pour les achats, les tokens sont tirés de l'offre de réserve (si disponible), avec les revenus dirigés vers un trésor externe. L'offre maximale est plafonnée à 100M tokens, assurant la rareté.

• Utilisation du Trésor : Les fonds accumulés dans le trésor sont détenus pour des objectifs stratégiques futurs, avec le potentiel de génération de rendement et de rachats.

Ces éléments se combinent pour favoriser un environnement où l'appréciation des prix est inhérente et prévisible.`
    },
    {
      id: 'pricing-formula',
      title: 'Formule de Prix',
      content: `Le prix de $EVER est calculé en utilisant un modèle de courbe de liaison inspiré des mécanismes de produit constant, augmenté par une garantie de croissance minimale quotidienne.

Définitions de Variables :
• X : Quantité USDC dans le pool de réserve virtuel. Valeur initiale : 10,000 USDC. Augmente avec les achats de réserve.
• Y : Tokens $EVER en réserves. Offre initiale/maximale : 100,000,000. Diminue sur les achats de réserve.
• K : Produit constant (K = X * Y), mis à jour après les transactions de réserve.
• SC : Offre en circulation de $EVER, commençant à 0 et augmentant avec les achats.
• P(Y) : Prix actuel en USDC.

Calcul de Prix Organique :
Le prix de base est calculé en utilisant la formule suivante :

<img src="/images/organic-price-formula.png" alt="Formule de Prix Organique" className="mx-auto my-4 max-w-full h-auto" />

Où :
- Le premier terme **(X / Y)** fournit une ligne de base qui monte à mesure que les réserves diminuent
- La sommation ajoute des bonus permanents des achats basés sur la file d'attente
- Chaque achat historique de file d'attente i contribue un bonus mis à l'échelle par le volume et normalisé par le prix et l'offre en circulation

Boost Minimum Quotidien :
Pour garantir au moins 0.02% de croissance par période de 24 heures, le système applique un boost quotidien si la croissance organique tombe en dessous de ce seuil :

<img src="/images/daily-boost-formula.png" alt="Formule de Boost Quotidien" className="mx-auto my-4 max-w-full h-auto" />

Ce boost est temporaire et non-composé, se réinitialisant chaque jour.`
    },
    {
      id: 'affiliate-program',
      title: 'Programme de Marketing d\'Affiliation',
      content: `EverRise inclut un programme de marketing d'affiliation conçu pour stimuler l'expansion de l'écosystème et récompenser la croissance pilotée par la communauté.

Caractéristiques Clés :
• Commission de 5% : Les affiliés reçoivent 5% d'USDC des achats de réserve comme commission directe
• Liens de Parrainage : N'importe qui peut générer un lien de parrainage unique à partager avec des utilisateurs potentiels
• Paiement Direct : Les commissions sont payées directement au compte USDC de l'affilié dans le cadre de la transaction atomique
• Fallback du Trésor : Si aucun parrain n'est fourni, la commission de 5% va au portefeuille du trésor

Le programme souligne l'engagement d'EverRise envers le marketing décentralisé et aligné sur les incitations, favorisant l'adoption généralisée tout en compensant les promoteurs pour leur rôle dans la construction du réseau.`
    },
    {
      id: 'roadmap',
      title: 'Feuille de Route',
      content: `Compagnie de Trésorerie d'Actifs Numériques

Il y aura la sortie d'un Coffre-fort de Staking où les utilisateurs peuvent verrouiller leurs tokens EVER avec l'intention qu'ils soient convertis en actions d'une compagnie listée sur Nasdaq. La compagnie listée sur Nasdaq sera une compagnie de Trésorerie d'Actifs Numériques (DAT) similaire à MicroStrategy.

Les tokens EVER qui sont stakés seront utilisés pour initier le processus d'IPO/SPAC une fois que le capital est assez grand pour compléter le processus de listing. Typiquement, il coûte environ 4M$ pour lever un SPAC de 250M$. La plupart des fonds levés dans le processus de listing public seront utilisés pour faire croître un trésor beaucoup plus grand, mais les stakers recevront une portion d'actions de la compagnie publiquement tradée qui est proportionnelle à leur stake.

Notez que cette activité de staking nécessitera KYC (Connaissez Votre Client), qui est une pratique standard d'identification pour se conformer aux autorités réglementaires, dans ce cas avec la SEC.

Si le seuil de capital requis n'est pas atteint en temps opportun, les stakers auront l'opportunité de déverrouiller leur capital verrouillé, et cela signifie qu'il est entièrement possible que la DAT ne se concrétise jamais.

Pendant le processus de staking, les utilisateurs continueront de bénéficier de la croissance du prix du token, mais ne pourront pas vendre ou transférer les tokens jusqu'à ce qu'ils soient déverrouillés.

Notez aussi que les stakers deviendront partie d'une Organisation Autonome Décentralisée avec des droits de vote et de visibilité sur tout le processus de listing.`
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: `EverRise offre un cadre structuré pour les cryptomonnaies qui met l'accent sur la croissance soutenue et la stabilité. En intégrant les courbes de liaison, les mécanismes de transactions atomiques, les garanties d'appréciation minimale et un système soutenu par le trésor, il se positionne comme un actif fiable dans l'économie numérique.

Ce modèle s'inspire des avancées en finance décentralisée tout en fournissant une approche unique à la stabilité des prix et à la croissance. EverRise représente un nouveau paradigme dans les actifs numériques—un où l'appréciation des prix est garantie par le code, pas par la spéculation.`
    }
  ]
};

export default function FrenchLitepaper() {
  return (
    <LitepaperLayout 
      language="Français" 
      content={litepaperContent} 
    />
  );
}
