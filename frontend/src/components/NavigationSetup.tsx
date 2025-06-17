import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';

/**
 * This component sets up the navigation callback for the auth context.
 * It should be rendered inside a Router component.
 */
export const NavigationSetup: React.FC = () => {
  const navigate = useNavigate();
  const { setNavigation } = useAuth();

  useEffect(() => {
    // Set up the navigation callback
    setNavigation(navigate);
    
    // Clean up when the component unmounts
    return () => {
      // No need to call cleanup as it's handled by the AuthProvider
    };
  }, [navigate, setNavigation]);

  return null; // This component doesn't render anything
};

export default NavigationSetup;
