import { View, Text } from 'react-native';

export default function AccountCard({ institutionName, balance, lastUpdated }) {
  return (
    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-4">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-slate-500 text-xs uppercase tracking-widest font-semibold">
            Connected Bank
          </Text>
          <Text className="text-xl font-bold text-slate-900">{institutionName}</Text>
        </View>
        <View className="bg-green-100 px-2 py-1 rounded-md">
          <Text className="text-green-700 text-[10px] font-bold">ACTIVE</Text>
        </View>
      </View>
      
      <Text className="text-slate-400 text-sm">Total Balance</Text>
      <Text className="text-4xl font-black text-indigo-600">${balance.toLocaleString()}</Text>
      
      <View className="mt-4 pt-4 border-t border-slate-50">
        <Text className="text-slate-400 text-[10px]">
          Last updated: {lastUpdated}
        </Text>
      </View>
    </View>
  );
}