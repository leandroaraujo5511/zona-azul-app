import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	RefreshControl,
	StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "../services/credit.service";
import { CreditTransaction } from "../types/api";
import ScreenHeader from "../components/ScreenHeader";

export default function CreditHistoryScreen() {
	const [filterType, setFilterType] = useState<
		"credit" | "debit" | "refund" | "all"
	>("all");

	const {
		data: transactionsData,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["creditTransactions", filterType],
		queryFn: () =>
			creditService.getTransactions({
				type: filterType === "all" ? undefined : filterType,
				limit: 50,
			}),
	});

	const transactions = transactionsData?.data || [];

	const getTypeColor = (type: string) => {
		switch (type) {
			case "credit":
				return "#28a745";
			case "debit":
				return "#dc3545";
			case "refund":
				return "#ffc107";
			default:
				return "#666666";
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "credit":
				return "Crédito";
			case "debit":
				return "Débito";
			case "refund":
				return "Reembolso";
			default:
				return type;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatAmount = (amount: number) => {
		return `R$ ${amount.toFixed(2).replace(".", ",")}`;
	};

	const TransactionCard = ({
		transaction,
	}: {
		transaction: CreditTransaction;
	}) => {
		const typeColor = getTypeColor(transaction.type);
		const isPositive =
			transaction.type === "credit" || transaction.type === "refund";

		return (
			<View style={styles.transactionCard}>
				<View style={styles.transactionHeader}>
					<View style={styles.transactionInfo}>
						<Text style={styles.transactionType}>
							{getTypeLabel(transaction.type)}
						</Text>
						<Text style={styles.transactionDate}>
							{formatDate(transaction.createdAt)}
						</Text>
					</View>
					<View
						style={[
							styles.transactionAmountContainer,
							{ backgroundColor: `${typeColor}15` },
						]}
					>
						<Text style={[styles.transactionAmount, { color: typeColor }]}>
							{isPositive ? "+" : "-"}
							{formatAmount(Math.abs(transaction.amount))}
						</Text>
					</View>
				</View>
				<Text style={styles.transactionDescription}>
					{transaction.description}
				</Text>
				<View style={styles.transactionFooter}>
					<Text style={styles.transactionBalance}>
						Saldo após: {formatAmount(transaction.balanceAfter)}
					</Text>
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
				<View style={styles.container}>
					<ScreenHeader title="Histórico de Transações" />
        <>
					{/* Filters */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filtersContainer}
						contentContainerStyle={styles.filtersContent}
					>
						{(["all", "credit", "debit", "refund"] as const).map((type) => (
							<TouchableOpacity
								key={type}
								style={[
									styles.filterButton,
									filterType === type && styles.filterButtonActive,
								]}
								onPress={() => setFilterType(type)}
							>
								<Text
									style={[
										styles.filterButtonText,
										filterType === type && styles.filterButtonTextActive,
									]}
								>
									{type === "all" ? "Todos" : getTypeLabel(type)}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>

					{/* Transactions List */}
					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color="#0066CC" />
						</View>
					) : transactions.length === 0 ? (
						<ScrollView
							contentContainerStyle={styles.emptyContainer}
							refreshControl={
								<RefreshControl
									refreshing={isRefetching}
									onRefresh={refetch}
									tintColor="#ffffff"
									colors={["#0066CC"]}
								/>
							}
						>
							<Text style={styles.emptyIcon}>📋</Text>
							<Text style={styles.emptyTitle}>
								Nenhuma transação encontrada
							</Text>
							<Text style={styles.emptyText}>
								{filterType === "all"
									? "Você ainda não possui transações"
									: `Nenhuma transação do tipo "${getTypeLabel(
											filterType
									  )}" encontrada`}
							</Text>
						</ScrollView>
					) : (
						<ScrollView
							style={styles.transactionsList}
							contentContainerStyle={styles.transactionsListContent}
							refreshControl={
								<RefreshControl
									refreshing={isRefetching}
									onRefresh={refetch}
									tintColor="#ffffff"
									colors={["#0066CC"]}
								/>
							}
						>
							{transactions.map((transaction) => (
								<TransactionCard
									key={transaction.id}
									transaction={transaction}
								/>
							))}
						</ScrollView>
					)}
          </>
				</View>
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
	filtersContainer: {
		backgroundColor: "#1a1a1a",
		borderBottomWidth: 1,
		borderBottomColor: "#333333",
		width: "100%",
    maxHeight: 60,
	},
	filtersContent: {
		marginTop: 12,
		paddingHorizontal: 12,
		gap: 8,
		height: 40,
	},
	filterButton: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: "#2a2a2a",
		borderWidth: 1,
		borderColor: "#333333",
		marginRight: 8,
	},
	filterButtonActive: {
		backgroundColor: "#0066CC",
		borderColor: "#0066CC",
	},
	filterButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666666",
	},
	filterButtonTextActive: {
		color: "#ffffff",
		fontWeight: "600",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1a1a1a",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#ffffff",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 14,
		color: "#999999",
		textAlign: "center",
	},
	transactionsList: {
		flex: 1,
	},
	transactionsListContent: {
		padding: 16,
	},
	transactionCard: {
		backgroundColor: "#2a2a2a",
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#333333",
	},
	transactionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	transactionInfo: {
		flex: 1,
	},
	transactionType: {
		fontSize: 16,
		fontWeight: "600",
		color: "#ffffff",
		marginBottom: 4,
	},
	transactionDate: {
		fontSize: 12,
		color: "#999999",
	},
	transactionAmountContainer: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	transactionAmount: {
		fontSize: 18,
		fontWeight: "bold",
	},
	transactionDescription: {
		fontSize: 14,
		color: "#999999",
		marginBottom: 8,
	},
	transactionFooter: {
		borderTopWidth: 1,
		borderTopColor: "#333333",
		paddingTop: 8,
	},
	transactionBalance: {
		fontSize: 12,
		color: "#666666",
	},
});
