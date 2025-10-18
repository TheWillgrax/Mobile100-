import { Dimensions, StyleSheet } from "react-native";

import { responsiveFontSize, scale } from "../../utils/responsive";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export const createHomeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    welcomeSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    welcomeTextContainer: {
      flex: 1,
      marginRight: 16,
    },
    welcomeText: {
      fontSize: responsiveFontSize(28),
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    welcomeSubtitle: {
      marginTop: 4,
      fontSize: responsiveFontSize(14),
      color: theme.textLight,
    },
    signInButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
    },
    signInButtonText: {
      color: theme.white,
      fontSize: responsiveFontSize(14),
      fontWeight: "700",
    },
    welcomeIcons: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    featuredSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    featuredCard: {
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: theme.card,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 12,
    },
    featuredImageContainer: {
      height: 240,
      backgroundColor: theme.primary,
      position: "relative",
    },
    featuredImage: {
      width: "100%",
      height: "100%",
    },
    featuredOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "space-between",
      padding: 20,
    },
    featuredBadge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    featuredBadgeText: {
      color: theme.white,
      fontSize: responsiveFontSize(12),
      fontWeight: "600",
    },
    featuredContent: {
      justifyContent: "flex-end",
    },
    featuredTitle: {
      fontSize: responsiveFontSize(22),
      fontWeight: "800",
      color: theme.white,
      marginBottom: 12,
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    featuredMeta: {
      flexDirection: "row",
      gap: 16,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: responsiveFontSize(13),
      color: theme.white,
      fontWeight: "600",
    },
    recipesSection: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(20),
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    recipesGrid: {
      gap: 16,
    },
    row: {
      justifyContent: "space-between",
      gap: 16,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 64,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: responsiveFontSize(14),
      color: theme.textLight,
      textAlign: "center",
    },
    categoryFilterContainer: {
      marginVertical: 16,
    },
    categoryFilterScrollContent: {
      paddingHorizontal: 16,
      gap: 12,
    },
    categoryButton: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      minWidth: scale(90),
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedCategory: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      shadowOpacity: 0.15,
    },
    categoryImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
    },
    selectedCategoryImage: {
      borderColor: theme.white,
    },
    categoryText: {
      marginTop: 6,
      fontSize: responsiveFontSize(12),
      color: theme.text,
    },
    selectedCategoryText: {
      color: theme.white,
    },
    card: {
      width: cardWidth,
    },
  });
