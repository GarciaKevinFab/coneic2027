import clsx from 'clsx';

const tierConfig = {
  platinum: { label: 'Platino', size: 'h-20 sm:h-24', cols: 'grid-cols-1 sm:grid-cols-2' },
  gold: { label: 'Oro', size: 'h-14 sm:h-18', cols: 'grid-cols-2 sm:grid-cols-3' },
  silver: { label: 'Plata', size: 'h-12 sm:h-14', cols: 'grid-cols-2 sm:grid-cols-4' },
  bronze: { label: 'Bronce', size: 'h-10 sm:h-12', cols: 'grid-cols-3 sm:grid-cols-5' },
};

const tierOrder = ['platinum', 'gold', 'silver', 'bronze'];

function SponsorItem({ sponsor, sizeClass }) {
  const content = (
    <div className="flex items-center justify-center p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 w-full">
      {sponsor.logo_url ? (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className={clsx('object-contain w-auto max-w-full', sizeClass)}
        />
      ) : (
        <span className="text-gray-400 font-display font-bold text-sm text-center">{sponsor.name}</span>
      )}
    </div>
  );

  if (sponsor.website) {
    return (
      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="block w-full" title={sponsor.name}>
        {content}
      </a>
    );
  }
  return content;
}

export default function SponsorGrid({ sponsors = [] }) {
  const grouped = tierOrder.reduce((acc, tier) => {
    const items = sponsors.filter((s) => s.tier?.toLowerCase() === tier);
    if (items.length > 0) acc.push({ tier, items });
    return acc;
  }, []);

  if (grouped.length === 0 && sponsors.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {sponsors.map((sponsor, i) => (
          <SponsorItem key={sponsor.id || i} sponsor={sponsor} sizeClass="h-14 sm:h-18" />
        ))}
      </div>
    );
  }

  if (sponsors.length === 0) {
    return <p className="text-center text-gray-500 py-8">Sponsors por anunciar.</p>;
  }

  return (
    <div className="space-y-10">
      {grouped.map(({ tier, items }) => {
        const config = tierConfig[tier] || tierConfig.silver;
        return (
          <div key={tier}>
            <h3 className="text-center text-sm uppercase tracking-widest font-semibold text-gray-400 mb-6">
              {config.label}
            </h3>
            <div className={clsx('grid gap-6 justify-items-center', config.cols)}>
              {items.map((sponsor, i) => (
                <SponsorItem key={sponsor.id || i} sponsor={sponsor} sizeClass={config.size} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
