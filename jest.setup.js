// Jest läuft ohne echtes Gerät - AsyncStorage braucht dafür eine
// In-Memory-Attrappe statt der nativen Implementierung.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
