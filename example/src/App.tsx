import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { enableMVCP } from 'react-native-bidirectional-list';

export default function App() {
  useEffect(() => {
    enableMVCP(1000, 0, 0);
  }, []);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {},
});
