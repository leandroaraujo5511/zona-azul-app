import React, { useState } from "react";
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

type RootStackParamList = {
	Login: undefined;
	Register: undefined;
	Home: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	"Register"
>;

export default function RegisterScreen() {
	const navigation = useNavigation<RegisterScreenNavigationProp>();
	const { register, isLoading } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [cpf, setCpf] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleRegister = async () => {
		if (!name.trim()) {
			Alert.alert("Erro", "Por favor, informe seu nome");
			return;
		}

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

		if (password !== confirmPassword) {
			Alert.alert("Erro", "As senhas não coincidem");
			return;
		}

		const result = await register({
			name: name.trim(),
			email: email.trim().toLowerCase(),
			password,
      confirmPassword,
			phone: phone.trim() || undefined,
			cpf: cpf.trim() || undefined,
		});

		if (!result.success) {
			// Display the specific error message from backend
			const errorMessage = result.error || "Não foi possível criar a conta";
			Alert.alert("Erro ao cadastrar", errorMessage);
		} else {
			Alert.alert("Sucesso", "Conta criada com sucesso!", [
				{
					text: "OK",
					onPress: () => navigation.navigate("Home"),
				},
			]);
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
							<Text style={styles.title}>Criar Conta</Text>
							<Text style={styles.subtitle}>
								Preencha seus dados para criar uma conta
							</Text>

							<View style={styles.form}>
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Nome Completo *</Text>
									<TextInput
										style={styles.input}
										placeholder="Seu nome completo"
										placeholderTextColor="#666666"
										value={name}
										onChangeText={setName}
										autoCapitalize="words"
										editable={!isLoading}
									/>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.label}>E-mail *</Text>
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
									<Text style={styles.label}>Telefone</Text>
									<TextInput
										style={styles.input}
										placeholder="(00) 00000-0000"
										placeholderTextColor="#666666"
										value={phone}
										onChangeText={setPhone}
										keyboardType="phone-pad"
										editable={!isLoading}
									/>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.label}>CPF</Text>
									<TextInput
										style={styles.input}
										placeholder="000.000.000-00"
										placeholderTextColor="#666666"
										value={cpf}
										onChangeText={setCpf}
										keyboardType="numeric"
										editable={!isLoading}
									/>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.label}>Senha *</Text>
									<View style={styles.passwordInputContainer}>
										<TextInput
											style={styles.passwordInput}
											placeholder="Mínimo 6 caracteres"
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

								<View style={styles.inputContainer}>
									<Text style={styles.label}>Confirmar Senha *</Text>
									<TextInput
										style={styles.input}
										placeholder="Confirme sua senha"
										placeholderTextColor="#666666"
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										secureTextEntry={!showPassword}
										autoCapitalize="none"
										editable={!isLoading}
									/>
								</View>

								<TouchableOpacity
									style={[styles.button, isLoading && styles.buttonDisabled]}
									onPress={handleRegister}
									disabled={isLoading}
									activeOpacity={0.8}
								>
									{isLoading ? (
										<ActivityIndicator color="#ffffff" />
									) : (
										<Text style={styles.buttonText}>Cadastrar</Text>
									)}
								</TouchableOpacity>

								<View style={styles.loginContainer}>
									<Text style={styles.loginText}>Já tem uma conta? </Text>
									<TouchableOpacity
										onPress={() => navigation.navigate("Login")}
										disabled={isLoading}
									>
										<Text style={styles.loginLink}>Entrar</Text>
									</TouchableOpacity>
								</View>
							</View>
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
		padding: 24,
		paddingTop: 20,
		paddingBottom: 40,
	},
	content: {
		width: "100%",
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 8,
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
		marginBottom: 8,
		shadowColor: "#0066CC",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	logoIcon: {
		fontSize: 50,
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
		marginBottom: 32,
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
	loginContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 32,
	},
	loginText: {
		color: "#999999",
		fontSize: 14,
	},
	loginLink: {
		color: "#0066CC",
		fontSize: 14,
		fontWeight: "600",
	},
});
