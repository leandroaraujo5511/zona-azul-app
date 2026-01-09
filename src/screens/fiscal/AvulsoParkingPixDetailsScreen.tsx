import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	ScrollView,
	StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "@tanstack/react-query";
import Ionicons from "@expo/vector-icons/Ionicons";
import { avulsoParkingService } from "../../services/avulsoParking.service";
import { paymentService } from "../../services/payment.service";
import FiscalHeader from "../../components/fiscal/FiscalHeader";
import QrCodeDisplay from "../../components/fiscal/QrCodeDisplay";
import PixCodeDisplay from "../../components/fiscal/PixCodeDisplay";
import PaymentStatusMonitor from "../../components/fiscal/PaymentStatusMonitor";

type FiscalStackParamList = {
	AvulsoParkingPixDetails: { parkingId: string; paymentId: string } | undefined;
	AvulsoParkingDetails: { parkingId: string } | undefined;
};

type AvulsoParkingPixDetailsNavigationProp = NativeStackNavigationProp<
	FiscalStackParamList,
	"AvulsoParkingPixDetails"
>;

export default function AvulsoParkingPixDetailsScreen() {
	const navigation = useNavigation<AvulsoParkingPixDetailsNavigationProp>();
	const route = useRoute();
	const params = route.params as
		| { parkingId: string; paymentId: string }
		| undefined;

	const [paymentStatus, setPaymentStatus] = useState<string>("pending");

	// Fetch payment details (hooks must be called before early return)
	const { data: payment, isLoading: isLoadingPayment } = useQuery({
		queryKey: ["payment", params?.paymentId],
		queryFn: () => paymentService.getPaymentById(params!.paymentId),
		enabled: !!params?.paymentId,
		refetchInterval: paymentStatus === "pending" ? 5000 : false,
	});

	// Cancel parking mutation
	const cancelMutation = useMutation({
		mutationFn: () =>
			avulsoParkingService.cancelAvulsoParking(params!.parkingId),
		onSuccess: () => {
			Alert.alert("Sucesso", "Estacionamento cancelado com sucesso", [
				{
					text: "OK",
					onPress: () => navigation.goBack(),
				},
			]);
		},
		onError: (error: any) => {
			Alert.alert(
				"Erro",
				error.message || "Não foi possível cancelar o estacionamento."
			);
		},
	});

	if (!params?.parkingId || !params?.paymentId) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<FiscalHeader
					title="Erro"
					showBackButton
					onBackPress={() => navigation.goBack()}
				/>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Dados inválidos</Text>
				</View>
			</SafeAreaView>
		);
	}

	const handleCancel = () => {
		Alert.alert(
			"Cancelar Estacionamento",
			"Tem certeza que deseja cancelar este estacionamento? O QR Code PIX será invalidado.",
			[
				{
					text: "Não",
					style: "cancel",
				},
				{
					text: "Sim, Cancelar",
					style: "destructive",
					onPress: () => cancelMutation.mutate(),
				},
			]
		);
	};

	const handleViewParkingDetails = () => {
		navigation.navigate("AvulsoParkingDetails", {
			parkingId: params.parkingId,
		});
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const canCancel = paymentStatus === "pending" && !cancelMutation.isPending;

	const paymentRealized = payment?.status === "completed";

	const SuccessPayment = () => {
		if (!payment) return null;

		return (
			<View style={styles.successWrapper}>
				

				{/* Large Success Icon */}
				<View style={styles.successIconContainer}>
					<View style={styles.successIconCircle}>
						<Ionicons name="checkmark" size={64} color="#fff" />
					</View>
				</View>

				{/* Success Title */}
				<Text style={styles.successTitle}>Pagamento realizado com sucesso</Text>

				{/* Payment Details Card */}
				<View style={styles.paymentDetailsCard}>
					<View style={styles.paymentDetailRow}>
						<Text style={styles.paymentDetailLabel}>Valor Pago:</Text>
						<Text style={styles.paymentDetailValue}>
							{formatCurrency(payment.amount)}
						</Text>
					</View>
					<View style={styles.paymentDetailRow}>
						<Text style={styles.paymentDetailLabel}>Confirmado em:</Text>
						<Text style={styles.paymentDetailValue}>
							{formatDate(new Date().toISOString())}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	return (
		<>
			<StatusBar
				barStyle="light-content"
				backgroundColor="#1a1a1a"
				translucent={false}
			/>
			<SafeAreaView style={styles.safeArea} edges={["top"]}>
				<FiscalHeader
					title="QR Code PIX"
					showBackButton
					onBackPress={() => navigation.goBack()}
				/>

				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
				>
					{isLoadingPayment ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color="#2196F3" />
							<Text style={styles.loadingText}>Carregando informações...</Text>
						</View>
					) : payment ? (
						<>
							{/* Payment Status Monitor */}
							<PaymentStatusMonitor
								paymentId={params.paymentId}
								onStatusChange={setPaymentStatus}
								pollingInterval={5000}
							/>

							{paymentRealized ? (
								<>
									<SuccessPayment />
									{/* Actions for completed payment */}
									<View style={styles.actionsContainer}>
										<TouchableOpacity
											style={[styles.button, styles.detailsButton]}
											onPress={handleViewParkingDetails}
										>
											<Ionicons
												name="information-circle-outline"
												size={20}
												color="#fff"
											/>
											<Text style={styles.buttonText}>
												Ver Detalhes do Estacionamento
											</Text>
										</TouchableOpacity>
									</View>
								</>
							) : (
								<>
									{/* Amount */}
									<View style={styles.infoCard}>
										<View style={styles.infoRow}>
											<Text style={styles.infoLabel}>Valor a Pagar:</Text>
											<Text style={styles.infoValue}>
												{formatCurrency(payment.amount)}
											</Text>
										</View>
									</View>

									{/* QR Code */}
									{payment.qrCode ? (
										<View style={styles.qrCodeSection}>
											<Text style={styles.sectionTitle}>
												Escaneie o QR Code
											</Text>
											<QrCodeDisplay qrCodeBase64={payment.qrCode} size={250} />
										</View>
									) : (
										<View style={styles.qrCodeSection}>
											<Text style={styles.sectionTitle}>
												Escaneie o QR Code
											</Text>
											<View style={styles.qrCodePlaceholder}>
												<Ionicons
													name="qr-code-outline"
													size={64}
													color="#999"
												/>
												<Text style={styles.placeholderText}>
													QR Code não disponível
												</Text>
											</View>
										</View>
									)}

									{/* PIX Code */}
									{payment.qrCodeText && (
										<PixCodeDisplay pixCode={payment.qrCodeText} />
									)}

									{/* Expiration */}
									{payment.expiresAt && (
										<View style={styles.infoCard}>
											<View style={styles.infoRow}>
												<Ionicons name="time-outline" size={16} color="#666" />
												<Text style={styles.infoLabel}>Expira em:</Text>
												<Text style={styles.infoValue}>
													{formatDate(payment.expiresAt)}
												</Text>
											</View>
										</View>
									)}
								</>
							)}
							{/* Actions - Only show if payment not completed */}
							{!paymentRealized && (
								<View style={styles.actionsContainer}>
									{canCancel && (
										<TouchableOpacity
											style={[styles.button, styles.cancelButton]}
											onPress={handleCancel}
											disabled={cancelMutation.isPending}
										>
											{cancelMutation.isPending ? (
												<ActivityIndicator color="#fff" />
											) : (
												<>
													<Ionicons
														name="close-circle-outline"
														size={20}
														color="#fff"
													/>
													<Text style={styles.buttonText}>
														Cancelar Estacionamento
													</Text>
												</>
											)}
										</TouchableOpacity>
									)}

									<TouchableOpacity
										style={[styles.button, styles.detailsButton]}
										onPress={handleViewParkingDetails}
									>
										<Ionicons
											name="information-circle-outline"
											size={20}
											color="#fff"
										/>
										<Text style={styles.buttonText}>
											Ver Detalhes do Estacionamento
										</Text>
									</TouchableOpacity>
								</View>
							)}
						</>
					) : (
						<View style={styles.errorContainer}>
							<Ionicons name="alert-circle-outline" size={48} color="#f44336" />
							<Text style={styles.errorText}>Pagamento não encontrado</Text>
						</View>
					)}
				</ScrollView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#1a1a1a",
	},
	scrollView: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	scrollContent: {
		padding: 16,
	},
	loadingContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 48,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 14,
		color: "#666",
	},
	infoCard: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	infoLabel: {
		fontSize: 14,
		color: "#666",
		fontWeight: "600",
	},
	infoValue: {
		fontSize: 16,
		color: "#1a1a1a",
		fontWeight: "600",
		marginLeft: "auto",
	},
	qrCodeSection: {
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1a1a1a",
		marginBottom: 16,
	},
	actionsContainer: {
		gap: 12,
		marginTop: 8,
	},
	button: {
		borderRadius: 8,
		paddingVertical: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	cancelButton: {
		backgroundColor: "#f44336",
	},
	detailsButton: {
		backgroundColor: "#2196F3",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	errorContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 48,
	},
	errorText: {
		marginTop: 16,
		fontSize: 16,
		color: "#f44336",
		fontWeight: "600",
	},
	qrCodePlaceholder: {
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
		minHeight: 250,
	},
	placeholderText: {
		marginTop: 16,
		fontSize: 14,
		color: "#999",
	},
	successWrapper: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 24,
        marginTop: 54,
	},
	successBanner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E8F5E9",
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 20,
		marginBottom: 36,
		width: "100%",
		gap: 8,
	},
	successBannerText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#4CAF50",
	},
	successMessage: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		marginBottom: 32,
		lineHeight: 20,
	},
	successIconContainer: {
		marginBottom: 54,
	},
	successIconCircle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#4CAF50",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#4CAF50",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	successTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#4CAF50",
		textAlign: "center",
		marginBottom: 24,
	},
	paymentDetailsCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		width: "100%",
		borderWidth: 1,
		borderColor: "#e0e0e0",
		marginBottom: 36,
	},
	paymentDetailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	paymentDetailLabel: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	paymentDetailValue: {
		fontSize: 16,
		color: "#1a1a1a",
		fontWeight: "600",
	},
});
