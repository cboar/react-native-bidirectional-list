import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Button } from 'react-native';
import {
  BidirectionalFlatList,
  withMVCP,
} from 'react-native-bidirectional-list';

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

function Item(props) {
  const { item } = props;
  return <Text style={styles.item}>{item}</Text>;
}

function FlatListEx() {
  const [content, setContent] = useState([]);

  function onAdd() {
    const now = Date.now();
    setContent([`One ${now}`, `Two ${now}`, `Three ${now}`, ...content]);
  }

  return (
    <View style={styles.flex}>
      <BidirectionalFlatList
        data={content}
        renderItem={Item}
        style={[styles.flex, { backgroundColor: 'red' }]}
        maintainVisibleContentPosition={{
          autoscrollToTopThreshold: 80,
          minIndexForVisible: 1,
        }}
        keyExtractor={(item) => item.toString()}
      />
      <Button onPress={onAdd} title="Add to top" />
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.flex}>
      <FlatListEx />
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
