import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "../services/vehicle.service";
import { VehicleType } from "../types/api";
import ScreenHeader from "../components/ScreenHeader";

type RootStackParamList = {
	VehicleForm: { vehicleId?: string };
	Vehicles: undefined;
};

type VehicleFormScreenNavigationProp = NativeStackNavigationProp<
	RootStackParamList,
	"VehicleForm"
>;
type VehicleFormScreenRouteProp = RouteProp<RootStackParamList, "VehicleForm">;

export default function VehicleFormScreen() {
	const navigation = useNavigation<VehicleFormScreenNavigationProp>();
	const route = useRoute<VehicleFormScreenRouteProp>();
	const queryClient = useQueryClient();
	const { vehicleId } = route.params || {};

	const isEditing = !!vehicleId;

	const [plate, setPlate] = useState("");
	const [nickname, setNickname] = useState("");
	const [vehicleType, setVehicleType] = useState<VehicleType>("car");
	const [isDefault, setIsDefault] = useState(false);

	// Load vehicle if editing
	const { data: vehicleData, isLoading: isLoadingVehicle } = useQuery({
		queryKey: ["vehicle", vehicleId],
		queryFn: () => vehicleService.getVehicleById(vehicleId!),
		enabled: isEditing,
	});

	useEffect(() => {
		if (vehicleData) {
			setPlate(vehicleData.plate);
			setNickname(vehicleData.nickname || "");
			setVehicleType(vehicleData.vehicleType);
			setIsDefault(vehicleData.isDefault);
		}
	}, [vehicleData]);

	const createMutation = useMutation({
		mutationFn: (data: {
			plate: string;
			vehicleType: VehicleType;
			nickname?: string | null;
			isDefault: boolean;
		}) => vehicleService.createVehicle(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vehicles"] });
			Alert.alert("Sucesso", "Veículo cadastrado com sucesso", [
				{ text: "OK", onPress: () => navigation.navigate("Vehicles") },
			]);
		},
		onError: (error: any) => {
			Alert.alert("Erro", error.message || "Erro ao cadastrar veículo");
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: { nickname?: string | null; isDefault?: boolean }) =>
			vehicleService.updateVehicle(vehicleId!, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vehicles"] });
			queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
			Alert.alert("Sucesso", "Veículo atualizado com sucesso", [
				{ text: "OK", onPress: () => navigation.navigate("Vehicles") },
			]);
		},
		onError: (error: any) => {
			Alert.alert("Erro", error.message || "Erro ao atualizar veículo");
		},
	});

	const handleSubmit = () => {
		// Validate plate
		if (!plate.trim()) {
			Alert.alert("Erro", "Por favor, informe a placa do veículo");
			return;
		}

		// Normalize plate (remove spaces and convert to uppercase)
		const normalizedPlate = plate.trim().replace(/\s/g, "").toUpperCase();

		if (isEditing) {
			updateMutation.mutate({ nickname: nickname.trim() || null, isDefault });
		} else {
			createMutation.mutate({
				plate: normalizedPlate,
				vehicleType,
				nickname: nickname.trim() || null,
				isDefault,
			});
		}
	};

	const isLoading =
		createMutation.isPending || updateMutation.isPending || isLoadingVehicle;

	return (
		<>
			<StatusBar
				barStyle="light-content"
				backgroundColor="#1a1a1a"
				translucent={false}
			/>
			<SafeAreaView style={styles.safeArea} edges={["top"]}>
        <>
        <ScreenHeader
								title={isEditing ? "Editar Veículo" : "Novo Veículo"}
							/>
				<KeyboardAvoidingView
					style={styles.container}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.content}>
							<View style={styles.form}>
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Placa *</Text>
									<TextInput
										style={[styles.input, isEditing && styles.inputDisabled]}
										placeholder="ABC1234"
										placeholderTextColor="#666666"
										value={plate}
										onChangeText={setPlate}
										autoCapitalize="characters"
										maxLength={7}
										editable={!isEditing && !isLoading}
									/>
									{isEditing && (
										<Text style={styles.helpText}>
											A placa não pode ser alterada
										</Text>
									)}
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.label}>Tipo de Veículo *</Text>
									<View style={styles.typeContainer}>
										{(["car", "motorcycle", "other"] as VehicleType[]).map(
											(type) => (
												<TouchableOpacity
													key={type}
													style={[
														styles.typeButton,
														vehicleType === type && styles.typeButtonActive,
														isEditing && styles.typeButtonDisabled,
													]}
													onPress={() => !isEditing && setVehicleType(type)}
													disabled={isEditing || isLoading}
												>
													<Text
														style={[
															styles.typeButtonText,
															vehicleType === type &&
																styles.typeButtonTextActive,
														]}
													>
														{type === "car"
															? "Carro"
															: type === "motorcycle"
															? "Moto"
															: "Outro"}
													</Text>
												</TouchableOpacity>
											)
										)}
									</View>
								</View>

								<View style={styles.inputContainer}>
									<Text style={styles.label}>Apelido (opcional)</Text>
									<TextInput
										style={styles.input}
										placeholder="Ex: Carro da família"
										placeholderTextColor="#666666"
										value={nickname}
										onChangeText={setNickname}
										editable={!isLoading}
									/>
								</View>

								<View style={styles.checkboxContainer}>
									<TouchableOpacity
										style={styles.checkbox}
										onPress={() => !isLoading && setIsDefault(!isDefault)}
										disabled={isLoading}
									>
										<View
											style={[
												styles.checkboxBox,
												isDefault && styles.checkboxBoxChecked,
											]}
										>
											{isDefault && (
												<Text style={styles.checkboxCheckmark}>✓</Text>
											)}
										</View>
										<Text style={styles.checkboxLabel}>
											Definir como veículo padrão
										</Text>
									</TouchableOpacity>
								</View>

								<TouchableOpacity
									style={[styles.button, isLoading && styles.buttonDisabled]}
									onPress={handleSubmit}
									disabled={isLoading}
								>
									{isLoading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.buttonText}>
											{isEditing ? "Atualizar" : "Cadastrar"}
										</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
        </>
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
		padding: 16,
	},
	content: {
		width: "100%",
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
		marginBottom: 8,
	},
	input: {
		borderWidth: 2,
		borderColor: "#333333",
		borderRadius: 16,
		padding: 16,
		fontSize: 16,
		backgroundColor: "#2a2a2a",
		color: "#ffffff",
	},
	inputDisabled: {
		backgroundColor: "#2a2a2a",
		color: "#666666",
		borderColor: "#333333",
	},
	helpText: {
		fontSize: 12,
		color: "#666666",
		marginTop: 4,
	},
	typeContainer: {
		flexDirection: "row",
		gap: 12,
	},
	typeButton: {
		flex: 1,
		borderWidth: 2,
		borderColor: "#333333",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		backgroundColor: "#2a2a2a",
	},
	typeButtonActive: {
		borderColor: "#0066CC",
		backgroundColor: "#0066CC",
	},
	typeButtonDisabled: {
		backgroundColor: "#2a2a2a",
		borderColor: "#333333",
	},
	typeButtonText: {
		fontSize: 14,
		color: "#999999",
		fontWeight: "600",
	},
	typeButtonTextActive: {
		color: "#ffffff",
	},
	checkboxContainer: {
		marginBottom: 24,
	},
	checkbox: {
		flexDirection: "row",
		alignItems: "center",
	},
	checkboxBox: {
		width: 24,
		height: 24,
		borderWidth: 2,
		borderColor: "#333333",
		borderRadius: 6,
		marginRight: 12,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#2a2a2a",
	},
	checkboxBoxChecked: {
		borderColor: "#0066CC",
		backgroundColor: "#0066CC",
	},
	checkboxCheckmark: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "bold",
	},
	checkboxLabel: {
		fontSize: 14,
		color: "#ffffff",
	},
	button: {
		backgroundColor: "#0066CC",
		borderRadius: 16,
		padding: 18,
		alignItems: "center",
		justifyContent: "center",
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
		fontSize: 16,
		fontWeight: "bold",
	},
});
