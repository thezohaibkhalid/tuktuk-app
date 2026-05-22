import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openCmsLink } from '@/lib/navigate';
import type { SliderItem } from '@/services/cms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - Spacing.three * 2;
const SLIDE_HEIGHT = Math.round(SLIDE_WIDTH * 0.55);

export function HeroSlider({ sliders }: { sliders: SliderItem[] }) {
  const theme = useTheme();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<SliderItem>>(null);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SLIDE_WIDTH);
    setIndex(next);
  }, []);

  if (!sliders?.length) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={sliders}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLIDE_WIDTH}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingHorizontal: Spacing.three }}
        ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.slide}
            onPress={() => openCmsLink(router, item.buttonLink)}>
            <Image
              source={{ uri: item.image }}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
              accessibilityLabel={item.imageAltText ?? item.title}
            />
            <View style={styles.overlay}>
              <ThemedText
                style={[styles.slideTitle, { color: item.titleColor || '#ffffff' }]}>
                {item.title}
              </ThemedText>
              {item.description ? (
                <ThemedText
                  style={[
                    styles.slideDesc,
                    { color: item.descriptionColor || '#ffffffcc' },
                  ]}>
                  {item.description}
                </ThemedText>
              ) : null}
              {item.buttonText ? (
                <View
                  style={[
                    styles.cta,
                    { backgroundColor: item.buttonBgColor || theme.primary },
                  ]}>
                  <ThemedText style={styles.ctaText}>{item.buttonText}</ThemedText>
                </View>
              ) : null}
            </View>
          </Pressable>
        )}
      />

      <View style={styles.dots}>
        {sliders.map((s, i) => (
          <View
            key={s.id}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? theme.primary : theme.border,
                width: i === index ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.two },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    justifyContent: 'flex-end',
  },
  overlay: {
    padding: Spacing.three,
    gap: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  slideDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    marginTop: Spacing.one,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#071a3d',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
