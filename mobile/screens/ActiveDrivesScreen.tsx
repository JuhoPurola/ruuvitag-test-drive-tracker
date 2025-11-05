import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import CustomAlert from '../components/CustomAlert';

interface TestDrive {
  id: string;
  status: string;
  startTime: string;
  endTime: string | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  salesPerson: {
    id: string;
    name: string;
  };
}

export default function ActiveDrivesScreen() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirm';
    onConfirm?: () => void;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const fetchTestDrives = async () => {
    try {
      setError(null);
      const response = await axios.get(API_ENDPOINTS.testDrives);
      if (response.data.success) {
        // Only show active test drives
        const active = response.data.data.filter(
          (drive: TestDrive) => drive.status.toLowerCase() === 'active'
        );
        setTestDrives(active);
      }
    } catch (err) {
      setError('Failed to fetch test drives');
      console.error('Error fetching test drives:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTestDrives, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTestDrives();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTestDrives();
  };

  const handleEndTestDrive = async (testDriveId: string) => {
    setAlertConfig({
      visible: true,
      title: 'End Test Drive',
      message: 'Are you sure you want to end this test drive?',
      type: 'confirm',
      onConfirm: () => confirmEndTestDrive(testDriveId),
    });
  };

  const confirmEndTestDrive = async (testDriveId: string) => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    try {
      await axios.put(`${API_ENDPOINTS.testDrives}/${testDriveId}`, {
        status: 'completed',
        endTime: new Date().toISOString(),
      });
      fetchTestDrives();
      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Test drive ended successfully',
        type: 'success',
      });
    } catch (err) {
      console.error('Error ending test drive:', err);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to end test drive',
        type: 'error',
      });
    }
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const renderTestDrive = ({ item }: { item: TestDrive }) => {
    const durationMinutes = Math.floor(
      (Date.now() - new Date(item.startTime).getTime()) / 60000
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleText}>
              {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}
            </Text>
            <Text style={styles.licensePlate}>{item.vehicle.color}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>ACTIVE</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>CUSTOMER</Text>
            <Text style={styles.infoText}>{item.customer.name}</Text>
            <Text style={styles.infoSubtext}>{item.customer.phone}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>SALESPERSON</Text>
            <Text style={styles.infoText}>{item.salesPerson.name}</Text>
          </View>

          <View style={styles.timeSection}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Started</Text>
              <Text style={styles.timeValue}>
                {new Date(item.startTime).toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Duration</Text>
              <Text style={styles.durationValue}>{durationMinutes} min</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.endButton}
          onPress={() => handleEndTestDrive(item.id)}
        >
          <Text style={styles.endButtonText}>End Test Drive</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Test Drives</Text>
        <Text style={styles.subtitle}>{testDrives.length} in progress</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={testDrives}
        renderItem={renderTestDrive}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No active test drives</Text>
            <Text style={styles.emptySubtext}>
              Start a new test drive from the Start tab
            </Text>
          </View>
        }
      />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm || closeAlert}
        onCancel={closeAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#10B981',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  durationValue: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    textAlign: 'center',
  },
});
