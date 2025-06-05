import React, { useEffect, useState } from 'react';
import { useCustomObject } from '../../hooks/use-custom-objects';
import AiAssistant from '.';
import { signWithJose } from './utils';
import { useAuthContext } from '../../contexts/auth-context';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
// import { useExternalCall } from '../../hooks/use-external-call';

const SHARED_CONTAINER = 'temp-container';
const SHARED_KEY = 'chat-app-deployed-url';

const AIAssistantWrapper = () => {
  const { getCustomObject } = useCustomObject(SHARED_CONTAINER);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>('');
  //   const [isHealthy, setIsHealthy] = useState(false);
  //   const { fetch } = useExternalCall();
  const { environment }: { environment: { JWT_TOKEN: string } } =
    useApplicationContext();
  const { storeKey } = useAuthContext();

  // Generate token on component mount
  useEffect(() => {
    const generateToken = async () => {
      try {
        const generatedToken = await signWithJose(
          storeKey!,
          environment?.JWT_TOKEN
        );
        setToken(generatedToken);
      } catch (error) {
        console.error('Failed to generate token:', error);
      }
    };

    generateToken();
  }, [storeKey]);

  useEffect(() => {
    const fetchDeployedUrl = async () => {
      try {
        const deployedUrlResult = await getCustomObject(SHARED_KEY);
        setDeployedUrl(deployedUrlResult.value);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching deployed URL:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeployedUrl();
  }, []);

  //   useEffect(() => {
  //     const checkHealth = async () => {
  //       const result = await fetch(`${deployedUrl}/ping`);
  //       setIsHealthy(result.status === 200);
  //     };
  //     checkHealth();
  //   }, [deployedUrl]);

  if (!deployedUrl || isLoading || !token) {
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
