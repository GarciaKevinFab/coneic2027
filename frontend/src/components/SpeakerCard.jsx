import { HiAcademicCap, HiBriefcase } from 'react-icons/hi';

export default function SpeakerCard({ speaker }) {
  if (!speaker) return null;

  return (
    <div className="card group">
      <div className="aspect-[4/5] bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
        {speaker.photo_url ? (
          <img
            src={speaker.photo_url}
            alt={speaker.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary-300/50 flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-primary-600">
                {speaker.name?.[0]?.toUpperCase() || 'P'}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-display font-bold text-primary text-lg">{speaker.name}</h3>
        {speaker.topic && (
          <div className="flex items-start gap-2 mt-2">
            <HiAcademicCap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 font-medium leading-snug">{speaker.topic}</p>
          </div>
        )}
        {speaker.organization && (
          <div className="flex items-start gap-2 mt-2">
            <HiBriefcase className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500">{speaker.organization}</p>
          </div>
        )}
        {speaker.bio && (
          <p className="text-xs text-gray-500 mt-3 line-clamp-3 leading-relaxed">{speaker.bio}</p>
        )}
      </div>
    </div>
  );
}
