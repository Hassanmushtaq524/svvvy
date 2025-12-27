import { useState, useEffect, useCallback } from 'react';
import { create, open } from 'react-native-plaid-link-sdk';
import * as SecureStore from 'expo-secure-store'; // Recommended for security
import { API_URL } from '@env';

export const usePlaid = () => {
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Link Token and "Pre-warm"
  useEffect(() => {
    const initPlaid = async () => {
      try {
        const response = await fetch(`${API_URL}/create_link_token`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        setLinkToken(data.link_token);
        
        // NEW: Pre-warm the SDK as soon as we have the token
        create({ token: data.link_token });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to initialize bank link');
        setLoading(false);
      }
    };
    initPlaid();
  }, []);

  // 2. Token Exchange & Persistence
  const startLink = useCallback(() => {
    if (!linkToken) return;

    open({
      onSuccess: async (success) => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/exchange_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token: success.publicToken }),
          });
          
          const { access_token } = await response.json();
          
          // Store securely on the device
          await SecureStore.setItemAsync('plaid_access_token', access_token);
          
          setAccessToken(access_token);
          await fetchAccountInfo(access_token); 
        } catch (err) {
          setError('Token exchange failed');
        } finally {
          setLoading(false);
        }
      },
      onExit: (exit) => {
        if (exit.error) setError(exit.error.displayMessage);
      }
    });
  }, [linkToken]);

  // 3. Fetch Account Info (using existing access token)
  const fetchAccountInfo = async (token) => {
    try {
      const response = await fetch(`${API_URL}/get_accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token }),
      });
      const data = await response.json();
      setAccountData(data);
    } catch (err) {
      setError('Failed to load accounts');
    }
  };

  return { startLink, isReady: !!linkToken, isLinked: !!accessToken, isLoading: loading, error, accountData };
};