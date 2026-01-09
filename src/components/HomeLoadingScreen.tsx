import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';

export default function HomeLoadingScreen() {
  // Animação do P subindo e descendo
  const bounceAnim = useRef(new Animated.Value(0)).current;
  // Animação das linhas da pista (movimento horizontal)
  const roadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de bounce vertical para o P
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Animação horizontal contínua para a pista (loop infinito)
    const roadAnimation = Animated.loop(
      Animated.timing(roadAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 } // Loop infinito
    );

    bounceAnimation.start();
    roadAnimation.start();

    return () => {
      bounceAnimation.stop();
      roadAnimation.stop();
    };
  }, []);

  // Transformação do P (sobe e desce)
  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20], // Move 20px para cima
  });

  // Transformação da pista (movimento horizontal)
  const translateX = roadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -360], // Move a largura total das linhas
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" translucent={false} />
      <View style={styles.container}>
        {/* Ícone do App */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <View style={styles.logoInnerSquare}>
              <Text style={styles.logoText}>P</Text>
            </View>
          </View>
        </Animated.View>

        {/* Pista com linhas animadas */}
        <View style={styles.roadContainer}>
          <Animated.View
            style={[
              styles.roadLines,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
          </Animated.View>
          {/* Pista duplicada para loop infinito contínuo */}
          <Animated.View
            style={[
              styles.roadLines,
              styles.roadLinesDuplicate,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
            <Text style={styles.roadLine}>_</Text>
          </Animated.View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInnerSquare: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#0077DD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roadContainer: {
    position: 'absolute',
    bottom: 150,
    width: '100%',
    overflow: 'hidden',
    height: 40,
    justifyContent: 'center',
  },
  roadLines: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: 0,
    width: 360,
  },
  roadLinesDuplicate: {
    left: 360, // Posiciona a segunda linha logo após a primeira
  },
  roadLine: {
    fontSize: 28,
    color: '#ffffff',
    marginHorizontal: 12,
    opacity: 0.7,
    fontWeight: 'bold',
  },
});




