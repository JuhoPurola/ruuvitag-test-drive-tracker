import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import CustomAlert from '../components/CustomAlert';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  available: boolean;
  ruuviTagMac: string | null;
}

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    vin: '',
    color: '',
    ruuviTagMac: '',
  });

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirm';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.vehicles);
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleAddVehicle = async () => {
    if (
      !newVehicle.make ||
      !newVehicle.model ||
      !newVehicle.year ||
      !newVehicle.vin ||
      !newVehicle.color
    ) {
      setAlertConfig({
        visible: true,
        message: 'Please fill in all required fields',
        type: 'info',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(API_ENDPOINTS.vehicles, {
        make: newVehicle.make,
        model: newVehicle.model,
        year: parseInt(newVehicle.year, 10),
        vin: newVehicle.vin,
        color: newVehicle.color,
        ruuviTagMac: newVehicle.ruuviTagMac || null,
      });

      if (response.data.success) {
        setShowAddModal(false);
        setNewVehicle({
          make: '',
          model: '',
          year: new Date().getFullYear().toString(),
          vin: '',
          color: '',
          ruuviTagMac: '',
        });
        fetchVehicles();
        setAlertConfig({
          visible: true,
          title: 'Success',
          message: 'Vehicle added successfully',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to add vehicle',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (available: boolean) => {
    return available ? '#10B981' : '#F59E0B';
  };

  const getStatusLabel = (available: boolean) => {
    return available ? 'Available' : 'In Use';
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleText}>
            {item.year} {item.make} {item.model}
          </Text>
          <Text style={styles.licensePlate}>{item.color}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.available) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.available)}</Text>
        </View>
      </View>
      <Text style={styles.vin}>VIN: {item.vin}</Text>
    </View>
  );

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
        <View>
          <Text style={styles.title}>Vehicles</Text>
          <Text style={styles.subtitle}>{vehicles.length} total</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No vehicles registered</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add First Vehicle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vehicle</Text>

            <TextInput
              style={styles.input}
              placeholder="Make (e.g., Toyota)"
              value={newVehicle.make}
              onChangeText={(text) =>
                setNewVehicle({ ...newVehicle, make: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Model (e.g., Camry)"
              value={newVehicle.model}
              onChangeText={(text) =>
                setNewVehicle({ ...newVehicle, model: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Year"
              value={newVehicle.year}
              onChangeText={(text) =>
                setNewVehicle({ ...newVehicle, year: text })
              }
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="VIN *"
              value={newVehicle.vin}
              onChangeText={(text) =>
                setNewVehicle({ ...newVehicle, vin: text })
              }
              autoCapitalize="characters"
            />

            <TextInput
              style={styles.input}
              placeholder="Color *"
              value={newVehicle.color}
              onChangeText={(text) =>
                setNewVehicle({ ...newVehicle, color: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="RuuviTag MAC (optional)"
              value={newVehicle.ruuviTagMac}
              onChangeText={(text) =>
                setNewVehicle({ ...newVehicle, ruuviTagMac: text })
              }
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddVehicle}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Vehicle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={closeAlert}
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
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  vin: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
