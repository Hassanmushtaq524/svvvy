import React from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import AccountCard from './components/AccountCard';
import { usePlaid } from './hooks/usePlaid';
import './global.css';

export default function App() {
  const { startLink, isReady, isLinked, isLoading, accountData, error } = usePlaid();

  // Helper to extract primary account info (simplification)
  const primaryAccount = accountData?.accounts?.[0] || {};

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6">
        
        {/* Header */}
        <View className="mb-8">
          <Text className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
            My Budget
          </Text>
          <Text className="text-3xl font-black text-slate-900 mt-1">
            Dashboard
          </Text>
        </View>

        {/* Error Handling */}
        {error && (
          <View className="bg-red-50 p-4 rounded-xl mb-4">
            <Text className="text-red-600 font-medium">{error}</Text>
          </View>
        )}

        {/* State 1: Loading */}
        {isLoading && !accountData && (
          <View className="h-40 justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-slate-400 mt-4 text-sm">Securely connecting...</Text>
          </View>
        )}

        {/* State 2: Not Connected -> Show "Connect" Button */}
        {!isLinked && !isLoading && (
          <View className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 items-center">
            <Text className="text-slate-500 text-center mb-6 leading-relaxed">
              Connect your bank to automatically track your spending and categorize budgets.
            </Text>
            
            <TouchableOpacity 
              onPress={startLink}
              disabled={!isReady}
              className={`w-full py-4 rounded-xl items-center ${isReady ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-300'}`}
            >
              <Text className="text-white font-bold text-lg">Connect Bank</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* State 3: Connected -> Show Data Card */}
        {isLinked && accountData && (
          <View>
            <AccountCard 
              institutionName={primaryAccount.name || 'Bank Account'}
              balance={primaryAccount.balances?.current || 0}
              lastUpdated="Just now"
            />
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}