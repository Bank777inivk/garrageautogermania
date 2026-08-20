import { useNavigate, useParams } from 'react-router-dom';

/**
 * Hook utilitaire pour naviguer avec le préfixe de langue courant.
 * Usage: const { langNavigate, langPath } = useLangNavigate();
 *   langNavigate('/catalogue')  → navigate('/fr/catalogue')
 *   langPath('/catalogue')      → '/fr/catalogue'
 */
const useLangNavigate = () => {
  const navigate = useNavigate();
  const { lang = 'fr' } = useParams();

  const langPath = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${cleanPath}`;
  };

  const langNavigate = (path, options) => {
    navigate(langPath(path), options);
  };

  return { langNavigate, langPath, lang };
};

export default useLangNavigate;
