import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Image,
} from 'react-native';

export default function LoadingScreen() {
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
    outputRange: [0, -40], // Move 20px para cima
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
            <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
        </Animated.View>

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
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

