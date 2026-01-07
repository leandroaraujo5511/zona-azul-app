import React, { useState } from "react";
import Constants from 'expo-constants';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { APP_VERSION } from "../constants/config";

type RootStackParamList = {
	Login: undefined;
	Register: undefined;
	Home: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	"Login"
>;

export default function LoginScreen() {
	const navigation = useNavigation<LoginScreenNavigationProp>();
	const { login, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		if (!email.trim()) {
			Alert.alert("Erro", "Por favor, informe o e-mail");
			return;
		}

		if (!email.includes("@")) {
			Alert.alert("Erro", "Por favor, informe um e-mail válido");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres");
			return;
		}

		const result = await login({ email, password });

		if (!result.success) {
			Alert.alert(
				"Erro ao fazer login",
				result.error || "E-mail ou senha inválidos"
			);
		}
	};

	return (
		<>
			<StatusBar
				barStyle="light-content"
				backgroundColor="#1a1a1a"
				translucent={false}
			/>
			<SafeAreaView style={styles.safeArea} edges={["top"]}>
				<KeyboardAvoidingView
					style={styles.container}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.content}>
							<View style={styles.logoContainer}>
								<Image
									source={require("../../assets/images/logo.png")}
									style={styles.logoImage}
									resizeMode="contain"
								/>
							</View>
							<Text style={styles.title}>Picos Parking</Text>
							<Text style={styles.subtitle}>
								Sistema de Estacionamento Rotativo
							</Text>

							<View style={styles.form}>
								<View style={styles.inputContainer}>
									<Text style={styles.label}>E-mail</Text>
									<TextInput
										style={styles.input}
										placeholder="seu.email@exemplo.com"
										placeholderTextColor="#666666"
										value={email}
										onChangeText={setEmail}
										keyboardType="email-address"
										autoCapitalize="none"
										editable={!isLoading}
									/>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.label}>Senha</Text>
									<View style={styles.passwordInputContainer}>
										<TextInput
											style={styles.passwordInput}
											placeholder="••••••••"
											placeholderTextColor="#666666"
											value={password}
											onChangeText={setPassword}
											secureTextEntry={!showPassword}
											autoCapitalize="none"
											editable={!isLoading}
										/>
										<TouchableOpacity
											style={styles.showPasswordButton}
											onPress={() => setShowPassword(!showPassword)}
										>
											<Text style={styles.showPasswordText}>
												{showPassword ? "Ocultar" : "Mostrar"}
											</Text>
										</TouchableOpacity>
									</View>
								</View>

								<TouchableOpacity
									style={[styles.button, isLoading && styles.buttonDisabled]}
									onPress={handleLogin}
									disabled={isLoading}
									activeOpacity={0.8}
								>
									{isLoading ? (
										<ActivityIndicator color="#ffffff" />
									) : (
										<Text style={styles.buttonText}>Entrar</Text>
									)}
								</TouchableOpacity>

								<View style={styles.registerContainer}>
									<Text style={styles.registerText}>Não tem uma conta? </Text>
									<TouchableOpacity
										onPress={() => navigation.navigate("Register")}
										disabled={isLoading}
									>
										<Text style={styles.registerLink}>Cadastre-se</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
						<View style={styles.footerVersion}>
							<Text style={styles.footerVersionText}>Versão {APP_VERSION}</Text>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#1a1a1a",
	},
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		padding: 24,
		paddingTop: 20,
	},
	content: {
		width: "100%",
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 16,
	},
	logoImage: {
		width: 80,
		height: 80,
	},
	logoCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "#0066CC",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#0066CC",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	logoText: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#ffffff",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#ffffff",
		textAlign: "center",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#999999",
		textAlign: "center",
		marginBottom: 40,
	},
	form: {
		width: "100%",
	},
	inputContainer: {
		marginBottom: 24,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#ffffff",
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#333333",
		borderRadius: 16,
		padding: 16,
		fontSize: 16,
		backgroundColor: "#2a2a2a",
		color: "#ffffff",
	},
	passwordInputContainer: {
		position: "relative",
	},
	passwordInput: {
		borderWidth: 1,
		borderColor: "#333333",
		borderRadius: 16,
		padding: 16,
		paddingRight: 100,
		fontSize: 16,
		backgroundColor: "#2a2a2a",
		color: "#ffffff",
	},
	showPasswordButton: {
		position: "absolute",
		right: 12,
		top: 16,
		padding: 4,
	},
	showPasswordText: {
		color: "#0066CC",
		fontSize: 14,
		fontWeight: "600",
	},
	button: {
		backgroundColor: "#0066CC",
		borderRadius: 16,
		padding: 18,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 8,
		shadowColor: "#0066CC",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 18,
		fontWeight: "bold",
	},
	registerContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 32,
	},
	registerText: {
		color: "#999999",
		fontSize: 14,
	},
	registerLink: {
		color: "#0066CC",
		fontSize: 14,
		fontWeight: "600",
	},
  footerVersion: {
    alignItems: "center",
    marginTop: 32,
  },
  footerVersionText: {
    color: "#999999",
    fontSize: 14,
  },
});
