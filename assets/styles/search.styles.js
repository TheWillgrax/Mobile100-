import { StyleSheet } from "react-native";

import { responsiveFontSize } from "../../utils/responsive";

export const createSearchStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: responsiveFontSize(15),
      color: theme.text,
    },
    clearButton: {
      padding: 4,
    },
    resultsSection: {
      flex: 1,
      paddingHorizontal: 16,
      marginTop: 8,
    },
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      marginTop: 16,
    },
    resultsTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
    },
    resultsCount: {
      fontSize: responsiveFontSize(13),
      color: theme.textLight,
      fontWeight: "500",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    recipesGrid: {
      gap: 16,
      paddingBottom: 32,
    },
    row: {
      justifyContent: "space-between",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 64,
    },
    emptyTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: responsiveFontSize(14),
      color: theme.textLight,
      textAlign: "center",
      lineHeight: responsiveFontSize(20),
      paddingHorizontal: 24,
    },
  });
