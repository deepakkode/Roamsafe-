// TaxiVerificationScreen - Verify taxi credentials
// Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import taxiService from '../services/taxiService';
import { colors, spacing, borderRadius, typography, buttonSizes } from '../styles/theme';

const TaxiVerificationScreen = () => {
  const [plateNumber, setPlateNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Handle text input (Requirement 4.2)
  const handleTextInput = (text) => {
    // Input validation: max length 15 (Requirement 4.6)
    if (text.length <= 15) {
      setPlateNumber(text.toUpperCase());
      setError('');
      setVerificationResult(null);
    }
  };

  // Simulate QR/barcode scanning (Requirement 4.3)
  const simulateScan = async () => {
    try {
      const scanResult = await taxiService.scanTaxiCode();
      if (scanResult.success) {
        setPlateNumber(scanResult.plateNumber);
        setError('');
        setVerificationResult(null);
      }
    } catch (error) {
      setError('Scan failed - please enter manually');
    }
  };

  // Verify taxi with real API (Requirement 4.4)
  const verifyTaxi = async () => {
    // Input validation: empty check (Requirement 4.6)
    if (!plateNumber.trim()) {
      setError('Please enter a plate number');
      return;
    }

    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    try {
      // Use real taxi verification service
      const verification = await taxiService.verifyTaxi(plateNumber.trim());
      setVerificationResult(verification);
    } catch (error) {
      console.error('Taxi verification error:', error);
      setError('Verification failed - ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }

    return stars.join('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Taxi Verification</Text>
        <Text style={styles.subtitle}>
          Verify taxi credentials before entering to ensure your safety
        </Text>

        {/* Text input for plate number (Requirement 4.2) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Taxi Plate Number</Text>
          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={handleTextInput}
            placeholder="e.g., B-7834-FX"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            maxLength={15}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.scanButton]}
            onPress={simulateScan}
          >
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.verifyButton]}
            onPress={verifyTaxi}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Verify Taxi</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Verification results */}
        {verificationResult && (
          <View style={[
            styles.resultContainer,
            verificationResult.isTaxiRegistered ? styles.resultSuccess : styles.resultWarning
          ]}>
            {verificationResult.isTaxiRegistered ? (
              <>
                <Text style={styles.resultTitle}>RTO Verified Taxi</Text>
                
                {/* RTO Registration Details */}
                <View style={styles.rtoSection}>
                  <Text style={styles.sectionTitle}>RTO Registration</Text>
                  <View style={styles.resultDetails}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>State:</Text>
                      <Text style={styles.resultValue}>{verificationResult.state.name}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Vehicle Class:</Text>
                      <Text style={styles.resultValue}>{verificationResult.vehicleDetails.vehicleClass}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Fuel Type:</Text>
                      <Text style={styles.resultValue}>{verificationResult.vehicleDetails.fuelType}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Registration:</Text>
                      <Text style={styles.resultValue}>{verificationResult.vehicleDetails.registrationDate}</Text>
                    </View>
                  </View>
                </View>

                {/* Safety Rating */}
                <View style={styles.safetySection}>
                  <Text style={styles.sectionTitle}>Safety Rating</Text>
                  <View style={[styles.safetyRating, { backgroundColor: verificationResult.safetyRating.color + '20' }]}>
                    <Text style={[styles.safetyScore, { color: verificationResult.safetyRating.color }]}>
                      {verificationResult.safetyRating.score}/100
                    </Text>
                    <Text style={[styles.safetyGrade, { color: verificationResult.safetyRating.color }]}>
                      {verificationResult.safetyRating.grade}
                    </Text>
                  </View>
                </View>

                {/* Document Status */}
                <View style={styles.documentsSection}>
                  <Text style={styles.sectionTitle}>Document Status</Text>
                  <View style={styles.documentGrid}>
                    <View style={styles.documentItem}>
                      <Text style={styles.documentLabel}>Fitness</Text>
                      <Text style={[styles.documentStatus, 
                        verificationResult.documentStatus.fitness.valid ? styles.validDoc : styles.expiredDoc]}>
                        {verificationResult.documentStatus.fitness.valid ? 'Valid' : 'Expired'}
                      </Text>
                      <Text style={styles.documentExpiry}>
                        {verificationResult.documentStatus.fitness.daysLeft > 0 
                          ? `${verificationResult.documentStatus.fitness.daysLeft} days left`
                          : 'Expired'}
                      </Text>
                    </View>
                    <View style={styles.documentItem}>
                      <Text style={styles.documentLabel}>Insurance</Text>
                      <Text style={[styles.documentStatus, 
                        verificationResult.documentStatus.insurance.valid ? styles.validDoc : styles.expiredDoc]}>
                        {verificationResult.documentStatus.insurance.valid ? 'Valid' : 'Expired'}
                      </Text>
                      <Text style={styles.documentExpiry}>
                        {verificationResult.documentStatus.insurance.daysLeft > 0 
                          ? `${verificationResult.documentStatus.insurance.daysLeft} days left`
                          : 'Expired'}
                      </Text>
                    </View>
                    <View style={styles.documentItem}>
                      <Text style={styles.documentLabel}>PUC</Text>
                      <Text style={[styles.documentStatus, 
                        verificationResult.documentStatus.puc.valid ? styles.validDoc : styles.expiredDoc]}>
                        {verificationResult.documentStatus.puc.valid ? 'Valid' : 'Expired'}
                      </Text>
                      <Text style={styles.documentExpiry}>
                        {verificationResult.documentStatus.puc.daysLeft > 0 
                          ? `${verificationResult.documentStatus.puc.daysLeft} days left`
                          : 'Expired'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Safety Tips */}
                <View style={styles.tipsSection}>
                  <Text style={styles.sectionTitle}>Safety Tips</Text>
                  {verificationResult.safetyTips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>{tip}</Text>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.resultTitle}>RTO Verification Failed</Text>
                
                {verificationResult.isRegistered === false ? (
                  <View style={styles.warningSection}>
                    <Text style={styles.warningText}>
                      This vehicle is NOT registered in the RTO database
                    </Text>
                    <Text style={styles.warningSubtext}>
                      State: {verificationResult.state.name}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.warningSection}>
                    <Text style={styles.warningText}>
                      This vehicle is registered but NOT as a taxi
                    </Text>
                    <Text style={styles.warningSubtext}>
                      Vehicle Class: {verificationResult.vehicleDetails?.vehicleClass || 'Unknown'}
                    </Text>
                  </View>
                )}

                {/* Warnings */}
                <View style={styles.warningsSection}>
                  <Text style={styles.sectionTitle}>Warnings</Text>
                  {verificationResult.warnings?.map((warning, index) => (
                    <Text key={index} style={styles.warningItem}>{warning}</Text>
                  ))}
                </View>

                {/* Recommendations */}
                <View style={styles.recommendationsSection}>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {verificationResult.recommendations?.map((rec, index) => (
                    <Text key={index} style={styles.recommendationItem}>{rec}</Text>
                  ))}
                </View>

                {/* Nearby Alternatives */}
                {verificationResult.alternativesNearby && verificationResult.alternativesNearby.length > 0 && (
                  <View style={styles.alternativesSection}>
                    <Text style={styles.sectionTitle}>🚕 Nearby Verified Taxis</Text>
                    {verificationResult.alternativesNearby.map((alt, index) => (
                      <View key={index} style={styles.alternativeItem}>
                        <Text style={styles.alternativeName}>{alt.name}</Text>
                        <Text style={styles.alternativeDistance}>{alt.distance}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    color: colors.text,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    height: buttonSizes.medium.height,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  verifyButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
  resultContainer: {
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    borderLeftWidth: 4,
  },
  resultSuccess: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.safe,
  },
  resultWarning: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.danger,
  },
  resultTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  resultDetails: {
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    ...typography.body,
    fontWeight: 'bold',
    width: 80,
  },
  resultValue: {
    ...typography.body,
    flex: 1,
  },
  resultFooter: {
    ...typography.bodySecondary,
    fontStyle: 'italic',
  },
  warningText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  warningAdvice: {
    ...typography.bodySecondary,
  },
  
  // New styles for enhanced RTO verification
  rtoSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  safetySection: {
    marginBottom: spacing.md,
  },
  safetyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    justifyContent: 'space-between',
  },
  safetyScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  safetyGrade: {
    fontSize: 18,
    fontWeight: '600',
  },
  documentsSection: {
    marginBottom: spacing.md,
  },
  documentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  documentItem: {
    width: '30%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  documentLabel: {
    ...typography.caption,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  documentStatus: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  validDoc: {
    color: colors.safe,
  },
  expiredDoc: {
    color: colors.danger,
  },
  documentExpiry: {
    ...typography.caption,
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: spacing.md,
  },
  tipText: {
    ...typography.body,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  warningSection: {
    backgroundColor: colors.danger + '20',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  warningSubtext: {
    ...typography.bodySecondary,
    marginTop: spacing.xs,
  },
  warningsSection: {
    marginBottom: spacing.md,
  },
  warningItem: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  recommendationsSection: {
    marginBottom: spacing.md,
  },
  recommendationItem: {
    ...typography.body,
    color: colors.safe,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  alternativesSection: {
    marginTop: spacing.md,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.small,
    marginBottom: spacing.xs,
  },
  alternativeName: {
    ...typography.body,
    flex: 1,
  },
  alternativeDistance: {
    ...typography.bodySecondary,
  },
});

export default TaxiVerificationScreen;
