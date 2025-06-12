import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useEffect, useState } from 'react';
import AiAssistant from '.';
import { AI_ASSISTANT_DEPLOYED_URL_KEY } from '../../constants';
import { useAuthContext } from '../../contexts/auth-context';
import { useExternalUrl } from '../../hooks/use-external-url';
import { signWithJose } from './utils';

const AIAssistantWrapper = () => {
  const { storeKey } = useAuthContext();
  const [token, setToken] = useState<string>('');
  const { environment } = useApplicationContext();

  const { deployedUrl, isLoading, isHealthy } = useExternalUrl({
    storedUrlKey: AI_ASSISTANT_DEPLOYED_URL_KEY,
    ...(storeKey && { healthCheckUrl: `/ping?storeKey=${storeKey}` }),
    ...(token && {
      healthCheckHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  });

  // Generate token on component mount
  useEffect(() => {
    const generateToken = async () => {
      try {
        const generatedToken = await signWithJose(
          storeKey!,
          (environment as any)?.JWT_TOKEN
        );
        setToken(generatedToken);
      } catch (error) {
        console.error('Failed to generate token:', error);
      }
    };

    generateToken();
  }, [storeKey]);

  if (!deployedUrl || isLoading || !token || !isHealthy) {
    return null;
  }

  return (
    <AiAssistant
      deployedUrl={`${deployedUrl}?storeKey=${storeKey}`}
      token={token}
    />
  );
};

export default AIAssistantWrapper;
