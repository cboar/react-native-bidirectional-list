import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Button } from 'react-native';
import { withMVCP } from 'react-native-bidirectional-list';

const ScrollViewMVCP = withMVCP(ScrollView, (sv) => sv?.getScrollableNode());

function ScrollContent({ style }) {
  const [content, setContent] = useState([]);

  function onAdd() {
    const now = Date.now();
    setContent([`One ${now}`, `Two ${now}`, `Three ${now}`, ...content]);
  }

  return (
    <View style={styles.flex}>
      <ScrollViewMVCP
        style={[styles.flex, style]}
        maintainVisibleContentPosition={{
          autoscrollToTopThreshold: 80,
          minIndexForVisible: 1,
        }}
      >
        {content.map((str) => (
          <Text style={styles.item} key={str}>
            {str}
          </Text>
        ))}
      </ScrollViewMVCP>
      <Button onPress={onAdd} title="Add to top" />
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.flex}>
      <ScrollContent />
      <ScrollContent />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  item: {
    padding: 12,
    margin: 12,
    backgroundColor: '#bbb',
  },
});
