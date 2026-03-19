// API Test Screen - Debug and monitor API status
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import apiTester from '../utils/apiTester';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const APITestScreen = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastTest, setLastTest] = useState(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLoading(true);
    try {
      const results = await apiTester.testAllAPIs();
      setTestResults(results);
      setLastTest(new Date().toLocaleString());
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (success, required = false) => {
    if (success) return colors.safe;
    return required ? colors.danger : colors.moderate;
  };

  const getStatusIcon = (success, required = false) => {
    if (success) return '✅';
    return required ? '❌' : '⚠️';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return colors.danger;
      case 'high': return colors.moderate;
      case 'medium': return colors.primary;
      default: return colors.safe;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={runTests} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>API Status Monitor</Text>
        <Text style={styles.subtitle}>Global API Health Check</Text>
        {lastTest && (
          <Text style={styles.lastTest}>Last tested: {lastTest}</Text>
        )}
      </View>

      {/* Test Button */}
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={runTests}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.backgroundAlt} />
        ) : (
          <Text style={styles.testButtonText}>Run Tests</Text>
        )}
      </TouchableOpacity>

      {testResults && (
        <>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Test Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{testResults.summary.successful}</Text>
                <Text style={styles.summaryLabel}>Working</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.moderate }]}>
                  {testResults.summary.failed}
                </Text>
                <Text style={styles.summaryLabel}>Failed</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: colors.primary }]}>
                  {testResults.summary.totalTime}
                </Text>
                <Text style={styles.summaryLabel}>Duration</Text>
              </View>
            </View>
            <View style={[
              styles.overallStatus,
              { backgroundColor: testResults.summary.overallStatus === 'READY' ? colors.safeLight : colors.moderateLight }
            ]}>
              <Text style={[
                styles.overallStatusText,
                { color: testResults.summary.overallStatus === 'READY' ? colors.safe : colors.moderate }
              ]}>
                {testResults.summary.overallStatus === 'READY' ? '🎉 All Systems Ready' : '⚠️ Setup Required'}
              </Text>
            </View>
          </View>

          {/* API Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Status Details</Text>
            {Object.entries(testResults.details).map(([apiName, result]) => (
              <View key={apiName} style={styles.apiCard}>
                <View style={styles.apiHeader}>
                  <Text style={styles.apiIcon}>
                    {getStatusIcon(result.success, result.required)}
                  </Text>
                  <View style={styles.apiInfo}>
                    <Text style={styles.apiName}>{apiName}</Text>
                    <Text style={[
                      styles.apiStatus,
                      { color: getStatusColor(result.success, result.required) }
                    ]}>
                      {result.success ? 'Active' : 'Failed'}
                      {result.required && ' (Required)'}
                    </Text>
                  </View>
                </View>
                
                {result.success && (
                  <View style={styles.apiDetails}>
                    {Object.entries(result).map(([key, value]) => {
                      if (key === 'success') return null;
                      return (
                        <View key={key} style={styles.apiDetailRow}>
                          <Text style={styles.apiDetailKey}>{key}:</Text>
                          <Text style={styles.apiDetailValue}>{String(value)}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {!result.success && (
                  <View style={styles.errorDetails}>
                    <Text style={styles.errorText}>{result.error}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Recommendations */}
          {testResults.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {testResults.recommendations.map((rec, index) => (
                <View key={index} style={[
                  styles.recommendationCard,
                  { borderLeftColor: getPriorityColor(rec.priority) }
                ]}>
                  <View style={styles.recommendationHeader}>
                    <Text style={[
                      styles.recommendationPriority,
                      { color: getPriorityColor(rec.priority) }
                    ]}>
                      {rec.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.recommendationAction}>{rec.action}</Text>
                  <Text style={styles.recommendationBenefit}>{rec.benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {/* API Usage Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>NewsAPI Status</Text>
              <Text style={styles.infoText}>
                ✅ Key configured: c076cd28d7d446aebe02d18fef6ce045
              </Text>
              <Text style={styles.infoText}>
                📊 Daily limit: 1,000 requests
              </Text>
              <Text style={styles.infoText}>
                🔄 Cache duration: 1 hour
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Free APIs</Text>
              <Text style={styles.infoText}>
                🗺️ OpenStreetMap: Global location data
              </Text>
              <Text style={styles.infoText}>
                🌍 Nominatim: Address lookup worldwide
              </Text>
              <Text style={styles.infoText}>
                🏛️ Travel Advisories: Government warnings
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  lastTest: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  testButton: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.backgroundAlt,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.safe,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  overallStatus: {
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  overallStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  apiCard: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  apiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  apiIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  apiInfo: {
    flex: 1,
  },
  apiName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  apiStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  apiDetails: {
    paddingLeft: spacing.xl,
  },
  apiDetailRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  apiDetailKey: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  apiDetailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  errorDetails: {
    paddingLeft: spacing.xl,
    paddingTop: spacing.xs,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    fontStyle: 'italic',
  },
  recommendationCard: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  recommendationHeader: {
    marginBottom: spacing.xs,
  },
  recommendationPriority: {
    fontSize: 12,
    fontWeight: '700',
  },
  recommendationAction: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recommendationBenefit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default APITestScreen;