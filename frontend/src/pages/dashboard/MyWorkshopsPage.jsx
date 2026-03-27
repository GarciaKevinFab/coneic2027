import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiAcademicCap } from 'react-icons/hi';
import toast from 'react-hot-toast';
import workshopService from '../../services/workshopService';
import WorkshopCard from '../../components/WorkshopCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyWorkshopsPage() {
  const queryClient = useQueryClient();

  const {
    data: workshops,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-workshops'],
    queryFn: workshopService.getMyWorkshops,
  });

  const unenrollMutation = useMutation({
    mutationFn: workshopService.unenroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-workshops'] });
      toast.success('Inscripcion cancelada');
    },
    onError: (error) => {
      const msg = error.response?.data?.detail || 'Error al cancelar inscripcion';
      toast.error(msg);
    },
  });

  const handleUnenroll = (workshopId) => {
    if (window.confirm('¿Estas seguro de cancelar tu inscripcion en este taller?')) {
      unenrollMutation.mutate(workshopId);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Mis Talleres</h1>
        <p className="text-gray-500 mt-1 text-sm">Talleres en los que estas inscrito</p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Cargando talleres..." className="py-20" />
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Error al cargar tus talleres. Intenta de nuevo.</p>
        </div>
      ) : workshops && workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {workshops.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              enrolled
              onUnenroll={handleUnenroll}
              loading={unenrollMutation.isPending && unenrollMutation.variables === workshop.id}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A3A6B]/5 flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-[#1A3A6B]" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg mb-2">
            Sin talleres inscritos
          </h3>
          <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
            Explora los talleres disponibles e inscribete en los que mas te interesen.
          </p>
          <Link
            to="/talleres"
            className="inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-2.5 px-6 rounded-xl transition-colors"
          >
            <HiAcademicCap className="w-5 h-5" />
            Explorar Talleres
          </Link>
        </div>
      )}
    </div>
  );
}
