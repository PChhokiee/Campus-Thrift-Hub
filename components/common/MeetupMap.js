import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MAP_CENTER } from '@/constants/campus';
import { useStyles } from '@/hooks/useStyles';
import { fontSize, radius } from '@/constants/theme';

class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function MeetupMap({ points, selectedId, onSelect, height = 260 }) {
  const { styles } = useStyles(makeStyles);
  const fallback = (
    <View style={[styles.box, { height: 90 }]}><Text style={styles.note}>Map is unavailable on this device. Use the list below.</Text></View>
  );
  return (
    <Boundary fallback={fallback}>
      <View style={[styles.box, { height }]}>
        <MapView style={StyleSheet.absoluteFill} initialRegion={MAP_CENTER}>
          {points.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name}
              description={p.description}
              pinColor={p.id === selectedId ? 'tomato' : 'green'}
              onPress={() => onSelect && onSelect(p.id)}
            />
          ))}
        </MapView>
      </View>
    </Boundary>
  );
}
const makeStyles = (c) => StyleSheet.create({
  box: { borderRadius: radius.card, overflow: 'hidden', backgroundColor: c.card, borderWidth: 1, borderColor: c.border, justifyContent: 'center', padding: 0 },
  note: { color: c.muted, fontSize: fontSize.sm, textAlign: 'center', padding: 12 },
});
