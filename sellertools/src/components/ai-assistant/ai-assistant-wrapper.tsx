import React, { useCallback, useEffect, useState } from 'react';
import { useCustomObject } from '../../hooks/use-custom-objects';
import AiAssistant from '.';
import { signWithJose } from './utils';
import { useAuthContext } from '../../contexts/auth-context';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import axios from 'axios';

const SHARED_CONTAINER = 'temp-container';
const SHARED_KEY = 'chat-app-deployed-url';

const AIAssistantWrapper = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const { getCustomObject } = useCustomObject(SHARED_CONTAINER);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  const [isHealthy, setIsHealthy] = useState(isDevelopment);
  const { environment, project } = useApplicationContext();
  const { storeKey } = useAuthContext();

  const fetchDeployedUrl = useCallback(async () => {
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
  }, [getCustomObject]);

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

  useEffect(() => {
    fetchDeployedUrl();
  }, [fetchDeployedUrl]);

  useEffect(() => {
    const checkHealth = async () => {
      const result = await axios.get(
        `${deployedUrl}/ping?storeKey=${storeKey}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsHealthy(
        result.status === 200 && result.data.projectkey === project?.key
      );
    };

    if (deployedUrl && storeKey && token && !isDevelopment) {
      checkHealth();
    }
  }, [deployedUrl, storeKey, token, isDevelopment]);

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
