import { Dimensions, StyleSheet } from "react-native";

import { responsiveFontSize } from "../../utils/responsive";

const { height } = Dimensions.get("window");

export const createRecipeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    image: {
      width: "92%",
      height: 230,
      alignSelf: "center",
      borderRadius: 16,
      marginTop: 8,
      backgroundColor: theme.surface,
    },
    headerContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
    title: {
      fontSize: responsiveFontSize(20),
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: theme.card,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
    },
    metaText: {
      fontSize: responsiveFontSize(13),
      color: theme.textLight,
      fontWeight: "600",
    },
    section: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    listItem: {
      fontSize: responsiveFontSize(14),
      color: theme.text,
      marginBottom: 6,
      lineHeight: responsiveFontSize(20),
    },
    stepItem: {
      fontSize: responsiveFontSize(14),
      color: theme.textLight,
      marginBottom: 8,
      lineHeight: responsiveFontSize(20),
    },
  });

export const createRecipeDetailStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerContainer: {
      height: height * 0.5,
      position: "relative",
    },
    imageContainer: {
      ...StyleSheet.absoluteFillObject,
    },
    headerImage: {
      width: "100%",
      height: "120%",
    },
    gradientOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "60%",
    },
    floatingButtons: {
      position: "absolute",
      top: 50,
      left: 16,
      right: 16,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    floatingButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    titleSection: {
      position: "absolute",
      bottom: 30,
      left: 16,
      right: 16,
    },
    categoryBadge: {
      alignSelf: "flex-start",
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 12,
    },
    categoryText: {
      color: theme.white,
      fontSize: responsiveFontSize(12),
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    recipeTitle: {
      fontSize: responsiveFontSize(28),
      fontWeight: "bold",
      color: theme.white,
      marginBottom: 8,
      textShadowColor: "rgba(0,0,0,0.75)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
    },
    locationText: {
      color: theme.white,
      fontSize: responsiveFontSize(15),
      fontWeight: "500",
      textShadowColor: "rgba(0,0,0,0.75)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    contentSection: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      marginTop: -30,
      paddingTop: 30,
      paddingHorizontal: 16,
      paddingBottom: 40,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 32,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    statValue: {
      fontSize: responsiveFontSize(18),
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: responsiveFontSize(12),
      color: theme.textLight,
      textAlign: "center",
      fontWeight: "500",
    },
    sectionContainer: {
      marginBottom: 32,
    },
    sectionTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: responsiveFontSize(18),
      fontWeight: "700",
      color: theme.text,
    },
    sectionDescription: {
      color: theme.textLight,
      fontSize: responsiveFontSize(13),
    },
  });
